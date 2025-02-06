import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import event_generation.event.date_parser as dp
from icalendar import Calendar, Event as IcalEvent  # vRecur
from urllib.parse import quote
from zoneinfo import ZoneInfo


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
    gcal_link: Optional[str] = None
    outlook_link: Optional[str] = None

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
        event.add(
            "description", self.description if self.description else "No Description"
        )
        # Ensure a globally unique event ID
        event.add("uid", str(uuid.uuid4()))

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

    def set_gcal_link(self):
        # parsed_event.write_to_icalevent("test.ics")
        # https://calendar.google.com/calendar/render?action=TEMPLATE
        # &text=AM%20112%20-%20Intro%20to%20PDEs%20Lecture
        # &dates=20250130T232000Z/20250131T005500Z
        # &details=Lecture%20for%20AM%20112%20-%20Intro%20to%20Partial%20Differential%20Equations.
        # &location=Porter%20Acad%20144
        # &ctz=America/Los_Angeles
        recurrence_rule = dp.parse_recurring_pattern(self)

        gcal_link = (
            f"https://www.google.com/calendar/render?action=TEMPLATE"
            f"&text={self.title}"
            f"&dates={self.get_start_time()}/{self.get_end_time()}"
        )
        if self.description:
            gcal_link += f"&details={self.description}"
        if self.location:
            gcal_link += f"&location={self.location}"
        if self.attendees:
            gcal_link += f"&add={','.join(self.attendees)}"

        gcal_link += f"&ctz={self.time_zone}"

        if recurrence_rule:
            gcal_link += f"&recur={recurrence_rule}"

        gcal_link = gcal_link.replace(" ", "+")
        self.gcal_link = gcal_link

    def set_outlook_link(self):
        # Parse recurrence rule if needed
        recurrence_rule = dp.parse_recurring_pattern(self)

        # Ensure proper datetime format for outlook links (ISO 8601)
        # Parse the non-standard date string using strptime:
        sdt = datetime.strptime(self.get_start_time(), "%Y%m%dT%H%M%S")
        edt = datetime.strptime(self.get_end_time(), "%Y%m%dT%H%M%S")

        # Convert the time to UTC
        # (this assumes that the parsed datetime is in the local timezone)
        utc_sdt = sdt.astimezone(ZoneInfo("UTC"))
        utc_edt = edt.astimezone(ZoneInfo("UTC"))

        # Format it to the string Outlook expects:
        start_dt = utc_sdt.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_dt = utc_edt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Base Outlook link
        outlook_link = (
            f"https://outlook.live.com/owa/?path=/calendar/action/"
            f"compose&rru=addevent"
            f"&subject={quote(self.title)}"
            f"&startdt={start_dt}"
            f"&enddt={end_dt}"
        )

        # Add optional details with proper URL encoding
        if self.description:
            outlook_link += f"&body={quote(self.description)}"
        if self.location:
            outlook_link += f"&location={quote(self.location)}"
            # URL-encode attendees list
        if self.attendees:
            outlook_link += f"&to={quote(','.join(self.attendees))}"

        # Handle recurrence if applicable
        # TODO may need to fix the recurrence rule format
        if recurrence_rule:
            outlook_link += f"&recurrence={quote(recurrence_rule)}"

        # Assign to object
        self.outlook_link = outlook_link

    def get_start_time(self):
        start_str = self.start_time.strftime("%Y%m%dT%H%M%S")
        return start_str

    def get_end_time(self):
        end_str = self.end_time.strftime("%Y%m%dT%H%M%S")
        return end_str

    def get_end_date(self):
        end_str = self.recurrence_end_date.strftime("%Y%m%d")
        return end_str

    def __str__(self):
        event_str = f"Title: {self.title}\n"
        event_str += f"Start Time: {self.start_time}\n"
        event_str += f"End Time: {self.end_time}\n"
        event_str += f"Time Zone: {self.time_zone}\n"
        event_str += f"Description: {self.description}\n"
        event_str += f"Location: {self.location}\n"
        event_str += f"Attendees: {self.attendees}\n"
        event_str += f"Is Recurring: {self.is_recurring}\n"
        event_str += f"Recurrence Pattern: {self.recurrence_pattern}\n"
        event_str += f"Recurrence Days: {self.recurrence_days}\n"
        event_str += f"Recurrence Count: {self.recurrence_count}\n"
        event_str += f"Recurrence End Date: {self.recurrence_end_date}\n"
        event_str += f"Google Calendar Link: {self.gcal_link}\n"
        event_str += f"Outlook Calendar Link: {self.outlook_link}\n"
        event_str += f"Yahoo Calendar Link: {self.yahoo_link}\n"
        return event_str
