from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os.path

# Define the scopes (permissions) your app needs
SCOPES = ['https://www.googleapis.com/auth/calendar']

def authenticate_google():
    creds = None
    # Check if token.json exists (saved credentials)
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If no valid credentials, prompt the user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret_1076750959595-6p8sn7uflm3r6bc8h2ed3un9r0d7o5ni.apps.googleusercontent.com.json', SCOPES)
            # Set the redirect URI explicitly
            flow.redirect_uri = 'http://127.0.0.1:8082/oauth2callback'
            creds = flow.run_local_server(port=8082)  # Use port 8081
        # Save the credentials for future use
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def add_event_to_calendar(creds, event_name, start_time, end_time):
    service = build('calendar', 'v3', credentials=creds)

    event = {
        'summary': event_name,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'America/Los_Angeles',  # Adjust to your timezone
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'America/Los_Angeles',
        },
    }

    event = service.events().insert(calendarId='primary', body=event).execute()
    print(f"Event created: {event.get('htmlLink')}")

def main():
    # Step 1: Authenticate the user
    creds = authenticate_google()

    # Step 2: Define event details (for testing)
    event_name = "Test Event"
    start_time = "2023-10-10T19:00:00-07:00"  # Replace with your desired start time
    end_time = "2023-10-10T20:00:00-07:00"    # Replace with your desired end time

    # Step 3: Add the event to Google Calendar
    add_event_to_calendar(creds, event_name, start_time, end_time)

if __name__ == '__main__':
    main()