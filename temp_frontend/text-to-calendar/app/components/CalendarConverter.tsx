"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ChangeEvent } from "react"

export default function CalendarConverter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const handleConvert = () => {
    // Conversion logic will be implemented here
    setOutput("Converted calendar data will appear here")
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Calendar Format Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="input" className="block text-sm font-medium">
            Input Calendar Data:
          </label>
          <Textarea
            id="input"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your calendar data here..."
            className="h-[200px]"
          />
        </div>

        <div className="text-center">
          <Button onClick={handleConvert}>Convert</Button>
        </div>

        <div className="space-y-2">
          <label htmlFor="output" className="block text-sm font-medium">
            Converted Output:
          </label>
          <Textarea
            id="output"
            value={output}
            readOnly
            className="h-[200px] bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  )
}

