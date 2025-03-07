export interface CalendarEvent {
	title: string;
	time_zone: string;
	start_time: string;
	end_time: string;
	description: string;
	location: string;
	attendees: Array<string>;
	gcal_link: string;
	outlook_link: string;
	ics_string: string;
}
