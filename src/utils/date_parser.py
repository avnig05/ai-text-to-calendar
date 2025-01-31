from datetime import datetime
from dateutil.parser import parse
from typing import Tuple, Optional
# from models.event import Event

def parse_datetime(text: str) -> Optional[datetime]:
    try:
        return parse(text)
    except ValueError as ve:
        print(f"Error parsing datetime: {ve}")
        return None

def extract_date_range(text: str) -> Tuple[datetime, datetime]:
    # TODO: Implement smart date range extraction
    pass

def parse_recurring_pattern(event) -> str:
    if event.is_recurring and event.recurrence_pattern:
        recurrence_rule = f"RRULE:FREQ={event.recurrence_pattern}"
        
        # Add specific days for weekly recurrence
        if event.recurrence_pattern == "WEEKLY" and event.recurrence_days:
            recurrence_rule += f";BYDAY={','.join(event.recurrence_days)}"

        # Add recurrence count if specified
        if event.recurrence_count:
            recurrence_rule += f";COUNT={event.recurrence_count}"

        # Add recurrence end date if specified
        if event.recurrence_end_date:
            recurrence_rule += f";UNTIL={event.recurrence_end_date.strftime('%Y%m%d')}"
    else:
        recurrence_rule = None  # No recurrence
    return recurrence_rule
