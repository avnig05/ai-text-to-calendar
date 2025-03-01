from fastapi import FastAPI, Response, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import os

class EventRequest(BaseModel):
    title: str
    description: str
    start_time: str
    end_time: str

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the scopes (permissions) your app needs
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# Get the absolute path to the client_secret.json file
CLIENT_SECRET_PATH = os.path.join(os.path.dirname(__file__), 'client_secret.json')
print(f"Looking for client_secret.json at: {CLIENT_SECRET_PATH}")

# Helper function to authenticate the user
def authenticate_google(request: Request, response: Response):
    try:
        creds = None
        token_json = request.cookies.get('google_auth_token')
        
        if token_json:
            print("Found existing token in cookies")
            creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                print("Refreshing expired token")
                creds.refresh(GoogleRequest())
            else:
                if not os.path.exists(CLIENT_SECRET_PATH):
                    print(f"ERROR: client_secret.json not found at {CLIENT_SECRET_PATH}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"client_secret.json not found at {CLIENT_SECRET_PATH}"
                    )
                
                print("Starting OAuth flow")
                flow = InstalledAppFlow.from_client_secrets_file(
                    CLIENT_SECRET_PATH, SCOPES)
                flow.redirect_uri = 'http://localhost:8004/callback'
                creds = flow.run_local_server(port=8004)
                print("OAuth flow completed successfully")

            response.set_cookie(
                key='google_auth_token',
                value=creds.to_json(),
                httponly=True,
                secure=False,
                samesite='lax',
                max_age=3600
            )
            print("Set new token in cookies")
        return creds
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))

@app.post('/add-event')
async def add_event(request: Request, response: Response, event: EventRequest):
    try:
        print(f"Received event: {event}")
        creds = authenticate_google(request, response)
        
        # Parse the datetime strings
        start_time = datetime.fromisoformat(event.start_time)
        end_time = datetime.fromisoformat(event.end_time)
        
        # If start and end time are the same, add 1 hour duration
        if start_time == end_time:
            end_time = start_time + timedelta(hours=1)

        service = build('calendar', 'v3', credentials=creds)
        
        calendar_event = {
            'summary': event.title,
            'description': event.description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/Los_Angeles',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/Los_Angeles',
            },
        }

        print(f"Creating event: {json.dumps(calendar_event, default=str)}")
        created_event = service.events().insert(calendarId='primary', body=calendar_event).execute()
        print(f"Event created successfully with ID: {created_event.get('id')}")
        
        return {
            "message": f"Event created: {created_event.get('htmlLink')}",
            "eventId": created_event.get('id')
        }
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        if 'invalid_grant' in str(e) or 'unauthorized' in str(e).lower():
            raise HTTPException(status_code=401, detail="Authentication required")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/delete-event/{event_id}')
async def delete_event(event_id: str, request: Request, response: Response):
    try:
        creds = authenticate_google(request, response)
        service = build('calendar', 'v3', credentials=creds)
        
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        if 'invalid_grant' in str(e) or 'unauthorized' in str(e).lower():
            raise HTTPException(status_code=401, detail="Authentication required")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/login')
async def login(request: Request, response: Response):
    try:
        authenticate_google(request, response)
        # Redirect back to the frontend
        return {"message": "Authentication successful! You can close this window and return to the app."}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get('/callback')
async def callback(request: Request, response: Response):
    try:
        authenticate_google(request, response)
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication Successful</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                .success { color: green; font-size: 24px; margin-bottom: 20px; }
                .message { margin-bottom: 30px; }
                .button { background-color: #4CAF50; border: none; color: white; padding: 15px 32px; 
                         text-align: center; text-decoration: none; display: inline-block; 
                         font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }
            </style>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                };
            </script>
        </head>
        <body>
            <div class="success">✓ Authentication Successful!</div>
            <div class="message">You can now close this window and return to the app.</div>
            <div>This window will close automatically in 3 seconds.</div>
            <button class="button" onclick="window.close()">Close Window</button>
        </body>
        </html>
        """
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get('/logout')
async def logout(response: Response):
    response.delete_cookie('google_auth_token')
    return {"message": "Logged out successfully!"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
