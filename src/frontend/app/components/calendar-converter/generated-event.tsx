import React from "react"
import { CalendarEvent } from "@/app/types/CalendarEvent"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"
import { exportToGoogleCalendar, exportToICal, exportToOutlook } from "@/app/utils/calendarExport"
import { Button } from "@/app/components/ui/button"
import { format, parseISO, isValid } from "date-fns"

// Displays generated event details and export options
interface GeneratedEventDisplayProps {
  event: CalendarEvent
}

export function GeneratedEventDisplay({ event }: GeneratedEventDisplayProps) {
  const formatDateTime = (date: string) => {
    const parsed = parseISO(date)
    if (!isValid(parsed)) {
      console.error("Invalid date:", date)
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
          {event.description && (
            <SectionRow
              icon={<LinesIcon />}
              text={event.description}
              contentClass="text-telegraf text-[#6B909F]"
            />
          )}
          {event.location && (
            <SectionRow
              icon={<LocationIcon />}
              text={event.location}
              contentClass="text-telegraf text-[#6B909F]"
            />
          )}
          {event.attendees.length > 0 && (
            <SectionRow
              icon={<EmailIcon />}
              text={event.attendees.join(", ")}
              contentClass="text-telegraf text-[#6B909F]"
            />
          )}
        </div>
        <ExportSection event={event} />
      </CardContent>
    </Card>
  )
}

/* Local sub-components */

// Button styling constants to avoid repetition
const EXPORT_BUTTON_CLASSES = `
  relative w-full bg-[#218F98] text-white text-telegraf 
  text-xs sm:text-sm px-2 py-1.5 overflow-hidden group
  transition-all duration-300 ease-in-out
  hover:bg-[#218F98] hover:shadow-lg hover:scale-[1.02]
  active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed
  before:absolute before:inset-0 
  before:bg-white/10 before:transform before:scale-x-0 
  before:opacity-0 before:origin-left
  before:transition-transform before:duration-300
  hover:before:scale-x-100 hover:before:opacity-100
`;

// Shows export buttons
function ExportSection({ event }: { event: CalendarEvent }) {
  const renderExportButton = (
    label: string, 
    onClick?: () => void
  ) => (
    <Button
      className={EXPORT_BUTTON_CLASSES}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center justify-center gap-1">
        <span className="font-medium tracking-wide text-white text-shadow-sm">{label}</span>
        <span className="transform transition-transform duration-300 group-hover:translate-x-1 text-white">
          →
        </span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
        transform translate-x-[-100%] group-hover:translate-x-[100%] 
        transition-transform duration-1000 ease-in-out">
      </div>
    </Button>
  );

  return (
    <div className="space-y-2">
      <p className="text-[#6B909F] text-sm text-telegraf">Export to:</p>
      <div className="grid grid-cols-3 gap-2">
        {renderExportButton("Google", () => exportToGoogleCalendar(event))}
        {renderExportButton("Outlook", () => exportToOutlook(event))}
        {renderExportButton("Apple (ICS)", () => exportToICal(event))}
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
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10 M5 21h14a2 2 0 002-2V7 a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}
function TimeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
function LinesIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2}
        d="M4 6h16M4 10h16 M4 14h16M4 18h16"
      />
    </svg>
  )
}
function LocationIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"
      />
      <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg 
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}