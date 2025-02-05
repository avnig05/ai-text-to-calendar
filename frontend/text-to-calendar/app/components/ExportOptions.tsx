import { Button } from "@/app/components/ui/button"

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
    // Implement export logic for each platform
    console.log(`Exporting to ${platform}:`, event)
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Export to:</h3>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handleExport("Google Calendar")}>Google Calendar</Button>
        <Button onClick={() => handleExport("Outlook")}>Outlook</Button>
        <Button onClick={() => handleExport("Apple Calendar")}>Apple Calendar</Button>
      </div>
    </div>
  )
}

