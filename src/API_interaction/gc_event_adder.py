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
    creds = None
    
    # Check if the token exists in the cookie
    token_json = request.cookies.get('google_auth_token')
    if token_json:
        creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
    
    # If no valid credentials, prompt the user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_PATH, SCOPES)  # Use the absolute path
            flow.redirect_uri = 'http://localhost:8004/callback'  # Update the port to 8004
            print(f"Using redirect_uri: {flow.redirect_uri}")
            creds = flow.run_local_server(port=8004)
        
        # Save the credentials in a secure cookie
        response.set_cookie(
            key='google_auth_token',
            value=creds.to_json(),
            httponly=True,      # Prevent JavaScript access
            secure=False,       # Set to False for local testing (no HTTPS)
            samesite='strict',  # Prevent CSRF attacks
            max_age=3600        # 1 hour expiration
        )
        return creds
    
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