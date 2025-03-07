import React from "react"
import { CalendarEvent } from "@/app/types/CalendarEvent"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"
import { exportToGoogleCalendar, exportToOutlook } from "@/app/utils/calendarExport"
import { Button } from "@/app/components/ui/button"
import { format, parseISO, isValid } from "date-fns"

// Displays generated event details and export options
interface GeneratedEventDisplayProps {
  event: CalendarEvent
}

export function GeneratedEventDisplay({ event }: GeneratedEventDisplayProps) {
  const formatDateTime = (date: string) => {
    // console.log("Date:", date)
    const parsed = parseISO(date)
    if (!isValid(parsed)) {
      console.log("Invalid date:", date)
      return "Invalid date"
    }
    return format(parsed, "yyyy-MM-dd HH:mm")
  }

  return (
    <Card className="w-full border-[#218F98] bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#071E37] heading-signika text-xl">
          Generated Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <SectionRow
            icon={<CalendarIcon />}
            text={event.title}
            contentClass="text-lg font-medium text-telegraf text-[#071E37]"
          />
          <SectionRow
            icon={<TimeIcon />}
            text={`${formatDateTime(event.start_time)} - ${formatDateTime(event.end_time)}`}
            contentClass="text-telegraf text-[#6B909F]"
          />
          <SectionRow
            icon={<LinesIcon />}
            text={event.description}
            contentClass="text-telegraf text-[#6B909F]"
          />
        </div>
        <ExportSection event={event} />
      </CardContent>
    </Card>
  )
}

/* Local sub-components */

// Shows export buttons
function ExportSection({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-2">
      <p className="text-[#6B909F] text-sm text-telegraf">Export to:</p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5"
          onClick={() => exportToGoogleCalendar(event)}
        >
          Google Calendar
        </Button>
        <Button
          className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5"
          onClick={() => exportToOutlook(event)}
        >
          Outlook
        </Button>
        <Button className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-xs sm:text-sm px-2 py-1.5">
          Apple Calendar
        </Button>
      </div>
    </div>
  )
}

// Rows of icon + text
function SectionRow({
  icon,
  text,
  contentClass,
}: {
  icon: React.ReactNode
  text: string
  contentClass: string
}) {
  return (
    <div className="flex items-start gap-2">
      <IconWrapper>{icon}</IconWrapper>
      <span className={contentClass}>{text}</span>
    </div>
  )
}

// Wrapper for icons
function IconWrapper({ children }: { children: React.ReactNode }) {
  return <div className="mt-0.5 text-[#218F98] h-5 w-5">{children}</div>
}

// Icons
function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10
           M5 21h14a2 2 0 002-2V7
           a2 2 0 00-2-2H5a2 2 0
           00-2 2v12a2 2 0 
           002 2z"
      />
    </svg>
  )
}
function TimeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 
           0 11-18 0 9 9 
           0 0118 0z"
      />
    </svg>
  )
}
function LinesIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2}
        d="M4 6h16M4 10h16
           M4 14h16M4 18h16"
      />
    </svg>
  )
}
