import { CalendarConverter } from "@/app/components/calendar-converter"

// Wraps <main> in a local sub-component to avoid raw HTML.
export default function Home() {
  return (
    <MainWrapper>
      <div className="w-full max-w-5xl">
        <CalendarConverter />
      </div>
    </MainWrapper>
  )
}

// Renders <main> with Tailwind classes
function MainWrapper({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-between p-24">{children}</main>
}
