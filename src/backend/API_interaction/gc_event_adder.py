"""
Google Calendar Integration API
Provides endpoints for authenticating with Google and managing calendar events.
"""
import json
import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union

from fastapi import FastAPI, Response, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel, validator
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("google_calendar_api")

# Environment Configuration
ENV = os.getenv("ENV", "development")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8004"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
CALLBACK_URL = os.getenv("CALLBACK_URL", "http://localhost:8004/callback")
TIMEZONE = os.getenv("TIMEZONE", "America/Los_Angeles")
DEBUG = ENV == "development"

# Constants
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
CLIENT_SECRET_PATH = os.path.join(os.path.dirname(__file__), 'client_secret.json')

# Request/Response Models
class EventRequest(BaseModel):
    title: str
    description: str
    start_time: str
    end_time: str

    @validator('start_time', 'end_time')
    def validate_datetime(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Invalid datetime format. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS)')

class EventResponse(BaseModel):
    message: str
    eventId: str
    htmlLink: Optional[str] = None

class AuthStatus(BaseModel):
    status: str
    email: Optional[str] = None
    expires: Optional[str] = None

# Initialize FastAPI app
app = FastAPI(
    title="Google Calendar Integration API",
    description="API for integrating with Google Calendar",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Functions
def get_credentials(request: Request, response: Optional[Response] = None) -> Optional[Credentials]:
    """
    Get and validate Google OAuth credentials from cookies
    
    Args:
        request: The FastAPI request object
        response: Optional response object for setting cookies
        
    Returns:
        Valid Google OAuth credentials or None
    """
    try:
        token_json = request.cookies.get('google_auth_token')
        if not token_json:
            return None
        
        creds = Credentials.from_authorized_user_info(json.loads(token_json), SCOPES)
        
        # Check if credentials need refreshing
        if not creds.valid:
            if creds.expired and creds.refresh_token:
                logger.info("Refreshing expired token")
                creds.refresh(GoogleRequest())
                # Update cookie if we have a response object
                if response:
                    response.set_cookie(
                        key='google_auth_token',
                        value=creds.to_json(),
                        httponly=True,
                        secure=ENV != "development",
                        samesite='lax',
                        max_age=3600
                    )
                return creds
            return None
        return creds
    except Exception as e:
        logger.error(f"Error getting credentials: {str(e)}")
        return None

def build_calendar_service(credentials: Credentials):
    """
    Build the Google Calendar API service
    
    Args:
        credentials: Valid Google OAuth credentials
        
    Returns:
        Google Calendar API service
    """
    return build('calendar', 'v3', credentials=credentials)

def format_event(event_request: EventRequest) -> Dict[str, Any]:
    """
    Format the event data for the Google Calendar API
    
    Args:
        event_request: The event data from the client
        
    Returns:
        Formatted event data for Google Calendar API
    """
    # Parse dates
    start_time = datetime.fromisoformat(event_request.start_time)
    end_time = datetime.fromisoformat(event_request.end_time)
    
    # If start and end time are the same, add 1 hour duration
    if start_time == end_time:
        end_time = start_time + timedelta(hours=1)
    
    return {
        'summary': event_request.title,
        'description': event_request.description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': TIMEZONE,
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': TIMEZONE,
        },
    }

def create_success_page() -> str:
    """Generate HTML for successful authentication"""
    return """
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
                // Notify the opener window that auth is complete
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage('google-auth-complete', '*');
                }
                
                // Close this window after a short delay
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

def create_error_page(error: str) -> str:
    """Generate HTML for authentication error"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Error</title>
        <style>
            body {{ font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }}
            .error {{ color: red; font-size: 24px; margin-bottom: 20px; }}
            .message {{ margin-bottom: 30px; }}
            .button {{ background-color: #f44336; border: none; color: white; padding: 15px 32px; 
                     text-align: center; text-decoration: none; display: inline-block; 
                     font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }}
        </style>
        <script>
            window.onload = function() {
                // Notify the opener window that auth failed
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage('google-auth-failed', '*');
                }
            };
        </script>
    </head>
    <body>
        <div class="error">✗ Authentication Error</div>
        <div class="message">Error: {error}</div>
        <button class="button" onclick="window.close()">Close Window</button>
    </body>
    </html>
    """

# Dependency for requiring authentication
async def require_auth(request: Request, response: Response) -> Credentials:
    """
    Dependency to require valid authentication
    
    Args:
        request: The FastAPI request object
        response: The FastAPI response object
        
    Returns:
        Valid Google OAuth credentials
        
    Raises:
        HTTPException: If user is not authenticated
    """
    creds = get_credentials(request, response)
    if not creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return creds

# API Endpoints
@app.post('/add-event', response_model=EventResponse)
async def add_event(
    event: EventRequest, 
    request: Request, 
    response: Response,
    credentials: Credentials = Depends(require_auth)
):
    """Add an event to Google Calendar"""
    try:
        logger.info(f"Adding event: {event.title}")
        
        # Format the event
        calendar_event = format_event(event)
        
        # Get calendar service
        service = build_calendar_service(credentials)
        
        # Create the event
        created_event = service.events().insert(calendarId='primary', body=calendar_event).execute()
        logger.info(f"Event created with ID: {created_event.get('id')}")
        
        return {
            "message": f"Event created: {created_event.get('htmlLink')}",
            "eventId": created_event.get('id'),
            "htmlLink": created_event.get('htmlLink')
        }
    except HttpError as e:
        logger.error(f"Google API error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete('/delete-event/{event_id}')
async def delete_event(
    event_id: str, 
    request: Request, 
    response: Response,
    credentials: Credentials = Depends(require_auth)
):
    """Delete an event from Google Calendar"""
    try:
        logger.info(f"Deleting event: {event_id}")
        
        # Get calendar service
        service = build_calendar_service(credentials)
        
        # Delete the event
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        logger.info(f"Event {event_id} deleted successfully")
        
        return {"message": "Event deleted successfully"}
    except HttpError as e:
        logger.error(f"Google API error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting event: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get('/login')
async def login(request: Request, response: Response):
    """Start the OAuth flow by redirecting to Google's authorization page"""
    try:
        # Check for client secret file
        if not os.path.exists(CLIENT_SECRET_PATH):
            logger.error(f"Client secret file not found at {CLIENT_SECRET_PATH}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Client secret file not found"
            )
        
        logger.info("Starting OAuth flow")
        
        # Create OAuth flow
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_PATH, SCOPES)
        flow.redirect_uri = CALLBACK_URL
        
        # Generate authorization URL with forced prompt
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Force user consent each time
        )
        
        logger.info(f"Redirecting to auth URL: {auth_url}")
        
        # Redirect to Google's auth page
        return RedirectResponse(url=auth_url)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get('/callback')
async def callback(request: Request, response: Response):
    """Handle the OAuth callback from Google"""
    try:
        # Get the authorization code
        code = request.query_params.get('code')
        if not code:
            logger.error("Missing authorization code in callback")
            raise ValueError("Missing authorization code")
        
        logger.info("Received authorization code")
        
        # Create OAuth flow
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_PATH, SCOPES)
        flow.redirect_uri = CALLBACK_URL
        
        # Exchange code for credentials
        flow.fetch_token(code=code)
        creds = flow.credentials
        logger.info("Successfully exchanged code for credentials")
        
        # Store credentials in cookie
        response.set_cookie(
            key='google_auth_token',
            value=creds.to_json(),
            httponly=True,
            secure=ENV != "development",  # Use secure cookies in production
            samesite='lax',
            max_age=3600  # 1 hour
        )
        
        # Return success page
        return HTMLResponse(content=create_success_page())
    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return HTMLResponse(
            content=create_error_page(str(e)),
            status_code=status.HTTP_401_UNAUTHORIZED
        )

@app.get('/check-auth', response_model=AuthStatus)
async def check_auth(request: Request, response: Response):
    """Check if the user is authenticated with Google"""
    try:
        creds = get_credentials(request, response)
        if not creds:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Get user info if available
        email = getattr(creds, 'id_token', {}).get('email', 'Unknown') if hasattr(creds, 'id_token') else None
        expires = creds.expiry.isoformat() if hasattr(creds, 'expiry') else None
        
        return {
            "status": "authenticated",
            "email": email,
            "expires": expires
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth check error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get('/logout')
async def logout(response: Response):
    """Log out the user by clearing credentials"""
    response.delete_cookie('google_auth_token')
    logger.info("User logged out")
    return {"message": "Logged out successfully"}

@app.get('/')
async def root():
    """Root endpoint with API information"""
    return {
        "api": "Google Calendar Integration API",
        "version": "1.0.0",
        "docs": "/docs" if DEBUG else "Disabled in production"
    }

# Health check endpoint
@app.get('/health')
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == '__main__':
    # Verify client secret file exists
    if not os.path.exists(CLIENT_SECRET_PATH):
        logger.error(f"Client secret file not found at: {CLIENT_SECRET_PATH}")
        print(f"ERROR: client_secret.json not found at: {CLIENT_SECRET_PATH}")
    else:
        logger.info(f"Client secret file found at: {CLIENT_SECRET_PATH}")
        print(f"Starting server. Client secret found at: {CLIENT_SECRET_PATH}")
    
    import uvicorn
    uvicorn.run(
        app, 
        host=API_HOST, 
        port=API_PORT,
        log_level="info"
    )
