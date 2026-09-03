import { useMemo, useState } from 'react'
import type { AddressCandidate, FeedbackStatsRecord, HotelCandidate, Mood, RamenType, RankedRestaurant, SearchOrigin } from './types'
import { getCurrentLocation } from './services/geolocation'
import { searchAddresses, searchHotels, searchRamen } from './services/googleMaps'
import { fetchFeedbackStats, hasSupabaseConfig } from './services/supabase'
import { applyMood, evaluateRestaurant } from './scoring/scoring'
import { RestaurantCard } from './components/RestaurantCard'
import { FeedbackModal } from './components/FeedbackModal'
import { MapPanel } from './components/MapPanel'

const ramenLabels: { value: RamenType; label: string }[] = [
  { value: 'ramen', label: 'すべて' }, { value: 'iekei', label: '家系' }, { value: 'tonkotsu', label: '豚骨' },
  { value: 'miso', label: '味噌' }, { value: 'shio', label: '塩' }, { value: 'tsukemen', label: 'つけ麺' }, { value: 'aburasoba', label: '油そば' },
]
const moods: { value: Mood; label: string }[] = [
  { value: 'none', label: '指定なし' }, { value: 'stillTalking', label: '💕 まだ話したい' },
  { value: 'relaxed', label: '😌 ゆっくりしたい' }, { value: 'quick', label: '⚡ サクッと' },
]

type OriginMode = 'current' | 'hotel' | 'address'
type SortMode = 'jigo' | 'distance' | 'googleRating'

export default function App() {
  const [originMode, setOriginMode] = useState<OriginMode>('current')
  const [origin, setOrigin] = useState<SearchOrigin | null>(null)
  const [hotelQuery, setHotelQuery] = useState('')
  const [hotelCandidates, setHotelCandidates] = useState<HotelCandidate[]>([])
  const [addressQuery, setAddressQuery] = useState('')
  const [addressCandidates, setAddressCandidates] = useState<AddressCandidate[]>([])
  const [ramenType, setRamenType] = useState<RamenType>('ramen')
  const [mood, setMood] = useState<Mood>('none')
  const [radiusKm, setRadiusKm] = useState(0.5)
  const [openNow, setOpenNow] = useState(true)
  const [restaurants, setRestaurants] = useState<RankedRestaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [originLoading, setOriginLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [sortMode, setSortMode] = useState<SortMode>('jigo')
  const [feedbackTarget, setFeedbackTarget] = useState<RankedRestaurant | null>(null)

  const sortedRestaurants = useMemo(() => {
    const copy = [...restaurants]
    copy.sort((a, b) => {
      if (sortMode === 'distance') {
        if (a.distanceMeters !== b.distanceMeters) return a.distanceMeters - b.distanceMeters
        if (b.evaluation.baseScore !== a.evaluation.baseScore) return b.evaluation.baseScore - a.evaluation.baseScore
        return a.name.localeCompare(b.name, 'ja')
      }

      if (sortMode === 'googleRating') {
        const aRating = typeof a.googleRating === 'number' ? a.googleRating : -Infinity
        const bRating = typeof b.googleRating === 'number' ? b.googleRating : -Infinity
        if (bRating !== aRating) return bRating - aRating

        const aCount = typeof a.googleUserRatingCount === 'number' ? a.googleUserRatingCount : -1
        const bCount = typeof b.googleUserRatingCount === 'number' ? b.googleUserRatingCount : -1
        if (bCount !== aCount) return bCount - aCount
        if (b.evaluation.baseScore !== a.evaluation.baseScore) return b.evaluation.baseScore - a.evaluation.baseScore
        return a.distanceMeters - b.distanceMeters
      }

      if (b.evaluation.baseScore !== a.evaluation.baseScore) return b.evaluation.baseScore - a.evaluation.baseScore
      return a.distanceMeters - b.distanceMeters
    })
    return copy
  }, [restaurants, sortMode])

  function switchOriginMode(mode: OriginMode) {
    setOriginMode(mode)
    setOrigin(null)
    setHotelCandidates([])
    setAddressCandidates([])
    setError('')
  }

  async function useCurrentLocation() {
    try {
      setError('')
      const location = await getCurrentLocation()
      setOrigin({ label: '現在地', location, kind: 'current' })
    } catch (e) { setError(e instanceof Error ? e.message : '現在地を取得できませんでした。') }
  }

  async function findHotels() {
    if (!hotelQuery.trim()) return
    try {
      setOriginLoading(true); setError('')
      const results = await searchHotels(hotelQuery)
      setHotelCandidates(results)
      if (results.length === 0) setError('ホテル候補が見つかりませんでした。名称を少し変えて試してください。')
    } catch (e) { setError(e instanceof Error ? e.message : 'ホテル検索に失敗しました。') }
    finally { setOriginLoading(false) }
  }

  async function findAddresses() {
    if (!addressQuery.trim()) return
    try {
      setOriginLoading(true); setError('')
      const results = await searchAddresses(addressQuery)
      setAddressCandidates(results)
      if (results.length === 0) setError('住所候補が見つかりませんでした。都道府県・市区町村を含めて入力してください。')
    } catch (e) { setError(e instanceof Error ? e.message : '住所検索に失敗しました。') }
    finally { setOriginLoading(false) }
  }

  function chooseHotel(hotel: HotelCandidate) {
    setOrigin({ label: hotel.name, location: hotel.location, kind: 'hotel', placeId: hotel.placeId })
    setHotelCandidates([])
  }

  function chooseAddress(address: AddressCandidate) {
    setOrigin({ label: address.formattedAddress, location: address.location, kind: 'address', placeId: address.placeId })
    setAddressCandidates([])
  }

  function rankCandidates(candidates: Awaited<ReturnType<typeof searchRamen>>, stats: Map<string, FeedbackStatsRecord>): RankedRestaurant[] {
    return candidates.map((candidate) => ({ ...candidate, evaluation: evaluateRestaurant(candidate, stats.get(candidate.placeId), mood) }))
  }

  async function runSearch() {
    if (!origin) {
      const message = originMode === 'current'
        ? 'まず「現在地を取得」を押してください。'
        : originMode === 'hotel'
          ? 'ホテルを選択してください。'
          : '住所を検索して候補を選択してください。'
      setError(message)
      return
    }
    if (!hasSupabaseConfig) {
      setError('SupabaseのURL / Publishable Keyが未設定です。Ver.6.1のユーザー評価DBに必要です。')
      return
    }
    try {
      setLoading(true); setError('')
      const candidates = await searchRamen({ origin: origin.location, ramenType, radiusMeters: radiusKm * 1000, openNow })
      if (candidates.length === 0) {
        setRestaurants([])
        setError('Google Placesで条件に合う店舗が見つかりませんでした。検索範囲や「営業中のみ」を見直してください。')
        return
      }
      const stats = await fetchFeedbackStats(candidates.map((item) => item.placeId))
      setRestaurants(rankCandidates(candidates, stats))
      setView('list')
    } catch (e) { setError(e instanceof Error ? e.message : '検索に失敗しました。') }
    finally { setLoading(false) }
  }

  function updateMood(nextMood: Mood) {
    setMood(nextMood)
    setRestaurants((current) => current.map((r) => ({ ...r, evaluation: applyMood(r.evaluation, nextMood) })))
  }

  async function refreshScoresAfterFeedback() {
    if (restaurants.length === 0) return
    const stats = await fetchFeedbackStats(restaurants.map((item) => item.placeId))
    setRestaurants((current) => current.map((item) => ({ ...item, evaluation: evaluateRestaurant(item, stats.get(item.placeId), mood) })))
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <span className="brand-chip">JIGO RAMEN / V6.5</span>
        <h1>ふたりの余韻に、<br /><em>ちょうどいい一杯。</em></h1>
        <p>いまいる場所から、ふたりで行きやすいラーメン店を探します。</p>
      </header>

      <main>
        <section className="panel search-panel">
          <div className="section-heading"><span>01</span><div><h2>検索の起点</h2><p>現在地・ホテル名・住所から探します。</p></div></div>
          <div className="segmented segmented--three">
            <button className={originMode === 'current' ? 'active' : ''} onClick={() => switchOriginMode('current')}>📍 現在地</button>
            <button className={originMode === 'hotel' ? 'active' : ''} onClick={() => switchOriginMode('hotel')}>🏨 ホテル名</button>
            <button className={originMode === 'address' ? 'active' : ''} onClick={() => switchOriginMode('address')}>⌖ 住所</button>
          </div>

          {originMode === 'current' && (
            <div className="origin-action"><button className="button button--primary" onClick={useCurrentLocation}>現在地を取得</button>{origin?.kind === 'current' && <span className="selected-origin">✓ 現在地を設定済み</span>}</div>
          )}

          {originMode === 'hotel' && (
            <div className="hotel-search">
              <div className="inline-input"><input value={hotelQuery} onChange={(e) => setHotelQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && findHotels()} placeholder="例：ホテルバリアン なんば" /><button className="button button--primary" onClick={findHotels} disabled={originLoading}>{originLoading ? '検索中' : '候補検索'}</button></div>
              {hotelCandidates.length > 0 && <div className="hotel-results">{hotelCandidates.map((hotel) => <button key={hotel.placeId} onClick={() => chooseHotel(hotel)}><strong>{hotel.name}</strong><span>このホテル周辺を検索 →</span></button>)}</div>}
              {origin?.kind === 'hotel' && <div className="selected-origin">✓ {origin.label}</div>}
            </div>
          )}

          {originMode === 'address' && (
            <div className="hotel-search">
              <div className="inline-input"><input value={addressQuery} onChange={(e) => setAddressQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && findAddresses()} placeholder="例：大阪市中央区難波1丁目" /><button className="button button--primary" onClick={findAddresses} disabled={originLoading}>{originLoading ? '検索中' : '住所検索'}</button></div>
              {addressCandidates.length > 0 && <div className="hotel-results">{addressCandidates.map((address, index) => <button key={address.placeId ?? `${address.formattedAddress}-${index}`} onClick={() => chooseAddress(address)}><strong>{address.label}</strong><span>この住所周辺を検索 →</span></button>)}</div>}
              {origin?.kind === 'address' && <div className="selected-origin">✓ {origin.label}</div>}
            </div>
          )}

          <div className="section-heading section-heading--compact"><span>02</span><div><h2>条件</h2></div></div>
          <div className="control-grid">
            <label>ラーメン種類<select value={ramenType} onChange={(e) => setRamenType(e.target.value as RamenType)}>{ramenLabels.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
            <label>検索範囲<select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}><option value={0.5}>500m</option><option value={1}>1km</option><option value={1.5}>1.5km</option><option value={3}>3km</option></select></label>
          </div>
          <label className="check-row"><input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} /> 今営業中の店だけ</label>

          <div className="section-heading section-heading--compact"><span>03</span><div><h2>今の気分 <small>任意</small></h2></div></div>
          <div className="mood-chips">{moods.map((item) => <button key={item.value} className={mood === item.value ? 'active' : ''} onClick={() => updateMood(item.value)}>{item.label}</button>)}</div>

          <button className="search-button" onClick={runSearch} disabled={loading}>{loading ? '周辺のラーメン店を網羅検索中…' : 'おすすめを見る'}</button>
          {error && <div className="error-box">{error}</div>}
        </section>

        {sortedRestaurants.length > 0 && origin && (
          <section className="results-section">
            <div className="results-header">
              <div><span className="eyebrow">{origin.label}</span><h2>{sortedRestaurants.length}件を比較</h2></div>
              <div className="results-actions">
                <label className="sort-control">
                  <span>並び替え</span>
                  <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} aria-label="一覧の並び替え">
                    <option value="jigo">事後ラー度（高い順）</option>
                    <option value="distance">距離（近い順）</option>
                    <option value="googleRating">Googleマップ評価（高い順）</option>
                  </select>
                </label>
                <div className="view-toggle"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>一覧</button><button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>地図</button></div>
              </div>
            </div>
            {view === 'list' ? <div className="restaurant-list">{sortedRestaurants.map((restaurant) => <RestaurantCard key={restaurant.placeId} restaurant={restaurant} moodActive={mood !== 'none'} onFeedback={setFeedbackTarget} />)}</div> : <MapPanel origin={origin} restaurants={sortedRestaurants} moodActive={mood !== 'none'} radiusMeters={radiusKm * 1000} />}
          </section>
        )}
      </main>

      <section className="area-discovery" aria-labelledby="area-discovery-title">
        <span className="eyebrow">AREA</span>
        <h2 id="area-discovery-title">エリアから探す</h2>
        <p>大阪の夜によく利用されるエリアから、今営業中のラーメン店探しを始められます。</p>
        <nav className="area-link-grid" aria-label="エリアから探す">
          <a href="/area/namba"><span>難波</span><small>深夜ラーメンを探す →</small></a>
          <a href="/area/umeda"><span>梅田</span><small>深夜ラーメンを探す →</small></a>
          <a href="/area/shinsaibashi"><span>心斎橋</span><small>深夜ラーメンを探す →</small></a>
        </nav>
      </section>

      <footer>
        <span>ユーザーフィードバックが増えるほど、事後ラー度の精度が高まります。データが少ない店舗はGoogle Mapsの評価などを参考に暫定算出しています。</span>
        <div className="footer-meta">
          <span>店舗情報・Google評価: Google Maps</span>
          <nav className="footer-links" aria-label="フッターナビゲーション">
            <a href="/about">運営者情報</a>
            <a href="/contact">お問い合わせ</a>
            <a href="/terms">利用規約</a>
            <a href="/privacy">プライバシーポリシー</a>
          </nav>
        </div>
      </footer>
      {feedbackTarget && <FeedbackModal restaurant={feedbackTarget} onClose={() => setFeedbackTarget(null)} onSubmitted={refreshScoresAfterFeedback} />}
    </div>
  )
}
