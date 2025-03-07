'use client'

import posthog from 'posthog-js'

// Initialize PostHog only on the client side
const initPostHog = () => {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      }
    })
  }
}

export const Analytics = {
  // Calendar events
  trackCalendarConversion: (inputType: 'text' | 'image' | 'docx', eventCount: number) => {
    initPostHog()
    try {
      posthog.capture('calendar_conversion', {
        input_type: inputType,
        event_count: eventCount,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  },

  trackCalendarExport: (platform: 'google' | 'outlook' | 'apple', success: boolean) => {
    initPostHog()
    try {
      posthog.capture('calendar_export', {
        platform,
        success,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  },

  // User interactions
  trackFileUpload: (fileType: string, fileSize: number) => {
    initPostHog()
    try {
      posthog.capture('file_upload', {
        file_type: fileType,
        file_size: fileSize,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  },

  trackTextInput: (text: string) => {
    initPostHog()
    try {
      posthog.capture('typed_text', {
        text: text,
        length: text.length,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  },

  // Error tracking
  trackError: (error: Error, context: string) => {
    initPostHog()
    try {
      posthog.capture('error_occurred', {
        error_message: error.message,
        error_type: error.name,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  },

  // Page views
  trackPageView: (url: string) => {
    initPostHog()
    try {
      posthog.capture('$pageview', {
        $current_url: url,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('PostHog tracking error:', e)
    }
  }
} 