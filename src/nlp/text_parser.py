import spacy
from datetime import datetime
from models.event import Event
from utils.date_parser import parse_datetime
from openai import OpenAI
import json

class TextToEventParser:
    def __init__(self):
        self.client = OpenAI()
    
    def parse_text(self, text: str) -> Event:
        # send request to OpenAI API to extract event details into a JSON object
        response = self.client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """You are a backend NLP model that extracts structured event details from text. 
                Specifically, extract and return into a json format the following fields:
                
                - title: str
                - start_time: datetime
                - end_time: datetime
                - description: Optional[str] 
                - location: Optional[str] 
                - attendees: Optional[List[str]] 
                - is_recurring: bool 
                - recurrence_pattern: Optional[str] 

                If you cannot find details for a specific field, return None for that field.
                Ensure that the extracted values are accurate and in the correct format."""
            },
            {"role": "user", "content": text}
        ],
        response_format={'type': "json_object"}
        )
        
        event_data =json.loads(response.choices[0].message.content)
        
        event = Event(
                title=event_data.get("title"),
                # start_time=parse_datetime(event_data.get("start_time")),
                start_time=event_data.get("start_time"),
                # end_time=parse_datetime(event_data.get("end_time")),
                end_time=event_data.get("end_time"),
                description=event_data.get("description"),
                location=event_data.get("location"),
                attendees=event_data.get("attendees", []),  # Defaults to empty list
                is_recurring=event_data.get("is_recurring", False),
                recurrence_pattern=event_data.get("recurrence_pattern")
                )        

        return event
