from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

@dataclass
class Event:
    title: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: List[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
