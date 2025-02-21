from flask import Flask, make_response, request, redirect, url_for
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime
import json

app = Flask(__name__)

# Define the scopes (permissions) your app needs
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# Helper function to authenticate the user
def authenticate_google():
    creds = None
    
    # Check if the token exists in the cookie
    token_json = request.cookies.get('google_auth_token')
    if token_json:
        creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
    
    # If no valid credentials, prompt the user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            flow.redirect_uri = 'http://localhost:5000/callback'  # Use backend callback for testing
            creds = flow.run_local_server(port=5000)
        
        # Save the credentials in a secure cookie
        response = make_response("Authentication successful!")
        response.set_cookie(
            'google_auth_token',
            value=creds.to_json(),
            secure=False,        # Set to False for local testing (no HTTPS)
            httponly=True,      # Prevent JavaScript access
            samesite='Strict',  # Prevent CSRF attacks
            max_age=3600        # 1 hour expiration
        )
        return response
    
    return creds

# Route to start the OAuth flow
@app.route('/login')
def login():
    return authenticate_google()

# Route to handle the OAuth callback
@app.route('/callback')
def callback():
    return authenticate_google()

# Route to add an event to Google Calendar
@app.route('/add-event')
def add_event():
    token_json = request.cookies.get('google_auth_token')
    if not token_json:
        return "Not authenticated", 401
    
    creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
    if not creds or not creds.valid:
        return "Invalid or expired credentials", 401
    
    # Add event logic
    service = build('calendar', 'v3', credentials=creds)
    
    event = {
        'summary': 'Test Event',
        'start': {
            'dateTime': datetime.now().isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': datetime.now().isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
    }
    
    event = service.events().insert(calendarId='primary', body=event).execute()
    return f"Event created: {event.get('htmlLink')}"

# Route to log out and clear the cookie
@app.route('/logout')
def logout():
    response = make_response("Logged out successfully!")
    response.set_cookie('google_auth_token', '', expires=0)  # Clear the cookie
    return response

# Run the Flask app
if __name__ == '__main__':
    app.run(port=5000)