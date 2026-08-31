import { useEffect, useRef } from 'react'
import type { RankedRestaurant, SearchOrigin } from '../types'
import { googleMapsDetailsUrl, loadGoogleMaps } from '../services/googleMaps'
import { formatDistance } from '../utils/distance'
import { scoreBackground } from '../utils/scoreColor'

function radiusBounds(origin: SearchOrigin['location'], radiusMeters: number): google.maps.LatLngBoundsLiteral {
  const latDelta = radiusMeters / 111_320
  const lngScale = Math.max(0.2, Math.cos((origin.lat * Math.PI) / 180))
  const lngDelta = radiusMeters / (111_320 * lngScale)
  return {
    north: origin.lat + latDelta,
    south: origin.lat - latDelta,
    east: origin.lng + lngDelta,
    west: origin.lng - lngDelta,
  }
}

function buildInfoContent(restaurant: RankedRestaurant, score: number, moodActive: boolean) {
  const card = document.createElement('div')
  card.className = 'map-info-card'

  const header = document.createElement('div')
  header.className = 'map-info-card__header'

  const scoreBox = document.createElement('div')
  scoreBox.className = 'map-info-card__score'
  scoreBox.style.background = scoreBackground(score)
  scoreBox.innerHTML = `<small>${moodActive ? '今夜の相性' : '事後ラー度'}</small><strong>${score.toFixed(1)}</strong>`

  const identity = document.createElement('div')
  identity.className = 'map-info-card__identity'

  const name = document.createElement('strong')
  name.textContent = restaurant.name
  identity.appendChild(name)

  const meta = document.createElement('span')
  const googleRating = typeof restaurant.googleRating === 'number' ? ` ・ Google ★${restaurant.googleRating.toFixed(1)}` : ''
  meta.textContent = `${formatDistance(restaurant.distanceMeters)}${googleRating}`
  identity.appendChild(meta)

  header.append(scoreBox, identity)

  const link = document.createElement('a')
  link.className = 'map-info-card__button'
  link.href = googleMapsDetailsUrl(restaurant.placeId, restaurant.name)
  link.target = '_blank'
  link.rel = 'noreferrer'
  link.textContent = 'Googleマップで詳細を見る'

  card.append(header, link)
  return card
}

export function MapPanel({ origin, restaurants, moodActive, radiusMeters }: {
  origin: SearchOrigin
  restaurants: RankedRestaurant[]
  moodActive: boolean
  radiusMeters: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    const markers: google.maps.marker.AdvancedMarkerElement[] = []
    let infoWindow: google.maps.InfoWindow | null = null

    async function render() {
      if (!ref.current) return
      await loadGoogleMaps()
      const { Map, InfoWindow } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary
      if (disposed || !ref.current) return

      const map = new Map(ref.current, {
        center: origin.location,
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID',
        disableDefaultUI: true,
        zoomControl: true,
      })
      infoWindow = new InfoWindow()

      // 選択した検索半径全体が画面に収まるよう、距離ごとに表示範囲を自動調整する。
      map.fitBounds(radiusBounds(origin.location, radiusMeters), 34)

      const originDot = document.createElement('div')
      originDot.className = 'origin-marker'
      originDot.textContent = origin.kind === 'hotel' ? '🏨' : origin.kind === 'address' ? '⌖' : '●'
      markers.push(new AdvancedMarkerElement({ map, position: origin.location, content: originDot, title: origin.label }))

      for (const restaurant of restaurants) {
        const score = moodActive
          ? (restaurant.evaluation.tonightScore ?? restaurant.evaluation.baseScore)
          : restaurant.evaluation.baseScore

        const pin = document.createElement('button')
        pin.type = 'button'
        pin.className = 'score-marker'
        pin.textContent = score.toFixed(1)
        pin.title = `${restaurant.name}の詳細を表示`
        pin.setAttribute('aria-label', `${restaurant.name}、${score.toFixed(1)}点。詳細を表示`)
        pin.style.background = scoreBackground(score)

        const marker = new AdvancedMarkerElement({ map, position: restaurant.location, content: pin, title: restaurant.name })

        pin.addEventListener('click', () => {
          if (!infoWindow) return
          infoWindow.setContent(buildInfoContent(restaurant, score, moodActive))
          infoWindow.open({ map, anchor: marker, shouldFocus: false })
        })

        markers.push(marker)
      }
    }

    render().catch(console.error)
    return () => {
      disposed = true
      infoWindow?.close()
      markers.forEach((marker) => { marker.map = null })
    }
  }, [origin, restaurants, moodActive, radiusMeters])

  return <div className="map-panel" ref={ref} />
}
