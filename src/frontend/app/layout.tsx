import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"
import { PostHogAnalytics } from "./providers/PostHogProvider"

// Defines metadata for the app.
export const metadata: Metadata = {
  title: "Calendarize",
  description: "Convert text and images to calendar events",
}

// Hides <html> and <body> behind local sub-components.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <HtmlWrapper>
      <BodyWrapper className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <PostHogAnalytics>
          {children}
        </PostHogAnalytics>
      </BodyWrapper>
    </HtmlWrapper>
  )
}

// Renders <html lang="en">
function HtmlWrapper({ children }: { children: React.ReactNode }) {
  return <html lang="en">{children}</html>
}

// Renders <body> with className support
function BodyWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <body className={className}>{children}</body>
}
