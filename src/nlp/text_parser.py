import spacy
from datetime import datetime
from ..models.event import Event
from ..utils.date_parser import parse_datetime
from openai import OpenAI
import json

class TextToEventParser:
    def __init__(self, max_attempts: int = 2):
        self.client = OpenAI()
        self.max_attempts = max_attempts

    
    async def parse_text(self, text: str) -> Event:
        # send request to OpenAI API to extract event details into a JSON object
        response = await self.client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "developer",
                "content": """You are a backend NLP model that extracts structured event details from text. 
                Specifically, extract and return the following fields:
                
                - title: str
                - start_time: datetime
                - end_time: datetime
                - description: Optional[str] = None
                - location: Optional[str] = None
                - attendees: Optional[List[str]] = None
                - is_recurring: bool = False
                - recurrence_pattern: Optional[str] = None

                If you cannot find details for a specific field, return None for that field.
                Ensure that the extracted values are accurate and in the correct format."""
            },
            {"role": "user", "content": text}
        ],
        response_format=Event
        )
        
        try:
            return response.choices[0].message.content
        except Exception as e:
            print(f"Validation Error: {e}")  # Log validation error
            return None
