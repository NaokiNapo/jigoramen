import type { AddressCandidate, HotelCandidate, LatLng, PlaceCandidate, RamenType } from '../types'
import { haversineMeters } from '../utils/distance'

let googlePromise: Promise<typeof google> | null = null

export async function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window.google !== 'undefined' && typeof window.google.maps.importLibrary === 'function') return window.google
  if (googlePromise) return googlePromise

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key || key.includes('YOUR_')) throw new Error('VITE_GOOGLE_MAPS_API_KEY が未設定です。.env を確認してください。')

  googlePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-jigoramen-google-maps]')
    if (existing) {
      reject(new Error('Google Mapsの古い読み込み状態が残っています。開発サーバーを再起動し、ブラウザをCtrl+F5で再読み込みしてください。'))
      return
    }

    const callbackName = '__jigoramenGoogleMapsReady'
    const callbackWindow = window as typeof window & Record<string, unknown>
    callbackWindow[callbackName] = () => {
      delete callbackWindow[callbackName]
      if (typeof window.google?.maps?.importLibrary !== 'function') {
        reject(new Error('Google Maps JavaScript APIは読み込まれましたが、importLibrary()を利用できません。API設定を確認してください。'))
        return
      }
      resolve(window.google)
    }

    const script = document.createElement('script')
    const params = new URLSearchParams({ key, v: 'weekly', language: 'ja', region: 'JP', loading: 'async', callback: callbackName })
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.defer = true
    script.dataset.jigoramenGoogleMaps = '1'
    script.onerror = () => {
      delete callbackWindow[callbackName]
      reject(new Error('Google Maps JavaScript APIを読み込めませんでした。APIキーと制限を確認してください。'))
    }
    document.head.appendChild(script)
  })
  return googlePromise
}

const ramenQueries: Record<RamenType, string[]> = {
  ramen: ['ラーメン', '中華そば', 'つけ麺', '油そば', 'まぜそば'],
  iekei: ['家系ラーメン', '横浜家系ラーメン'],
  tonkotsu: ['豚骨ラーメン', '博多ラーメン'],
  miso: ['味噌ラーメン', 'みそラーメン'],
  shio: ['塩ラーメン', 'しおラーメン'],
  tsukemen: ['つけ麺', 'つけめん'],
  aburasoba: ['油そば', 'まぜそば'],
}

const SEARCH_RESULT_LIMIT = 20
const WEEK_MINUTES = 7 * 24 * 60

type PlaceLike = google.maps.places.Place

function movePoint(origin: LatLng, northMeters: number, eastMeters: number): LatLng {
  const latDelta = northMeters / 111_320
  const lngScale = Math.max(0.2, Math.cos((origin.lat * Math.PI) / 180))
  const lngDelta = eastMeters / (111_320 * lngScale)
  return { lat: origin.lat + latDelta, lng: origin.lng + lngDelta }
}

function gridCenters(origin: LatLng, radiusMeters: number): LatLng[] {
  // 中央検索だけでは20件上限で密集地を取りこぼすため、外周側にも検索中心を置く。
  if (radiusMeters <= 500) {
    const d = 230
    return [
      movePoint(origin, d, 0), movePoint(origin, -d, 0), movePoint(origin, 0, d), movePoint(origin, 0, -d),
      movePoint(origin, d * 0.72, d * 0.72), movePoint(origin, d * 0.72, -d * 0.72),
      movePoint(origin, -d * 0.72, d * 0.72), movePoint(origin, -d * 0.72, -d * 0.72),
    ]
  }

  if (radiusMeters <= 1000) {
    const d = 520
    return [
      movePoint(origin, d, 0), movePoint(origin, -d, 0), movePoint(origin, 0, d), movePoint(origin, 0, -d),
      movePoint(origin, d * 0.72, d * 0.72), movePoint(origin, d * 0.72, -d * 0.72),
      movePoint(origin, -d * 0.72, d * 0.72), movePoint(origin, -d * 0.72, -d * 0.72),
    ]
  }

  if (radiusMeters <= 1500) {
    const ringDistance = 780
    const count = 8
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count
      return movePoint(origin, Math.cos(angle) * ringDistance, Math.sin(angle) * ringDistance)
    })
  }

  // 3kmは1リングだけだと中心部または外周に穴ができるため、内外2リングで覆う。
  const rings = [{ distance: 800, count: 8 }, { distance: 2100, count: 12 }]
  return rings.flatMap(({ distance, count }) => Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count
    return movePoint(origin, Math.cos(angle) * distance, Math.sin(angle) * distance)
  }))
}

function localCellRadius(radiusMeters: number): number {
  if (radiusMeters <= 500) return 360
  if (radiusMeters <= 1000) return 620
  if (radiusMeters <= 1500) return 900
  return 1300
}

function currentOpeningHoursIsOpen(hours: google.maps.places.OpeningHours | null | undefined): boolean | undefined {
  const periods = hours?.periods
  if (!periods || periods.length === 0) return undefined

  const now = new Date()
  const current = now.getDay() * 24 * 60 + now.getHours() * 60 + now.getMinutes()

  return periods.some((period) => {
    const start = period.open.day * 24 * 60 + period.open.hour * 60 + period.open.minute
    if (!period.close) return true
    let end = period.close.day * 24 * 60 + period.close.hour * 60 + period.close.minute
    if (end <= start) end += WEEK_MINUTES
    return (current >= start && current < end) || (current + WEEK_MINUTES >= start && current + WEEK_MINUTES < end)
  })
}

function placeToCandidate(place: PlaceLike, origin: LatLng): PlaceCandidate | undefined {
  if (!place.id || !place.displayName || !place.location) return undefined
  const location = { lat: place.location.lat(), lng: place.location.lng() }
  return {
    placeId: place.id,
    name: place.displayName,
    location,
    distanceMeters: haversineMeters(origin, location),
    googleRating: typeof place.rating === 'number' ? place.rating : undefined,
    googleUserRatingCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    businessStatus: place.businessStatus ? String(place.businessStatus) : undefined,
    isOpenNow: currentOpeningHoursIsOpen(place.currentOpeningHours),
  }
}

function mergeCandidate(target: Map<string, PlaceCandidate>, candidate: PlaceCandidate): void {
  const existing = target.get(candidate.placeId)
  if (!existing) {
    target.set(candidate.placeId, candidate)
    return
  }
  target.set(candidate.placeId, {
    ...existing,
    googleRating: existing.googleRating ?? candidate.googleRating,
    googleUserRatingCount: existing.googleUserRatingCount ?? candidate.googleUserRatingCount,
    businessStatus: existing.businessStatus ?? candidate.businessStatus,
    isOpenNow: existing.isOpenNow ?? candidate.isOpenNow,
    distanceMeters: Math.min(existing.distanceMeters, candidate.distanceMeters),
  })
}

async function safeSearch(task: () => Promise<PlaceLike[]>): Promise<PlaceLike[]> {
  try {
    return await task()
  } catch (error) {
    console.warn('[JigoRamen] Google Places sub-search failed; continuing with remaining searches.', error)
    return []
  }
}

export async function searchRamen(params: {
  origin: LatLng
  ramenType: RamenType
  radiusMeters: number
  openNow: boolean
}): Promise<PlaceCandidate[]> {
  await loadGoogleMaps()
  const { Place, SearchByTextRankPreference, SearchNearbyRankPreference } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
  const showGoogleRating = String(import.meta.env.VITE_SHOW_GOOGLE_RATING ?? 'true').toLowerCase() !== 'false'
  const useGoogleInitialAdjustment = String(import.meta.env.VITE_USE_GOOGLE_RATING_INITIAL_ADJUSTMENT ?? 'true').toLowerCase() !== 'false'
  const fields = ['id', 'displayName', 'location', 'businessStatus']
  if (showGoogleRating || useGoogleInitialAdjustment) fields.push('rating', 'userRatingCount')
  if (params.openNow) fields.push('currentOpeningHours')

  const collected = new Map<string, PlaceCandidate>()
  let saturated = false

  const absorb = (places: PlaceLike[]) => {
    if (places.length >= SEARCH_RESULT_LIMIT) saturated = true
    for (const place of places) {
      const candidate = placeToCandidate(place, params.origin)
      if (candidate) mergeCandidate(collected, candidate)
    }
  }

  const nearby = async (center: LatLng, radius: number, rankPreference: google.maps.places.SearchNearbyRankPreference) => {
    return safeSearch(async () => {
      const request: google.maps.places.SearchNearbyRequest = {
        fields,
        locationRestriction: { center, radius: Math.max(100, Math.min(radius, 50_000)) },
        includedTypes: ['ramen_restaurant'],
        language: 'ja',
        region: 'JP',
        maxResultCount: SEARCH_RESULT_LIMIT,
        rankPreference,
      }
      const { places } = await Place.searchNearby(request)
      return places
    })
  }

  const text = async (query: string) => {
    return safeSearch(async () => {
      const request: google.maps.places.SearchByTextRequest = {
        textQuery: query,
        fields,
        locationBias: { center: params.origin, radius: Math.min(params.radiusMeters, 50_000) },
        isOpenNow: false,
        language: 'ja',
        region: 'JP',
        maxResultCount: SEARCH_RESULT_LIMIT,
        rankPreference: SearchByTextRankPreference.RELEVANCE,
      }
      const { places } = await Place.searchByText(request)
      return places
    })
  }

  // Stage 1: type-based search from the actual origin, with both popularity and distance ranking.
  const [popularPlaces, nearestPlaces, primaryTextPlaces] = await Promise.all([
    nearby(params.origin, params.radiusMeters, SearchNearbyRankPreference.POPULARITY),
    nearby(params.origin, params.radiusMeters, SearchNearbyRankPreference.DISTANCE),
    text(ramenQueries[params.ramenType][0]),
  ])
  absorb(popularPlaces)
  absorb(nearestPlaces)
  absorb(primaryTextPlaces)

  // Stage 2: text variants catch stores whose Google category/type tagging is incomplete or wording differs.
  const variants = ramenQueries[params.ramenType].slice(1)
  if (variants.length > 0) {
    const variantResults = await Promise.all(variants.map((query) => text(query)))
    variantResults.forEach(absorb)
  }

  // Stage 3: only when a 20-result ceiling was observed, split the area into smaller nearby searches.
  // This specifically fixes dense districts such as Namba/Dotonbori, Shinjuku and Ikebukuro.
  if (saturated) {
    const centers = gridCenters(params.origin, params.radiusMeters)
    const cellRadius = localCellRadius(params.radiusMeters)
    const gridResults = await Promise.all(
      centers.map((center) => nearby(center, cellRadius, SearchNearbyRankPreference.DISTANCE)),
    )
    gridResults.forEach(absorb)
  }

  let candidates = [...collected.values()]
    .filter((candidate) => candidate.distanceMeters <= params.radiusMeters)
    .filter((candidate) => candidate.businessStatus !== 'CLOSED_PERMANENTLY')

  if (params.openNow) {
    // 営業時間不明の店を「営業中」と断定しない。取得できた currentOpeningHours で営業中と確認できた店だけ残す。
    candidates = candidates.filter((candidate) => candidate.isOpenNow === true)
  }

  candidates.sort((a, b) => a.distanceMeters - b.distanceMeters)
  return candidates
}

export async function searchHotels(query: string): Promise<HotelCandidate[]> {
  await loadGoogleMaps()
  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
  const normalized = query.trim()
  if (!normalized) return []
  const request: google.maps.places.SearchByTextRequest = {
    textQuery: `${normalized} ホテル`, fields: ['id', 'displayName', 'location'], language: 'ja', region: 'JP', maxResultCount: 5,
  }
  const { places } = await Place.searchByText(request)
  return places.filter((p) => p.id && p.displayName && p.location).map((p) => ({
    placeId: p.id, name: p.displayName!, location: { lat: p.location!.lat(), lng: p.location!.lng() },
  }))
}

export async function searchAddresses(query: string): Promise<AddressCandidate[]> {
  await loadGoogleMaps()
  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
  const normalized = query.trim()
  if (!normalized) return []

  const request: google.maps.places.SearchByTextRequest = {
    textQuery: normalized,
    fields: ['id', 'displayName', 'formattedAddress', 'location'],
    language: 'ja',
    region: 'JP',
    maxResultCount: 5,
  }
  const { places } = await Place.searchByText(request)
  return places
    .filter((p) => p.location)
    .map((p) => {
      const formattedAddress = p.formattedAddress || p.displayName || normalized
      return {
        placeId: p.id || undefined,
        label: p.displayName && p.displayName !== formattedAddress ? `${p.displayName} — ${formattedAddress}` : formattedAddress,
        formattedAddress,
        location: { lat: p.location!.lat(), lng: p.location!.lng() },
      }
    })
}

export function googleMapsDetailsUrl(placeId: string, placeName: string): string {
  const params = new URLSearchParams({ api: '1', query: placeName, query_place_id: placeId })
  return `https://www.google.com/maps/search/?${params.toString()}`
}
