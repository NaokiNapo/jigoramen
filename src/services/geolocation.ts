import type { LatLng } from '../types'

export function getCurrentLocation(): Promise<LatLng> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('このブラウザは位置情報に対応していません。'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? '位置情報が拒否されました。ブラウザ設定で許可してください。'
          : '現在地を取得できませんでした。'
        reject(new Error(message))
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  })
}
