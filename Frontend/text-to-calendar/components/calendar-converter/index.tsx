"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GeneratedEventDisplay } from "./generated-event"
import { CalendarEvent } from "@/types/CalendarEvent"
import { generateEventFromText } from "@/utils/eventGenerator"
import { Select } from "@/components/ui/select"
import { timezones } from "@/lib/timezones"

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
      <Card className="w-full border-[#218F98] bg-white/95 shadow-sm relative">
        <div className="absolute top-4 left-4">
          <span className="text-[#218F98] text-xl">✧</span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="text-[#218F98] text-xl">✧</span>
        </div>
        <CardHeader className="relative px-4 sm:px-8 pt-8">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#218F98] rounded-lg relative flex items-center justify-center">
              <span className="text-[#218F98] text-xl sm:text-2xl font-light heading-signika">CZ</span>
              <div className="absolute -top-1 left-2 right-2 sm:left-3 sm:right-3 h-1 bg-white flex justify-between">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-[#218F98] bg-white -mt-1"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-[#218F98] bg-white -mt-1"></div>
              </div>
            </div>
          </div>
          <CardTitle className="text-center heading-signika text-[1.2rem] xs:text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#071E37] tracking-[0.1em] xs:tracking-[0.12em] sm:tracking-[0.15em] font-light uppercase">
            Calendarize
          </CardTitle>
          <div className="text-center text-telegraf text-[#6B909F] mt-1 space-y-0.5">
            <p className="tracking-wide text-[0.7rem] xs:text-[0.8rem] sm:text-xs uppercase">
              Effortless Scheduling.
            </p>
            <p className="tracking-wide text-[0.7rem] xs:text-[0.8rem] sm:text-xs uppercase">
              Instant Planning.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#218F98] rounded-lg p-12 text-center cursor-pointer 
                     hover:bg-[#218F98]/5 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="h-8 w-8 text-[#218F98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-telegraf text-[#6B909F]">
                Drag and drop a text file here, or click to select a file
              </p>
            </div>
          </div>

          <Textarea
            placeholder="Or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] text-telegraf border-[#A5C3C2] focus:border-[#218F98]
                     bg-white/95 placeholder:text-[#6B909F] text-[#071E37]"
          />

          <Button 
            onClick={handleConvert} 
            className="w-full bg-[#218F98] text-white hover:bg-[#218F98]/90 text-telegraf font-normal text-sm sm:text-base py-2"
          >
            Convert to Calendar Event
          </Button>
        </CardContent>
      </Card>

      {generatedEvent && (
        <Card className="w-full border-[#218F98] bg-white/95 shadow-sm relative">
          <div className="absolute top-4 right-4">
            <span className="text-[#218F98] text-xl">✧</span>
          </div>
          <GeneratedEventDisplay event={generatedEvent} />
        </Card>
      )}
    </div>
  )
} 