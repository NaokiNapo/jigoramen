import { scoreBackground } from '../utils/scoreColor'

export function ScoreBadge({ score, label = '事後ラー度', accent = false }: { score: number; label?: string; accent?: boolean }) {
  return (
    <div
      className={`score-badge ${accent ? 'score-badge--accent' : ''}`}
      style={{ background: scoreBackground(score) }}
    >
      <span className="score-badge__label">{label}</span>
      <strong>{score.toFixed(1)}</strong>
    </div>
  )
}
