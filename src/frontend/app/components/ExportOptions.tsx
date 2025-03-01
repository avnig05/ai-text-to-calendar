import React, { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Check } from "lucide-react"

interface ExportOptionsProps {
  event: {
    title: string
    date: string
    time: string
    description: string
  }
}

export default function ExportOptions({ event }: ExportOptionsProps) {
  // State for tracking Google Calendar integration
  const [googleEventId, setGoogleEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Generate a unique storage key for this specific event
  const storageKey = `googleEventId_${event.title}_${event.date}_${event.time}`.replace(/\s+/g, '_');
  
  // Debug log
  console.log("Current event:", event);
  console.log("Storage key:", storageKey);
  console.log("Initial googleEventId state:", googleEventId);
  
  // Load saved event ID on component mount
  useEffect(() => {
    const savedEventId = localStorage.getItem(storageKey);
    console.log("Saved event ID from localStorage:", savedEventId);
    
    if (savedEventId) {
      console.log("Setting googleEventId state to:", savedEventId);
      setGoogleEventId(savedEventId);
    }
    
    // Check if we're returning from auth
    const pendingEvent = localStorage.getItem('pendingEventDetails');
    if (pendingEvent) {
      try {
        const parsedEvent = JSON.parse(pendingEvent);
        console.log("Pending event from localStorage:", parsedEvent);
        
        if (parsedEvent.title === event.title && 
            parsedEvent.date === event.date && 
            parsedEvent.time === event.time) {
          console.log("Returning from auth with matching event");
          localStorage.removeItem('pendingEventDetails');
          // Attempt to add the event after a short delay
          setTimeout(() => {
            console.log("Auto-triggering Google Calendar export");
            handleGoogleCalendarExport();
          }, 1000);
        }
      } catch (e) {
        console.error("Error parsing pending event", e);
        localStorage.removeItem('pendingEventDetails');
      }
    }
  }, [event.title, event.date, event.time, storageKey]);

  const handleGoogleCalendarExport = async () => {
    console.log("handleGoogleCalendarExport called, current googleEventId:", googleEventId);
    
    // If already added, open the event in Google Calendar
    if (googleEventId) {
      console.log("Event already added, opening in Google Calendar");
      window.open(`https://calendar.google.com/calendar/event?eid=${googleEventId}`, '_blank');
      return;
    }

    setIsLoading(true);
    console.log("Setting isLoading to true");
    
    try {
      console.log("Attempting to add event to Google Calendar:", {
        title: event.title,
        description: event.description,
        start_time: event.date + 'T' + event.time,
        end_time: event.date + 'T' + event.time
      });
      
      const response = await fetch('http://localhost:8004/add-event', {
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
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.status === 401) {
        console.log("Not authenticated, showing sign-in prompt");
        // Not authenticated - ask user if they want to sign in
        const wantsToSignIn = window.confirm(
          'Would you like to sign in to Google Calendar to add this event directly?'
        );

        if (wantsToSignIn) {
          console.log("User wants to sign in, storing event details and redirecting");
          // Store current event details for after login
          localStorage.setItem('pendingEventDetails', JSON.stringify(event));
          window.location.href = 'http://localhost:8004/login';
        } else {
          console.log("User declined to sign in");
        }
      } else if (response.ok) {
        // Successfully added to Google Calendar
        console.log("Event added successfully, eventId:", data.eventId);
        
        if (data.eventId) {
          console.log("Setting googleEventId state to:", data.eventId);
          setGoogleEventId(data.eventId);
          localStorage.setItem(storageKey, data.eventId);
          console.log("Saved eventId to localStorage with key:", storageKey);
          
          // Force re-render
          setTimeout(() => {
            console.log("Forcing re-render");
            setGoogleEventId(prevId => {
              console.log("Re-render with ID:", prevId);
              return prevId;
            });
          }, 100);
        } else {
          console.error("No eventId returned from API");
        }
        
        // Open the event link in a new tab if available
        if (data.message && data.message.includes('http')) {
          const eventUrl = data.message.split(': ')[1];
          console.log("Opening event URL:", eventUrl);
          window.open(eventUrl, '_blank');
        }
        
        alert('Event added to Google Calendar!');
      } else {
        throw new Error(data.detail || 'Failed to add event to Google Calendar');
      }
    } catch (error) {
      console.error('Error adding to Google Calendar:', error);
      alert('Failed to add event to Google Calendar: ' + error);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const handleOutlookExport = () => {
    console.log("Exporting to Outlook:", event);
  };

  const handleAppleCalendarExport = () => {
    console.log("Exporting to Apple Calendar:", event);
  };

  // Debug render
  console.log("Rendering with googleEventId:", googleEventId);
  console.log("Button class:", `w-full ${googleEventId ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'} text-white flex items-center justify-center gap-1`);

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
            'Processing...'
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
      
      {/* Debug info - remove in production */}
      <div className="mt-2 text-xs text-gray-400">
        Status: {googleEventId ? 'Added to Google Calendar' : 'Not added'} 
        {googleEventId && <span> (ID: {googleEventId.substring(0, 8)}...)</span>}
      </div>
    </>
  )
}
