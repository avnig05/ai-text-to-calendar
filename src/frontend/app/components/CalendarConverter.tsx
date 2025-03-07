"use client"

import React, { useState, ChangeEvent } from "react"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"

// A simpler converter that removes direct HTML tags via local sub-components
export default function CalendarConverter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")


  const handleConvert = () => {
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
        <FieldBlock
          label="Input Calendar Data:"
          input={
            <Textarea
              id="input"
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your calendar data here..."
              className="h-[200px]"
            />
          }
        />
        <CenteredBlock>
          <Button onClick={handleConvert}>Convert</Button>
        </CenteredBlock>
        <FieldBlock
          label="Converted Output:"
          input={
            <Textarea
              id="output"
              value={output}
              readOnly
              className="h-[200px] bg-muted"
            />
          }
        />
      </CardContent>
    </Card>
  )
}

/* Local sub-components */

// FieldBlock for label + input
function FieldBlock({
  label,
  input,
}: {
  label: string
  input: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <Label>{label}</Label>
      {input}
    </section>
  )
}

// Label text
function Label({ children }: { children: React.ReactNode }) {
  return <p className="block text-sm font-medium">{children}</p>
}

// Center content
function CenteredBlock({ children }: { children: React.ReactNode }) {
  return <div className="text-center">{children}</div>
}
