import React from "react";
import { CalendarEvent } from "../types/CalendarEvent";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import {
	exportToGoogleCalendar,
	exportToOutlook,
	exportToAppleCalendar,
} from "../utils/calendarExport";

const GeneratedEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
	const formatDateTime = (date: Date) => {
		return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
	};
		// return format(date, "yyyy-MM-dd 'at' HH:mm");

	return (
		<div className="mt-8">
			<h2 className="text-2xl font-bold mb-4">Generated Event</h2>
			<div className="bg-white rounded-lg p-6 shadow-sm">
				{/* Event Title */}
				<div className="flex items-center gap-2 mb-2">
					<CalendarIcon className="w-5 h-5 text-gray-500" />
					<span className="font-medium">{event.title}</span>
				</div>
				{/* Event Date and Time */}
				<div className="flex items-center gap-2 mb-4 text-gray-600">
					<ClockIcon className="w-5 h-5" />
					<span>{formatDateTime(event.startTime)}</span>
					{event.endTime && (
						<>
							<span> - </span>
							<span>{formatDateTime(event.endTime)}</span>
						</>
					)}
				</div>
				{/* Event Description */}
				<p className="text-gray-600 mb-6">{event.description}</p>
				{/* Export Buttons */}
				<div>
					<h3 className="text-sm font-medium mb-2">Export to:</h3>
					<div className="flex gap-2">
						<button
							onClick={() => exportToGoogleCalendar(event)}
							className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
						>
							Google Calendar
						</button>
						<button
							onClick={() => exportToOutlook(event)}
							className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
						>
							Outlook
						</button>
						<button
							onClick={() => exportToAppleCalendar(event)}
							className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
						>
							Apple Calendar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneratedEvent;
