import { useState } from 'react'
import type { RankedRestaurant } from '../types'
import { submitFeedback } from '../services/supabase'
import { trackEvent } from '../utils/analytics'

const labels = [
  ['pair', '二人で座りやすかった'],
  ['conversation', '会話しやすかった'],
  ['comfort', '二人で居やすかった'],
  ['ease', '入店・注文がしやすかった'],
] as const

export function FeedbackModal({ restaurant, onClose, onSubmitted }: {
  restaurant: RankedRestaurant
  onClose: () => void
  onSubmitted: () => Promise<void> | void
}) {
  const [scores, setScores] = useState({ pair: 3, conversation: 3, comfort: 3, ease: 3 })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  async function send() {
    try {
      setSending(true)
      setMessage('')
      await submitFeedback({ googlePlaceId: restaurant.placeId, ...scores })
      trackEvent('feedback_submit', {
        place_id: restaurant.placeId, pair_score: scores.pair, conversation_score: scores.conversation,
        comfort_score: scores.comfort, ease_score: scores.ease,
      })
      await onSubmitted()
      setMessage('送信しました。事後ラー度を更新しました。')
      window.setTimeout(onClose, 900)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '送信できませんでした。')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="店舗フィードバック" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div><span className="eyebrow">事後ラー評価</span><h2>{restaurant.name}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <p className="modal__intro">実際に二人で利用した印象を1〜5で教えてください。評価は事後ラー独自データとして蓄積されます。</p>
        {labels.map(([key, label]) => (
          <label className="feedback-row" key={key}>
            <span>{label}</span>
            <select value={scores[key]} onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{'★'.repeat(value)}{'☆'.repeat(5-value)}</option>)}
            </select>
          </label>
        ))}
        <p className="modal__scale">★1 = 70 / ★2 = 78 / ★3 = 85 / ★4 = 93 / ★5 = 100相当</p>
        {message && <p className="status-message">{message}</p>}
        <button className="button button--primary button--wide" disabled={sending} onClick={send}>{sending ? '送信中…' : '送信する'}</button>
      </div>
    </div>
  )
}
