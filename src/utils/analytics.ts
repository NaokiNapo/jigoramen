import type { Mood, RamenType, SearchOrigin } from '../types'

type SearchParams = {
  origin_type: SearchOrigin['kind']
  ramen_type: RamenType
  radius_km: number
  open_now: boolean
  mood: Mood
}

type EventParams = {
  search: SearchParams & { area_name?: string }
  search_result: SearchParams & { result_count: number }
  shop_click: {
    place_id: string
    shop_name: string
    jigo_score?: number
    distance_meters?: number
    google_rating?: number
    sample_count?: number
  }
  feedback_submit: {
    place_id: string
    pair_score: number
    conversation_score: number
    comfort_score: number
    ease_score: number
  }
  area_cta_click: {
    area_name: string
    area_slug: string
    prefecture_name: string
    region_name: string
  }
  view_change: { view: 'list' | 'map'; result_count: number }
  sort_change: { sort_mode: 'jigo' | 'distance' | 'googleRating'; result_count: number }
}

type AnalyticsValue = string | number | boolean | undefined

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: Record<string, AnalyticsValue>) => void
  }
}

/** Send only curated event fields, never search input, coordinates, or user IDs. */
export function trackEvent<Name extends keyof EventParams>(eventName: Name, params: EventParams[Name]): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && (typeof value !== 'number' || Number.isFinite(value))),
  )
  try {
    window.gtag('event', eventName, {
      ...cleanParams,
      ...(import.meta.env.DEV ? { debug_mode: true } : {}),
    })
  } catch {
    // Analytics must never interrupt navigation, searches, or successful feedback.
  }
}
