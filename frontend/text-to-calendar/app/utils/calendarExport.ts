import { CalendarEvent } from "@/app/types/CalendarEvent";

export const exportToGoogleCalendar = (event: CalendarEvent) => {
	const url = event.gcal_link;
	window.open(url, "_blank");
};

export const exportToOutlook = (event: CalendarEvent) => {
	const url = event.outlook_link;
	window.open(url);
};

// export const exportToAppleCalendar = (event: CalendarEvent) => {
// // 	const startTime = event.start_time
// // 		.toISOString()
// // 		.replace(/-|:|\.\d\d\d/g, "");
// // 	const endTime = event.endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

// // 	const url = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
// // VERSION:2.0
// // BEGIN:VEVENT
// // DTSTART:${startTime}
// // DTEND:${endTime}
// // SUMMARY:${event.title}
// // DESCRIPTION:${event.description}
// // END:VEVENT
// // END:VCALENDAR`;
// // event = event;
// // 	const link = document.createElement("a");
// // 	link.href = encodeURI(url);
// // 	link.download = "event.ics";
// // 	document.body.appendChild(link);
// // 	link.click();
// // 	document.body.removeChild(link);
// };
