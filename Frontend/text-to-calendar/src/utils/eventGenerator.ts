import { start } from 'repl';
import { CalendarEvent } from '../types/CalendarEvent';

export const generateEventFromText = async (text: string): Promise<CalendarEvent> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate event');
    }

    const data = await response.json();
    console.log("Received JSON from API:", data);
    
    // Create a default end time 1 hour after start time
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);

    return {
      title: data.title,
      description: data.description || "No description",
      startTime: startTime,
      endTime: endTime,
      gcal_link: data.gcal_link || null,
      outlook_link: data.outlook_link || null,
    };
  } catch (error) {
    console.error('Error generating event:', error);
    throw error;
  }
}; 