import React from "react"
import { CalendarEvent } from "@/app/types/CalendarEvent"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"
import { exportToGoogleCalendar, exportToOutlook } from "@/app/utils/calendarExport"
import { Button } from "@/app/components/ui/button"
import { format, parseISO, isValid } from "date-fns"

// Configuration
const CONFIG = {
  COLORS: {
    PRIMARY: "#218F98",
    TEXT_PRIMARY: "#071E37",
    TEXT_SECONDARY: "#6B909F"
  },
  ANIMATIONS: {
    BUTTON: {
      BASE: `relative w-full bg-[#218F98] text-white text-telegraf 
        transition-all duration-300 ease-in-out
        hover:bg-[#218F98] hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden group`,
      SHIMMER: `before:absolute before:inset-0 
        before:bg-white/10 before:transform before:scale-x-0 
        before:opacity-0 before:origin-left
        before:transition-transform before:duration-300
        hover:before:scale-x-100 hover:before:opacity-100`
    }
  },
  TEXT_SIZES: {
    MOBILE: {
      BUTTON: "text-xs",
      LABEL: "text-xs",
      TITLE: "text-lg",
      DESCRIPTION: "text-sm"
    },
    DESKTOP: {
      BUTTON: "text-[11px] xs:text-xs sm:text-sm lg:text-base",
      LABEL: "text-sm",
      TITLE: "text-xl",
      DESCRIPTION: "text-base"
    }
  }
} as const;

// Types
interface SectionRowProps {
  icon: React.ReactNode
  text: string
  contentClass: string
}

interface ExportButtonProps {
  label: string
  onClick?: () => void
  className?: string
}

// Utility functions
const formatDateTime = (date: string): string => {
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) {
      throw new Error("Invalid date format")
    }
    return format(parsed, "yyyy-MM-dd HH:mm")
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
};

// Reusable Button Component
const ExportButton: React.FC<ExportButtonProps> = ({ label, onClick, className = "" }) => (
  <Button
    className={`${CONFIG.ANIMATIONS.BUTTON.BASE} ${CONFIG.ANIMATIONS.BUTTON.SHIMMER} ${className}`}
    onClick={onClick}
  >
    <span className="relative z-10 flex items-center justify-center gap-1 xs:gap-2">
      <span className="font-medium tracking-wide text-white text-shadow-sm whitespace-nowrap">
        {label}
      </span>
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

// Main Component
export function GeneratedEventDisplay({ event }: { event: CalendarEvent }) {
  // Memoized event details
  const eventDateTime = React.useMemo(() => ({
    start: formatDateTime(event.start_time),
    end: formatDateTime(event.end_time)
  }), [event.start_time, event.end_time]);

  return (
    <Card className="w-full border-[#218F98] bg-white/95 shadow-sm">
      <CardHeader className="md:px-8 px-4">
        <CardTitle className={`text-[${CONFIG.COLORS.TEXT_PRIMARY}] heading-signika 
          text-lg md:text-xl`}>
          Generated Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 md:px-8 px-4">
        <MobileView event={event} dateTime={eventDateTime} />
        <DesktopView event={event} dateTime={eventDateTime} />
      </CardContent>
    </Card>
  );
}

// Mobile Layout Component
const MobileView: React.FC<{ event: CalendarEvent; dateTime: { start: string; end: string } }> = 
  React.memo(({ event, dateTime }) => (
    <div className="md:hidden space-y-3">
      <EventDetails
        title={event.title}
        dateTime={`${dateTime.start} - ${dateTime.end}`}
        description={event.description}
      />
      <MobileExportSection event={event} />
    </div>
  ));

// Desktop Layout Component
const DesktopView: React.FC<{ event: CalendarEvent; dateTime: { start: string; end: string } }> = 
  React.memo(({ event, dateTime }) => (
    <div className="hidden md:block space-y-4">
      <SectionRow
        icon={<CalendarIcon />}
        text={event.title}
        contentClass={`text-lg font-medium text-telegraf text-[${CONFIG.COLORS.TEXT_PRIMARY}]`}
      />
      <SectionRow
        icon={<TimeIcon />}
        text={`${dateTime.start} - ${dateTime.end}`}
        contentClass={`text-telegraf text-[${CONFIG.COLORS.TEXT_SECONDARY}]`}
      />
      <SectionRow
        icon={<LinesIcon />}
        text={event.description}
        contentClass={`text-telegraf text-[${CONFIG.COLORS.TEXT_SECONDARY}]`}
      />
      <ExportSection event={event} />
    </div>
  ));

// Event Details Component
const EventDetails: React.FC<{
  title: string;
  dateTime: string;
  description: string;
}> = React.memo(({ title, dateTime, description }) => (
  <div className="space-y-2">
    <p className={`text-lg font-medium text-telegraf text-[${CONFIG.COLORS.TEXT_PRIMARY}]`}>
      {title}
    </p>
    <p className={`text-sm text-telegraf text-[${CONFIG.COLORS.TEXT_SECONDARY}]`}>
      {dateTime}
    </p>
    <p className={`text-sm text-telegraf text-[${CONFIG.COLORS.TEXT_SECONDARY}]`}>
      {description}
    </p>
  </div>
));

// Export Sections
const MobileExportSection: React.FC<{ event: CalendarEvent }> = React.memo(({ event }) => (
  <div className="space-y-2">
    <p className={`text-[${CONFIG.COLORS.TEXT_SECONDARY}] ${CONFIG.TEXT_SIZES.MOBILE.LABEL} text-telegraf`}>
      Export to:
    </p>
    <div className="flex flex-col gap-2">
      <ExportButton 
        label="Google Calendar" 
        onClick={() => exportToGoogleCalendar(event)}
        className={CONFIG.TEXT_SIZES.MOBILE.BUTTON}
      />
      <ExportButton 
        label="Outlook" 
        onClick={() => exportToOutlook(event)}
        className={CONFIG.TEXT_SIZES.MOBILE.BUTTON}
      />
      <ExportButton 
        label="Apple Calendar"
        className={CONFIG.TEXT_SIZES.MOBILE.BUTTON}
      />
    </div>
  </div>
));

const ExportSection: React.FC<{ event: CalendarEvent }> = React.memo(({ event }) => (
  <div className="space-y-2">
    <p className={`text-[${CONFIG.COLORS.TEXT_SECONDARY}] ${CONFIG.TEXT_SIZES.DESKTOP.LABEL} text-telegraf`}>
      Export to:
    </p>
    <div className="grid grid-cols-3 gap-1 xs:gap-2">
      <ExportButton 
        label="Google Calendar" 
        onClick={() => exportToGoogleCalendar(event)}
        className={CONFIG.TEXT_SIZES.DESKTOP.BUTTON}
      />
      <ExportButton 
        label="Outlook" 
        onClick={() => exportToOutlook(event)}
        className={CONFIG.TEXT_SIZES.DESKTOP.BUTTON}
      />
      <ExportButton 
        label="Apple Calendar"
        className={CONFIG.TEXT_SIZES.DESKTOP.BUTTON}
      />
    </div>
  </div>
));

// Utility Components
const SectionRow: React.FC<SectionRowProps> = React.memo(({ icon, text, contentClass }) => (
  <div className="flex items-start gap-2">
    <IconWrapper>{icon}</IconWrapper>
    <span className={contentClass}>{text}</span>
  </div>
));

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={`mt-0.5 text-[${CONFIG.COLORS.PRIMARY}] h-5 w-5`}>{children}</div>
);

// Icons (kept as is since they're already optimized)
function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
