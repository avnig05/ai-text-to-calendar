export interface CalendarEvent {
	gcal_link: URL;
	outlook_link: URL;
	title: string;
	description: string;
	startTime: Date;
	endTime: Date;
}
