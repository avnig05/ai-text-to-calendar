import { CalendarEvent } from "@/app/types/CalendarEvent";

// Use environment variable with fallback
const API_BASE_URL = 'https://api.calendarize.ratcliff.cc';
const API_EVENT = API_BASE_URL + "/add-to-calendar";
const API_UPLOAD = API_BASE_URL + "/upload";
// Function to generate an event from text input
export const generateEventFromText = async (text: string): Promise<CalendarEvent[]> => {
	try {
		const local_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const local_time = new Date().toLocaleString('sv-SE', { timeZone: local_tz }).replace(' ', 'T') + 'Z';
		console.log("prompt", text);
		console.log("local time", local_time, local_tz);
		console.log("Sending request to backend:", API_EVENT);
		const response = await fetch(API_EVENT, {
			method: "POST",
			// mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				event_body: text,
				local_tz: local_tz,
				local_time: local_time
			}),
		});
		
		if (!response.ok) {
			console.log("bad response", response);
			return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "",
				time_zone: "America/Los_Angeles",
				end_time: "",
				gcal_link: "",
				outlook_link: "",
				},
			];
		}

		const data = await response.json();
		console.log("Response data:", data);

		// Ensure response is a list of events
		if (!Array.isArray(data)) {
			throw new Error("Unexpected response format: Expected an array of events");
		}

		// Map response events to CalendarEvent format
		const events: CalendarEvent[] = data.map((event) => ({
			title: event.title || "Sample Event",
			start_time: event.start_time,
			time_zone: event.time_zone || "America/Los_Angeles",
			end_time: event.end_time,
			description: event.description || "No description provided for this event.",
			gcal_link: event.gcal_link || "",
			outlook_link: event.outlook_link || "",
		}));

		return events;

		// return {
		// 	title: data.title || "Sample Event",
		// 	start_time: data.start_time,
		// 	time_zone: data.time_zone || "America/Los_Angeles",
		// 	end_time: data.end_time,
		// 	description:
		// 		data.description || "No description provided for this event.",
		// 	gcal_link: data.gcal_link,
		// 	outlook_link: data.outlook_link,
		// };
	} catch (error) {
		console.error("Error generating event:", error);
		// Return a sample event if the API call fails
		return [
			{
			title: "Sample Event",
			description: "This is a sample event created from the input text.",
			start_time: "",
			time_zone: "America/Los_Angeles",
			end_time: "Y",
			gcal_link: "",
			outlook_link: "",
			},
		];
	}
};

// Function to generate an event from an image file
export const generateEventFromImage = async (img: File): Promise<CalendarEvent[]> => {
	try {
		console.log("file", img);
		console.log("Sending request to backend:", API_UPLOAD);

		const formData = new FormData();
		formData.append("file", img);

    console.log("Sending request to backend");
		const response = await fetch(API_UPLOAD, {
			method: "POST",
			// mode: "no-cors",
			body: formData,
		});

		if (!response.ok) {
			return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "",
				time_zone: "America/Los_Angeles",
				end_time: "",
				gcal_link: "",
				outlook_link: "",
				},
			];
		}

		const data = await response.json();
		console.log(data);

		// Ensure response is a list of events
		if (!Array.isArray(data)) {
			throw new Error("Unexpected response format: Expected an array of events");
		}

		// Map response events to CalendarEvent format
		const events: CalendarEvent[] = data.map((event) => ({
			title: event.title || "Sample Event",
			start_time: event.start_time,
			time_zone: event.time_zone || "America/Los_Angeles",
			end_time: event.end_time,
			description: event.description || "No description provided for this event.",
			gcal_link: event.gcal_link || "",
			outlook_link: event.outlook_link || "",
		}));

		return events;

	} catch (error) {
		console.error("Error generating event:", error);
		// Return a sample event if the API call fails
		return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "",
				time_zone: "America/Los_Angeles",
				end_time: "",
				gcal_link: "",
				outlook_link: "",
				},
			];
	}
};

export const generateEvent = async (text: string, img: File): Promise<CalendarEvent[]> => {
	try {
		const local_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const local_time = new Date().toLocaleString('sv-SE', { timeZone: local_tz }).replace(' ', 'T') + 'Z';
		console.log("prompt", text);
		console.log("file", img);
		console.log("local time", local_time, local_tz);
		console.log("Sending request to backend:", API_EVENT);

		const formData = new FormData();
		formData.append("event_body", text)
		formData.append("file", img);
		formData.append("local_tz", local_tz);
		formData.append("local_time", local_time);

		const response = await fetch(API_EVENT, {
			method: "POST",
			body: formData,
		});
		
		if (!response.ok) {
			console.log("bad response", response);
			return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "",
				time_zone: "America/Los_Angeles",
				end_time: "",
				gcal_link: "",
				outlook_link: "",
				},
			];
		}

		const data = await response.json();
		console.log("Response data:", data);

		// Ensure response is a list of events
		if (!Array.isArray(data)) {
			throw new Error("Unexpected response format: Expected an array of events");
		}

		// Map response events to CalendarEvent format
		const events: CalendarEvent[] = data.map((event) => ({
			title: event.title || "Sample Event",
			start_time: event.start_time,
			time_zone: event.time_zone || "America/Los_Angeles",
			end_time: event.end_time,
			description: event.description || "No description provided for this event.",
			gcal_link: event.gcal_link || "",
			outlook_link: event.outlook_link || "",
		}));

		return events;

		// return {
		// 	title: data.title || "Sample Event",
		// 	start_time: data.start_time,
		// 	time_zone: data.time_zone || "America/Los_Angeles",
		// 	end_time: data.end_time,
		// 	description:
		// 		data.description || "No description provided for this event.",
		// 	gcal_link: data.gcal_link,
		// 	outlook_link: data.outlook_link,
		// };
	} catch (error) {
		console.error("Error generating event:", error);
		// Return a sample event if the API call fails
		return [
			{
			title: "Sample Event",
			description: "This is a sample event created from the input text.",
			start_time: "",
			time_zone: "America/Los_Angeles",
			end_time: "",
			gcal_link: "",
			outlook_link: "",
			},
		];
	}
};
