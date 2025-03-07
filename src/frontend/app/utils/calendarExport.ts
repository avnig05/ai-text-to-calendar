import { CalendarEvent } from "@/app/types/CalendarEvent";

export const exportToGoogleCalendar = (event: CalendarEvent) => {
	const url = event.gcal_link;
	window.open(url, "_blank");
};

export const exportToOutlook = (event: CalendarEvent) => {
	const url = event.outlook_link;
	window.open(url, "_blank");
};

export const exportToICal = (event: CalendarEvent) => {
	// load the calendar string as a blob
	const icsContent = event.ics_string.replace(/\r?\n/g, "\r\n");
	const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
	// generate a URL and an anchor element`
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	const fileName = event.title.replace(/ /g, "_");

	anchor.href = url;
	anchor.download = `${fileName}.ics`;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
};
