import { CalendarEvent } from "@/app/types/CalendarEvent";

// Use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.calendarize.ratcliff.cc';
const API_EVENT = API_BASE_URL + "/convert";


export const generateEvent = async (
									text: string,
									img?: File // <-- Make the file argument optional
									): Promise<CalendarEvent[]> => {
	try {
		const local_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const local_time = new Date().toLocaleString("sv-SE", { timeZone: local_tz }).replace(" ", "T") + "Z";

		console.log("prompt:", text);
		console.log("file:", img);
		console.log("local time:", local_time, local_tz);
		console.log("Sending request to backend:", API_EVENT);

		const formData = new FormData();

		// Append text fields
		formData.append("text", text);
		formData.append("local_tz", local_tz);
		formData.append("local_time", local_time);

		// Only append the file if it was provided
		if (img) {
		formData.append("file", img);
		}

		const response = await fetch(API_EVENT, {
		method: "POST",
		body: formData,
		});

		if (!response.ok) {
			console.error("Error generating event:", response.statusText);
			return [
				{
					title: "Sample Event",
					time_zone: "America/Los_Angeles",
					start_time: "",
					end_time: "",
					description: "Something went wrong while generating this event :(",
					location: "",
					attendees: [],
					recurrence_type: "",
					recurrence_days: [],
					recurrence_count: 0,
					recurrence_end: "",
					gcal_link: "",
					outlook_link: "",
					ics_string: "",
				},
			];
		}

		const data = await response.json();

		// Ensure response is a list of events
		if (!Array.isArray(data)) {
		throw new Error("Unexpected response format: Expected an array of events");
		}

		// Map response events to CalendarEvent format
		const events: CalendarEvent[] = data.map((event) => ({
		title: event.title || "Sample Event",
		time_zone: event.time_zone || "America/Los_Angeles",
		start_time: event.start_time,
		end_time: event.end_time,
		description: event.description || "No description provided for this event.",
		location: event.location || "",
		attendees: event.attendees || [],
		recurrence_type: event.recurrence_pattern || "",
		recurrence_days: event.recurrence_days || [],
		recurrence_count: event.recurrence_count || 0,
		recurrence_end: event.recurrence_end_date || "",
		gcal_link: event.gcal_link || "",
		outlook_link: event.outlook_link || "",
		ics_string: event.ics || "",
		}));

		console.log("Generated events:", events);
		return events;
	} catch (error) {
		console.error("Error generating event:", error);
		// Return a sample event if the API call fails
		return [
		{
			title: "Sample Event",
			time_zone: "America/Los_Angeles",
			start_time: "",
			end_time: "",
			description: "Something went wrong while generating this event :(",
			location: "",
			attendees: [],
			recurrence_type: "",
			recurrence_days: [],
			recurrence_count: 0,
			recurrence_end: "",
			gcal_link: "",
			outlook_link: "",
			ics_string: "",
		},
		];
	}
};