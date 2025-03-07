// app/layout.client.tsx
"use client";

import { PostHogAnalytics } from "./providers/PostHogProvider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <PostHogAnalytics>{children}</PostHogAnalytics>
}