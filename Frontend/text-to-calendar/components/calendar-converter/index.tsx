"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GeneratedEventDisplay } from "./generated-event"
import { CalendarEvent } from "@/types/CalendarEvent"
import { generateEventFromText } from "@/utils/eventGenerator"

export function CalendarConverter() {
  const [text, setText] = useState("")
  const [generatedEvent, setGeneratedEvent] = useState<CalendarEvent | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = async () => {
    try {
      const event = await generateEventFromText(text)
      setGeneratedEvent(event)
    } catch (error) {
      console.error('Error generating event:', error)
      // Handle error appropriately
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">UCSC AI Calendar Converter</CardTitle>
          <p className="text-center text-muted-foreground mt-2">Convert text to calendar events with ease</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt"
          />

          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-muted-foreground">Drag and drop a text file here, or click to select a file</p>
            </div>
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Convert Button */}
          <Button 
            onClick={handleConvert} 
            className="w-full bg-black text-white hover:bg-black/90"
          >
            Convert to Calendar Event
          </Button>
        </CardContent>
      </Card>

      {/* Generated Event Display */}
      {generatedEvent && <GeneratedEventDisplay event={generatedEvent} />}
    </div>
  )
} 