from fastapi import FastAPI, Response, Request, HTTPException
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import json
import os

app = FastAPI()

# Define the scopes (permissions) your app needs
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# Get the absolute path to the client_secret.json file
CLIENT_SECRET_PATH = os.path.join(os.path.dirname(__file__), 'client_secret.json')
print(f"Looking for client_secret.json at: {CLIENT_SECRET_PATH}")

# Print the current working directory
print(f"Current working directory: {os.getcwd()}")

# Helper function to authenticate the user
def authenticate_google(request: Request, response: Response):
    print('function authenticate_google called')
    creds = None
    
    # Check if the token exists in the cookie
    token_json = request.cookies.get('google_auth_token')
    if token_json:
        print('Found token in cookie')
        try:
            creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
            print('Loaded credentials from cookie')
        except ValueError as e:
            print(f"Error loading credentials from cookie: {e}")
            creds = None
    
    # If no valid credentials, prompt the user to log in
    if not creds or not creds.valid:
        print('No valid credentials found, starting OAuth flow')
        if creds and creds.expired and creds.refresh_token:
            print('Credentials expired but refresh token available, refreshing...')
            creds.refresh(GoogleRequest())
            print('Credentials refreshed successfully')
        else:
            print('No valid credentials or refresh token, starting new OAuth flow')
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_PATH, SCOPES)  # Use the absolute path
            flow.redirect_uri = 'http://localhost:8004/callback'  # Update the port to 8004
            print(f"Using redirect_uri: {flow.redirect_uri}")
            
            # Generate the authorization URL with access_type and prompt
            authorization_url, state = flow.authorization_url(
                access_type='offline',  # Request offline access
                include_granted_scopes='true',  # Incremental authorization
                login_hint='hint@example.com',  # Optional login hint
                # prompt='consent'       # Force consent screen
            )
            print(f"Authorization URL: {authorization_url}")
            
            # Run the local server to handle the OAuth callback
            creds = flow.run_local_server(port=8004)
            print('OAuth flow completed, credentials received')
        
        # Check if refresh_token is present
        if not creds.refresh_token:
            print("Warning: No refresh token found in credentials.")
        else:
            print("Refresh token found in credentials.")
        
        # Debug: Print the credentials
        print(f"Credentials: {creds.to_json()}")
        
        # Save the credentials in a secure cookie
        response.set_cookie(
            key='google_auth_token',
            value=creds.to_json(),
            httponly=True,      # Prevent JavaScript access
            secure=False,       # Set to False for local testing (no HTTPS)
            samesite='strict',  # Prevent CSRF attacks
            max_age=3600        # 1 hour expiration
        )
        print('Credentials saved in cookie')
        return creds
    
    print('Valid credentials found, returning existing credentials')
    return creds

# Route to start the OAuth flow
@app.get('/login')
async def login(request: Request, response: Response):
    creds = authenticate_google(request, response)
    return {"message": "Authentication successful!"}

# Route to handle the OAuth callback
@app.get('/callback')
async def callback(request: Request, response: Response):
    creds = authenticate_google(request, response)
    return {"message": "Callback handled successfully!"}

# Route to add an event to Google Calendar
@app.get('/add-event')
async def add_event(request: Request):
    token_json = request.cookies.get('google_auth_token')
    if not token_json:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
    if not creds or not creds.valid:
        raise HTTPException(status_code=401, detail="Invalid or expired credentials")
    
    # Add event logic
    service = build('calendar', 'v3', credentials=creds)
    
    event = {
        'summary': 'Test Event',
        'start': {
            'dateTime': datetime.now().isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': (datetime.now() + timedelta(hours=1)).isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
    }
    
    event = service.events().insert(calendarId='primary', body=event).execute()
    return {"message": f"Event created: {event.get('htmlLink')}"}

# Route to log out and clear the cookie
@app.get('/logout')
async def logout(response: Response):
    response.delete_cookie('google_auth_token')
    return {"message": "Logged out successfully!"}

# Run the FastAPI app
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)