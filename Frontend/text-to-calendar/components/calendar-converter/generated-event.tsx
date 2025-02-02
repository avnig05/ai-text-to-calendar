import { CalendarEvent } from "@/types/CalendarEvent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GeneratedEventDisplayProps {
  event: CalendarEvent
}

export function GeneratedEventDisplay({ event }: GeneratedEventDisplayProps) {
  return (
    <Card className="w-full border-[#218F98] bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#071E37] heading-signika text-xl">
          Generated Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-2 text-[#071E37]">
            <svg className="h-5 w-5 mt-0.5 text-[#218F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-lg font-medium text-telegraf">{event.title}</span>
          </div>

          <div className="flex items-start gap-2 text-[#6B909F]">
            <svg className="h-5 w-5 mt-0.5 text-[#218F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-telegraf">{event.datetime}</span>
          </div>

          <div className="flex items-start gap-2 text-[#6B909F]">
            <svg className="h-5 w-5 mt-0.5 text-[#218F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-telegraf">{event.description}</span>
          </div>
        </div>

        {/* Updated Export Options */}
        <div className="space-y-2">
          <p className="text-[#6B909F] text-sm text-telegraf">Export to:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5"
            >
              Google Calendar
            </Button>
            <Button 
              className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5"
            >
              Outlook
            </Button>
            <Button 
              className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5"
            >
              Apple Calendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 