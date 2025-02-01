import { CalendarEvent } from "@/types/CalendarEvent"
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"

interface GeneratedEventProps {
  event: CalendarEvent
}

export function GeneratedEventDisplay({ event }: GeneratedEventProps) {
  const formatDateTime = (date: Date) => {
    // Changed format to use MM/dd/yyyy for date and h:mm a for time
    return format(date, "MM/dd/yyyy 'at' h:mm a")
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Generated Event</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium">{event.title}</span>
        </div>
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <ClockIcon className="w-5 h-5" />
          <span>{formatDateTime(event.startTime)}</span>
        </div>
        <p className="text-gray-800 mb-6">{event.description}</p>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Export to:</h3>
          <div className="flex gap-2">
            <button className="bg-black text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800">
              Google Calendar
            </button>
            <button className="bg-black text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800">
              Outlook
            </button>
            <button className="bg-black text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800">
              Apple Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 