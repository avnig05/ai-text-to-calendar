# Standard library imports
from datetime import datetime
import json
import logging
import sys
import os
import traceback
from pathlib import Path

# Add this block before other imports to modify Python path
src_path = str(Path(__file__).resolve().parent.parent)
if src_path not in sys.path:
    sys.path.append(src_path)

# Third-party imports
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import ValidationError
import tzlocal as tz

# Local application imports
from models.event import Event
from utils.date_parser import parse_datetime
from utils.readenv import get_openai_key


logging.basicConfig(level=logging.ERROR)  # Configure logging

class TextToEventParser:
    def __init__(self):
        # Initialize OpenAI client with API key
        self.client = OpenAI(api_key=get_openai_key())

    def parse_text(self, text: str) -> Event:
        """Parses text input to extract event details using OpenAI API.
        This method takes a text description of an event and uses OpenAI's API to extract structured event details,
        converting them into an Event object with standardized fields.
        Args:
            text (str): Natural language text describing an event.
        Returns:
            Event: An Event object containing the structured event details including:
                - title (str)
                - start_time (datetime)
                - time_zone (str)
                - end_time (datetime)
                - description (str, optional)
                - location (str, optional)
                - attendees (List[str], optional)
                - is_recurring (bool)
                - recurrence_pattern (str, optional)
                - recurrence_days (List[str], optional)
                - recurrence_count (int, optional)
                - recurrence_end_date (datetime, optional)
        Raises:
            ConnectionError: If there is an issue connecting to the OpenAI API
            ValueError: If the response is missing required fields or contains invalid data
            ValidationError: If the event data fails validation
            Exception: For any other unexpected errors
        Notes:
            - Uses the current time and timezone for interpreting relative dates
            - Handles recurring events with various patterns (daily, weekly, monthly, yearly)
            - Automatically fills in missing end times based on context
            - Converts relative dates to absolute dates
            - Processes both single and recurring events
        """
        
        # send request to OpenAI API to extract event details into a JSON object
        try:
            # get current time up to the minute for relative date calculations
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Format as YYYY-MM-DD HH:MM:SS       print("sending request to OpenAI API: ", text)
            current_time_zone = tz.get_localzone()
            
            print("\nsending request to OpenAI API: ", text)
            print()
            print("current time is: ", current_time)
            print(f"Current Timezone: {current_time_zone}")
            print()
            
            print("\nwaiting on response from OpenAI API...")
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are an AI that extracts structured event details from text. 
                        The current time is: **{current_time}** and the current timezone is: **{current_time_zone}**. Use this to interpret relative dates.

                        - If a date is relative (e.g., "tomorrow at 2pm"), convert it into an absolute datetime based on the current time.
                        - If a date is given without a time (e.g., "March 15"), assume **the time is 00:00 (midnight)**.
                        - If the date is given in a range (e.g., "March 15-17"), assume it's a multi-day event that with a starts on the first date and ends on the last date.
                        - If only a time is given (e.g., "at 2pm"), assume **it refers to today** unless the event is clearly in the future.

                        Extract and return in JSON format:
                        
                        - title: str **a title is required never leave it null**
                        - start_time: ISO 8601 datetime format (e.g., "20250130T232000") but only accurate to the minute, set seconds to 00 **a starttime is required never leave it null** 
                        - time_zone: str, representing the timezone of the event eg: "America/Los_Angeles" **a timezone is required never leave it null**
                            -- default to none if not specified.
                        - end_time: ISO 8601 datetime format (e.g., "20250130T232000") but only accurate to the minute, set seconds to 00 **an endtime is required never leave it null**
                            -- if the end time is not specified, use context to make a best guess and assume that either the event is 1 hour long or is an all-day event ending at 23:59.
                            -- if the end time is specified without a date, assume it has the same date as the start time.
                            -- if the date is given without a time, assume the event is an all-day event and ends at 23:59 on that date.
                            -- if the duration is specified, calculate the end time based on the start time.
                        - description: Optional[str] 
                            -- if any links are provided, include them in the description. with a quick summary of what they are.
                            -- if there is no description provided and there is enough context to generate one, generate a description. otherwise leave it null
                        - location: Optional[str] 
                        - attendees: Optional[List[str]] 
                            -- if any email addresses are provided, include them in the attendees list.
                            -- if there are no email addresses provided leave it the list empty.
                        - is_recurring: bool 
                            -- if the event is recurring, set this to true. and provide the recurrence pattern, if the pattern is not specified, assume it's a weekly event.
                            -- if the recurrence is not specified, assume it's a one-time event.
                        - recurrence_pattern: Optional[str] 
                            -- if the event is recurring, provide the recurrence pattern. otherwise, leave it null.
                            -- recurrence patterns should only be in the following formats:
                                ---DAILY, WEEKLY, MONTHLY, YEARLY
                        -recurrence_days: Optional[List[str]]
                            -- if the event is recurring, provide the days of the week it occurs on. otherwise, leave it null.
                            -- reccurance_days should only be in the following formats:
                                --MO, TU, WE, TH, FR, SA, SU
                        -recurrence_count: Optional[int]
                            -- if the event is recurring, try to tell if the user specifies the number of recurrences or the end date, if the number of recurrences is specified, provide it. otherwise, leave it null.
                        -recurrence_end_date: Optional[str] Should be in just Date format YYYYMMDD (e.g., "20250130") 
                            -- if the event is recurring, provide the end date of the recurrence. otherwise, leave it null to indicate that the recurrence is indefinite.

                        If any field is missing, return null.
                        """
                    },
                    {"role": "user", "content": text}
                ],
                response_format={'type': "json_object"}
            )
            
        # catch any errors gracefully
        except ConnectionError as ce:
            logging.error("Connection error while sending request to OpenAI API: %s", ce)
            return "A connection error occurred while communicating with OpenAI API. Please check your internet connection."

        except ValueError as ve:
            logging.error("Invalid input or response from OpenAI: %s", ve)
            return "An error occurred due to an invalid input or response from OpenAI API."

        except Exception as e:
            logging.error("Unexpected error: %s", e)
            return f"An unexpected error occurred: {e}"
        
        # Parse the response from OpenAI API into a JSON object
        try:
            event_data = json.loads(response.choices[0].message.content)

            # Ensure required fields exist
            if not event_data.get("title") or not event_data.get("start_time"):
                raise ValueError("Missing required fields: 'title' and/or 'start_time'")

            # Create Event object by parsing Json fields
            event = Event(
                title=event_data.get("title"),
                start_time=parse_datetime(event_data.get("start_time")),  # Convert to datetime
                time_zone=str(current_time_zone) if not event_data.get("time_zone") else event_data.get("time_zone"),
                end_time=parse_datetime(event_data.get("end_time")),
                description=event_data.get("description", " "),
                location=event_data.get("location", " "),
                attendees=event_data.get("attendees", []),
                is_recurring = event_data.get("is_recurring", False),
                recurrence_pattern = event_data.get("recurrence_pattern"),
                recurrence_days = event_data.get("recurrence_days"),
                recurrence_count = event_data.get("recurrence_count"),
                recurrence_end_date = parse_datetime(event_data.get("recurrence_end_date")) if event_data.get("recurrence_end_date") else None
            )
            
        # Catch any errors gracefully
        except ValueError as ve:
            logging.error("ValueError: %s", ve, exc_info=True)
            print(f"Error: {ve}")  # Log to console for debugging
            return f"Invalid event data: {ve}"

        except ValidationError as ve:
            logging.error("Pydantic Validation Error: %s", ve, exc_info=True)
            print(f"Pydantic Validation Error: {ve}")
            return f"Event data validation failed: {ve}"

        except Exception as e:
            error_trace = traceback.format_exc()  # Capture full stack trace
            logging.error("Unexpected Error: %s\n%s", e, error_trace)
            print(f"Unexpected error: {e}\n{error_trace}")
            return "An unexpected error occurred. Please check the logs."

        return event
