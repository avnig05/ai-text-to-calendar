import { CalendarEvent } from "@/app/types/CalendarEvent";

export const generateEventFromImage = async (
	img: File
): Promise<CalendarEvent> => {
	try {
		console.log("file", img);

		const formData = new FormData();
		formData.append("file", img);

		console.log("Sending request to backend");
		const response = await fetch("http://127.0.0.1:8000/upload", {
			method: "POST",
			// mode: "no-cors",
			body: formData,
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

		return {
			title: data.title || "Sample Event",
			start_time: data.start_time,
			time_zone: data.time_zone || "America/Los_Angeles",
			end_time: data.end_time,
			description:
				data.description || "No description provided for this event.",
			gcal_link: data.gcal_link,
			outlook_link: data.outlook_link,
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
