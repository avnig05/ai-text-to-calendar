export interface CalendarEvent {
	title: string;
	start_time: Date;
	time_zone: string;
	end_time: Date;
	description: string;
	gcal_link: URL;
	outlook_link: URL;
}
