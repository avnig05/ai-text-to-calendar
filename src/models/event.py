import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import utils.date_parser as dp
from icalendar import Calendar, Event as IcalEvent, vRecur 


class Event(BaseModel):
    title: str = "No Title"
    start_time: datetime = None
    time_zone: str = "America/Los_Angeles"
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[List[str]] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = ""
    recurrence_days: Optional[List[str]] = None
    recurrence_count: Optional[int] = None
    recurrence_end_date: Optional[datetime] = None
    


    def write_to_icalevent(self, file_name: str):
        cal = Calendar()  # Create a calendar object
        cal.add("prodid", "-//My Event Calendar//mxm.dk//")
        cal.add("version", "2.0")

        event = IcalEvent()  # Create an event object
        event.add("summary", self.title)
        event.add("dtstart", self.start_time)
        event.add("dtend", self.end_time if self.end_time else self.start_time)
        event.add("dtstamp", datetime.now())
        event.add("location", self.location if self.location else "No Location")
        event.add("description", self.description if self.description else "No Description")
        event.add("uid", str(uuid.uuid4()))  # Ensure a globally unique event ID


        # Add attendees if available
        if self.attendees:
            for attendee in self.attendees:
                event.add("attendee", f"mailto:{attendee}")

        # Add recurrence rule if the event is recurring
        rrule = dp.get_ical_rrule(self)
        if rrule:
            event["RRULE"] = rrule

        # Add the event to the calendar
        cal.add_component(event)

        # Save the calendar to an .ics file
        with open(file_name, "wb") as f:
            f.write(cal.to_ical())

        print(f"iCalendar file created: {file_name}")
    
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
            f"&dates={self.get_start_time()}/{self.get_end_time()}"
        )
        if self.description:
            gcal_link += f"&details={self.description}"
        if self.location:
            gcal_link += f"&location={self.location}"
        
        gcal_link+=f"&ctz={self.time_zone}"
        
        if recurrence_rule:
            gcal_link += f"&recur={recurrence_rule}"
        
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
    
