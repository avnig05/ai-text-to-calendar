from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import utils.date_parser as dp


class Event(BaseModel):
    title: str = "No Title"
    start_time: datetime = None
    time_zone: str = "America/Los_Angeles"
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[List[str]] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    recurrence_days: Optional[List[str]] = None
    recurrence_count: Optional[int] = None
    recurrence_end_date: Optional[datetime] = None
    
    def write_to_icalevent(self, file_name):
        # BEGIN:VCALENDAR
        # VERSION:2.0
        # BEGIN:VEVENT
        # UID:2025-01-31T01:10:12.281Z@example.com
        # DTSTAMP:20250131T011012Z
        # DTSTART:20250130T232000Z
        # DTEND:20250131T005500Z
        # SUMMARY:AM 112 - Intro to PDEs Lecture
        # DESCRIPTION:Course Title: AM 112 - Intro to PDEs, Instructor: Hongyun Wang.
        # LOCATION:Porter Acad 144
        # END:VEVENT
        # END:VCALENDAR
        with open(file_name, 'w') as f:
            f.write("BEGIN:VCALENDAR\n")
            f.write("VERSION:2.0\n")
            f.write("BEGIN:VEVENT\n")
            f.write(f"SUMMARY:{self.title}\n")
            f.write(f"DTSTART:{self.start_time.strftime('%Y%m%dT%H%M%S')}\n")
            f.write(f"DTEND:{self.end_time.strftime('%Y%m%dT%H%M%S')}\n")
            f.write(f"DESCRIPTION:{self.description}\n")
            f.write(f"LOCATION:{self.location}\n")
            f.write(f"ATTENDEES:{','.join(self.attendees)}\n")
            f.write("END:VEVENT\n")
            f.write("END:VCALENDAR\n")
    
    def get_gcal_link(self):
        # parsed_event.write_to_icalevent("test.ics")
        # https://calendar.google.com/calendar/render?action=TEMPLATE
        # &text=AM%20112%20-%20Intro%20to%20PDEs%20Lecture
        # &dates=20250130T232000Z/20250131T005500Z
        # &details=Lecture%20for%20AM%20112%20-%20Intro%20to%20Partial%20Differential%20Equations.
        # &location=Porter%20Acad%20144
        # &ctz=America/Los_Angeles
        
        recurrence_rule = dp.parse_recurring_pattern(self)

        gcal_link=(
            f"https://www.google.com/calendar/render?action=TEMPLATE"
            f"&text={self.title}"
            f"&dates={self.get_start_time()}/{self.get_start_time()}"
            f"&details={self.description}"
            f"&location={self.location}&"
            f"ctz={self.time_zone}"
            f"&recur={recurrence_rule}"
        )
        gcal_link = gcal_link.replace(' ', '+')
        return gcal_link
    
    def get_outlook_link(self):
        # https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent
        # &subject=AM%20112%20-%20Intro%20to%20PDEs%20Lecture
        # &startdt=2025-01-30T23:20:00Z
        # &enddt=2025-01-31T00:55:00Z
        # &body=Course%20Title%3A%20AM%20112%20-%20Intro%20to%20PDEs%2C%20Instructor%3A%20Hongyun%20Wang.
        # &location=Porter%20Acad%20144
        pass
    
    def get_yahoo_link(self):
        # https://calendar.yahoo.com/?v=60&view=d&type=20
        # &title=AM%20112%20-%20Intro%20to%20PDEs%20Lecture
        # &st=20250130T232000Z
        # &et=20250131T005500Z
        # &desc=Course%20Title%3A%20AM%20112%20-%20Intro%20to%20PDEs%2C%20Instructor%3A%20Hongyun%20Wang.
        # &in_loc=Porter%20Acad%20144
        pass
    
    def get_start_time(self):
        start_str = self.start_time.strftime('%Y%m%dT%H%M%S')
        return start_str
    def get_end_time(self):
        end_str = self.end_time.strftime('%Y%m%dT%H%M%S')
        return end_str
    def get_end_date(self):
        end_str = self.recurrence_end_date.strftime('%Y%m%d')
        return end_str
    
