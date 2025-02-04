import { CalendarEvent } from "@/types/CalendarEvent";

export const generateEventFromText = async (
	text: string
): Promise<CalendarEvent> => {
	try {
		const response = await fetch("http://127.0.0.1:8000/add-to-calendar", {
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
			return {
				title: "Sample Event",
				description:
					"This is a sample event created from the input text.",
				startTime: new Date(),
				endTime: new Date(Date.now() + 60 * 60 * 1000),
				gcal_link: "",
			};
		}

		const data = await response.json();
		console.log(data);

		// Create a default end time 1 hour after start time
		const startTime = new Date(data.startTime || Date.now());
		const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

		return {
			title: data.title || "Sample Event",
			description:
				data.description ||
				"This is a sample event created from the input text.",
			startTime: startTime,
			endTime: endTime,
			gcal_link: data.gcal_link,
		};
	} catch (error) {
		console.error("Error generating event:", error);
		// Return a sample event if the API call fails
		return {
			title: "Sample Event",
			description: "This is a sample event created from the input text.",
			startTime: new Date(),
			endTime: new Date(Date.now() + 60 * 60 * 1000),
			gcal_link: "",
		};
	}
};
