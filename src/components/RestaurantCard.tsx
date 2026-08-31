import type { RankedRestaurant } from '../types'
import { confidenceLabel } from '../scoring/scoring'
import { formatDistance } from '../utils/distance'
import { googleMapsDetailsUrl } from '../services/googleMaps'
import { ScoreBadge } from './ScoreBadge'

function axisLabel(score: number) {
  if (score >= 94) return '◎'
  if (score >= 86) return '○'
  if (score >= 78) return '△'
  return '—'
}


export function RestaurantCard({ restaurant, moodActive, onFeedback }: {
  restaurant: RankedRestaurant
  moodActive: boolean
  onFeedback: (restaurant: RankedRestaurant) => void
}) {
  const { evaluation } = restaurant
  const topScore = moodActive ? (evaluation.tonightScore ?? evaluation.baseScore) : evaluation.baseScore

  return (
    <article className="restaurant-card">
      <div className="restaurant-card__top">
        <ScoreBadge score={topScore} label={moodActive ? '今夜の相性' : '事後ラー度'} accent={moodActive} />
        <div className="restaurant-card__identity">
          <h3>{restaurant.name}</h3>
          <div className="meta-row">
            <span>{formatDistance(restaurant.distanceMeters)}</span>
          </div>
          {typeof restaurant.googleRating === 'number' && (
            <div className="google-rating">Google ★{restaurant.googleRating.toFixed(1)}{typeof restaurant.googleUserRatingCount === 'number' && `（${restaurant.googleUserRatingCount.toLocaleString()}件）`}</div>
          )}
        </div>
      </div>

      <div className="axes-grid">
        <span>二人で座る <b>{axisLabel(evaluation.axes.pair)} {evaluation.axes.pair.toFixed(1)}</b></span>
        <span>会話 <b>{axisLabel(evaluation.axes.conversation)} {evaluation.axes.conversation.toFixed(1)}</b></span>
        <span>居心地 <b>{axisLabel(evaluation.axes.comfort)} {evaluation.axes.comfort.toFixed(1)}</b></span>
        <span>利用しやすさ <b>{axisLabel(evaluation.axes.ease)} {evaluation.axes.ease.toFixed(1)}</b></span>
      </div>

      <div className="score-explain-row">
        <span>ユーザーフィードバック {evaluation.sampleCount}件</span>
        <span>信頼度 {confidenceLabel(evaluation.confidence)}</span>
      </div>

      <div className="card-actions">
        <a className="button button--primary" href={googleMapsDetailsUrl(restaurant.placeId, restaurant.name)} target="_blank" rel="noreferrer">Googleマップで詳細</a>
        <button className="button button--ghost" type="button" onClick={() => onFeedback(restaurant)}>事後ラー評価をする</button>
      </div>
    </article>
  )
}
