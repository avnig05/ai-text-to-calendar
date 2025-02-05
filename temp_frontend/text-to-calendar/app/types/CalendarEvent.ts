export interface CalendarEvent {
	title: string;
	description: string;
	startTime: Date;
	endTime: Date;
	// gcal_link: string;
	gcal_link: URL;
	outlook_link: URL;
}
