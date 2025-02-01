import React, { useState } from 'react';
import FileUploadZone from './components/FileUploadZone';
import GeneratedEvent from './components/GeneratedEvent';
import { generateEventFromText } from './utils/eventGenerator';
import { CalendarEvent } from './types/CalendarEvent';

function App() {
  const [inputText, setInputText] = useState('');
  const [generatedEvent, setGeneratedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const event = await generateEventFromText(inputText);
      setGeneratedEvent(event);
    } catch (error) {
      console.error('Error generating event:', error);
      // Handle error appropriately
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto pt-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-1">UCSC AI Calendar Converter</h1>
        <p className="text-center text-gray-600 mb-8">Convert text to calendar events with ease</p>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <FileUploadZone onTextExtracted={setInputText} />
          <textarea
            className="w-full mt-4 p-3 border border-gray-200 rounded-lg"
            rows={6}
            placeholder="Or type your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="w-full mt-4 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isLoading || !inputText.trim()}
          >
            Convert to Calendar Event
          </button>
        </div>

        {generatedEvent && <GeneratedEvent event={generatedEvent} />}
      </div>
    </div>
  );
}

export default App; 