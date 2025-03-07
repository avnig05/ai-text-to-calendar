import React from "react"
import { Button } from "@/app/components/ui/button"

// Export buttons for various calendar platforms
interface ExportOptionsProps {
  event: {
    title: string
    date: string
    time: string
    description: string
  }
}

export default function ExportOptions({ event }: ExportOptionsProps) {
  const handleExport = (platform: string) => {
    console.log(`Exporting to ${platform}:`, event)
  }

  return (
    <OptionsContainer>
      <SectionTitle>Export to:</SectionTitle>
      <ButtonRow>
        <Button onClick={() => handleExport("Google Calendar")}>Google Calendar</Button>
        <Button onClick={() => handleExport("Outlook")}>Outlook</Button>
        <Button onClick={() => handleExport("Apple Calendar")}>Apple Calendar</Button>
      </ButtonRow>
    </OptionsContainer>
  )
}

// Local sub-components
function OptionsContainer({ children }: { children: React.ReactNode }) {
  return <section className="mt-6">{children}</section>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mb-3">{children}</h3>
}
function ButtonRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>
}