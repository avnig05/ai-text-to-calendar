import { CalendarEvent } from "@/app/types/CalendarEvent";

// Use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.calendarize.ratcliff.cc';

// Function to generate an event from text input
export const generateEventFromText = async (text: string): Promise<CalendarEvent[]> => {
	try {
		console.log("prompt", text);
		console.log("Sending request to backend:", API_BASE_URL, "add-to-calendar");
		const response = await fetch(`${API_BASE_URL}/add-to-calendar`, {
			method: "POST",
			// mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				event_body: text,
				platform: "google",
			}),
		});
		
		if (!response.ok) {
			console.log("bad responce");
			console.log(response);
			return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "YYYY-MM-DDTHH:MM:SS",
				time_zone: "America/Los_Angeles",
				end_time: "YYYY-MM-DDTHH:MM:SS",
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
			start_time: "YYYY-MM-DDTHH:MM:SS",
			time_zone: "America/Los_Angeles",
			end_time: "YYYY-MM-DDTHH:MM:SS",
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
		console.log("Sending request to backend:", API_BASE_URL,"/upload");

		const formData = new FormData();
		formData.append("file", img);

    console.log("Sending request to backend");
		const response = await fetch(`${API_BASE_URL}/upload`, {
			method: "POST",
			// mode: "no-cors",
			body: formData,
		});

		if (!response.ok) {
			return [
				{
				title: "Sample Event",
				description: "This is a sample event created from the input text.",
				start_time: "YYYY-MM-DDTHH:MM:SS",
				time_zone: "America/Los_Angeles",
				end_time: "YYYY-MM-DDTHH:MM:SS",
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
				start_time: "YYYY-MM-DDTHH:MM:SS",
				time_zone: "America/Los_Angeles",
				end_time: "YYYY-MM-DDTHH:MM:SS",
				gcal_link: "",
				outlook_link: "",
				},
			];
	}
};
