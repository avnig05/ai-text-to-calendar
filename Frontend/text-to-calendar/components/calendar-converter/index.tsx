"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { timezones } from "@/lib/timezones"

export function CalendarConverter() {
  const [text, setText] = useState("")
  const [timezone, setTimezone] = useState(timezones[0].value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = () => {
    // Conversion logic will be implemented here
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
          <p className="text-center text-muted-foreground">Convert text to calendar events with ease</p>
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

          {/* Timezone Selector */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Select
              value={timezone}
              onValueChange={setTimezone}
              options={timezones}
            />
          </div>

          {/* Convert Button */}
          <Button 
            onClick={handleConvert} 
            className="w-full bg-black text-white hover:bg-black/90"
          >
            Convert to Calendar Event
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 