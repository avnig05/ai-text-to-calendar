import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CalendarEvent {
  title: string
  date: string
  time: string
  description: string
}

interface ExportOptionsProps {
  event: CalendarEvent
}

// API configuration - can be moved to a separate config file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004"

export default function ExportOptions({ event }: ExportOptionsProps) {
  // State management
  const [googleEventId, setGoogleEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [exportStatus, setExportStatus] = useState<Record<string, string>>({})
  const authWindowRef = useRef<Window | null>(null)
  
  // Generate a unique storage key for this specific event
  const storageKey = `googleEventId_${event.title}_${event.date}_${event.time}`.replace(/\s+/g, '_')
  
  // Handle authentication and event loading
  useEffect(() => {
    // Load saved event ID on component mount
    const savedEventId = localStorage.getItem(storageKey)
    if (savedEventId) {
      setGoogleEventId(savedEventId)
    }
    
    // Listen for messages from the auth window
    const handleAuthMessage = (messageEvent: MessageEvent) => {
      if (messageEvent.data === 'google-auth-complete') {
        // Retrieve the pending event details
        const pendingEventJSON = localStorage.getItem('pendingEventDetails')
        if (pendingEventJSON) {
          try {
            const pendingEvent = JSON.parse(pendingEventJSON)
            localStorage.removeItem('pendingEventDetails')
            
            // If this component matches the pending event, try to add it
            if (pendingEvent.title === event.title && 
                pendingEvent.date === event.date && 
                pendingEvent.time === event.time) {
              setTimeout(() => handleGoogleCalendarExport(), 1000)
            }
          } catch (e) {
            // If parsing fails, just try with the current event
            setTimeout(() => handleGoogleCalendarExport(), 1000)
          }
        } else {
          // If no pending event, just try to add the current event
          setTimeout(() => handleGoogleCalendarExport(), 1000)
        }
      } else if (messageEvent.data === 'google-auth-failed') {
        setIsLoading(false)
        toast.error("Google authentication failed. Please try again.")
      }
    }
    
    window.addEventListener('message', handleAuthMessage)
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('message', handleAuthMessage)
      
      // Close auth window if it's still open
      if (authWindowRef.current && !authWindowRef.current.closed) {
        authWindowRef.current.close()
      }
    }
  }, [event, storageKey])

  /**
   * Handle exporting to Google Calendar
   */
  const handleGoogleCalendarExport = async () => {
    // If already added, open the event in Google Calendar
    if (googleEventId) {
      window.open(`https://calendar.google.com/calendar/event?eid=${googleEventId}`, '_blank')
      return
    }

    setIsLoading(true)
    setExportStatus({...exportStatus, google: 'loading'})
    
    try {
      // Check if user is authenticated
      const authCheckResponse = await fetch(`${API_BASE_URL}/check-auth`, {
        method: 'GET',
        credentials: 'include',
      })
      
      // If not authenticated, prompt for login
      if (authCheckResponse.status === 401) {
        setIsLoading(false)
        setExportStatus({...exportStatus, google: 'unauthenticated'})
        
        const wantsToSignIn = window.confirm(
          'You need to sign in to Google Calendar to add this event. Would you like to sign in now?'
        )
        
        if (wantsToSignIn) {
          // Store event details for after authentication
          localStorage.setItem('pendingEventDetails', JSON.stringify(event))
          
          // Open Google login in a new window and keep a reference to it
          authWindowRef.current = window.open(
            `${API_BASE_URL}/login`, 
            'googleAuthWindow', 
            'width=600,height=700,menubar=no,toolbar=no'
          )
        }
        return
      }
      
      // User is authenticated, add the event
      const response = await fetch(`${API_BASE_URL}/add-event`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          start_time: event.date + 'T' + event.time,
          end_time: event.date + 'T' + event.time
        })
      })

      const data = await response.json()

      if (response.status === 401) {
        // Authentication failed, prompt for login
        setExportStatus({...exportStatus, google: 'unauthenticated'})
        
        const wantsToSignIn = window.confirm(
          'Your Google session has expired. Would you like to sign in again?'
        )
        
        if (wantsToSignIn) {
          localStorage.setItem('pendingEventDetails', JSON.stringify(event))
          authWindowRef.current = window.open(
            `${API_BASE_URL}/login`, 
            'googleAuthWindow', 
            'width=600,height=700,menubar=no,toolbar=no'
          )
        }
      } else if (response.ok) {
        // Event added successfully
        if (data.eventId) {
          setGoogleEventId(data.eventId)
          localStorage.setItem(storageKey, data.eventId)
          setExportStatus({...exportStatus, google: 'success'})
          
          // Open the event in a new tab
          if (data.message && data.message.includes('http')) {
            const eventUrl = data.message.split(': ')[1]
            window.open(eventUrl, '_blank')
          }
          
          toast.success('Event added to Google Calendar!')
        } else {
          setExportStatus({...exportStatus, google: 'error'})
          toast.error('Event was added but no event ID was returned')
        }
      } else {
        throw new Error(data.detail || 'Failed to add event to Google Calendar')
      }
    } catch (error) {
      setExportStatus({...exportStatus, google: 'error'})
      toast.error(`Failed to add event to Google Calendar: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle exporting to Outlook Calendar
   */
  const handleOutlookExport = () => {
    // Placeholder for Outlook export
    const subject = encodeURIComponent(event.title)
    const body = encodeURIComponent(event.description)
    const startTime = encodeURIComponent(event.date + 'T' + event.time)
    const endTime = encodeURIComponent(event.date + 'T' + event.time)
    
    const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${startTime}&enddt=${endTime}`
    window.open(outlookUrl, '_blank')
    
    setExportStatus({...exportStatus, outlook: 'success'})
    toast.success('Event details prepared for Outlook Calendar')
  }

  /**
   * Handle exporting to Apple Calendar
   */
  const handleAppleCalendarExport = () => {
    // Create an .ics file for Apple Calendar
    const startDate = new Date(`${event.date}T${event.time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setExportStatus({...exportStatus, apple: 'success'})
    toast.success('Calendar file downloaded for Apple Calendar')
  }

  /**
   * Format a date for ICS file format
   */
  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '')
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-2">Export to:</p>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={handleGoogleCalendarExport}
          disabled={isLoading}
          data-added={googleEventId ? "true" : "false"}
          style={{
            backgroundColor: googleEventId ? '#16a34a' : '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          className="w-full text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Processing...
            </>
          ) : googleEventId ? (
            <>
              <Check className="w-4 h-4" />
              Added
            </>
          ) : (
            'Google Calendar'
          )}
        </Button>
        <Button 
          onClick={handleOutlookExport}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Outlook
        </Button>
        <Button 
          onClick={handleAppleCalendarExport}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Apple Calendar
        </Button>
      </div>
    </>
  )
}
