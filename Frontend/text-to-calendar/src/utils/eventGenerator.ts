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
    
    // Create a default end time 1 hour after start time
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    return {
      title: data.title,
      description: data.description,
      startTime: startTime,
      endTime: endTime,
    };
  } catch (error) {
    console.error('Error generating event:', error);
    throw error;
  }
}; 