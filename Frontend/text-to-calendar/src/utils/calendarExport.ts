import { CalendarEvent } from "../types/CalendarEvent";

export const exportToGoogleCalendar = (event: CalendarEvent) => {
	const startTime = event.startTime
		.toISOString()
		.replace(/-|:|\.\d\d\d/g, "");
	const endTime = event.endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

	//   const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
	//     event.title
	//   )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}`;
	const url = event.gcal_link;
	window.open(url, "_blank");
};

export const exportToOutlook = (event: CalendarEvent) => {
	const startTime = event.startTime.toISOString();
	const endTime = event.endTime.toISOString();

	const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
		event.title
	)}&startdt=${startTime}&enddt=${endTime}&body=${encodeURIComponent(
		event.description
	)}`;

	window.open(url, "_blank");
};

export const exportToAppleCalendar = (event: CalendarEvent) => {
	const startTime = event.startTime
		.toISOString()
		.replace(/-|:|\.\d\d\d/g, "");
	const endTime = event.endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

	const url = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;

	const link = document.createElement("a");
	link.href = encodeURI(url);
	link.download = "event.ics";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
