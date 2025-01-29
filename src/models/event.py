from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class Event(BaseModel):
    title: Optional[str] = "No Title"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[List[str]] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    
    # @field_validator("start_time", "end_time", mode="before")
    # @classmethod
    # def parse_datetime(cls, value):
    #     """Ensure date values are in ISO 8601 format"""
    #     if isinstance(value, str):
    #         try:
    #             return datetime.fromisoformat(value)
    #         except ValueError:
    #             raise ValueError(f"Invalid datetime format: {value}. Expected ISO 8601 format.")
    #     return value

    # # ✅ New Pydantic v2 model validation (checks multiple fields together)
    # @model_validator(mode="after")
    # def validate_dates(self):
    #     """Ensure start_time is before end_time"""
    #     if self.start_time >= self.end_time:
    #         raise ValueError("end_time must be after start_time")
    #     return self

    # # ✅ Ensuring attendees is always a list (if missing or incorrect type)
    # @field_validator("attendees", mode="before")
    # @classmethod
    # def ensure_list(cls, value):
    #     """Ensure attendees is always a list, even if missing"""
    #     if value is None:
    #         return []
    #     if isinstance(value, list):
    #         return value
    #     raise ValueError("Attendees must be a list of strings.")
