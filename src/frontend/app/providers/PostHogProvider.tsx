'use client'

import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Only initialize on client side
if (typeof window !== 'undefined' && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
    capture_pageview: false // Manually handle pageviews
  })
}

export function PostHogAnalytics({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`
      }
      
      // Ensure PostHog is loaded
      if (posthog.__loaded) {
        posthog.capture('$pageview', {
          $current_url: url,
          timestamp: new Date().toISOString()
        })
      }
    }
  }, [pathname, searchParams])

  if (typeof window === 'undefined') return <>{children}</>

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
} 