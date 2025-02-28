import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"

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
        {children}
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
