import type { AxisScores, ChainMatch, Evaluation, FeedbackStatsRecord, Mood, PlaceCandidate, ScoreStage } from '../types'
import { matchChainPrior } from '../data/chainPriors'

export const CENTER = 85
export const MIN_SCORE = 70
export const MAX_SCORE = 100
export const NEUTRAL_PRIOR_VOTES = 4
export const CHAIN_PRIOR_VOTES = 6
export const GOOGLE_INITIAL_MIN = 80
export const GOOGLE_INITIAL_MAX = 90
export const GOOGLE_DECAY_REVIEWS = 5
export const GOOGLE_NON_CHAIN_MAX_ADJUSTMENT = 2
export const GOOGLE_CHAIN_MAX_ADJUSTMENT = 2

function clamp(value: number, min = MIN_SCORE, max = MAX_SCORE): number {
  return Math.min(max, Math.max(min, value))
}

function roundScore(value: number): number {
  return Math.round(clamp(value) * 10) / 10
}

export function baseFromAxes(axes: AxisScores): number {
  return axes.pair * 0.35 + axes.conversation * 0.25 + axes.comfort * 0.25 + axes.ease * 0.15
}

function moodWeighted(axes: AxisScores, mood: Mood): number {
  switch (mood) {
    case 'stillTalking':
      return axes.pair * 0.35 + axes.conversation * 0.40 + axes.comfort * 0.20 + axes.ease * 0.05
    case 'relaxed':
      return axes.pair * 0.20 + axes.conversation * 0.20 + axes.comfort * 0.50 + axes.ease * 0.10
    case 'quick':
      return axes.pair * 0.15 + axes.conversation * 0.05 + axes.comfort * 0.20 + axes.ease * 0.60
    default:
      return baseFromAxes(axes)
  }
}

function ratingToScore(rating: number): number {
  return roundScore(70 + (rating - 1) * 7.5)
}

function statsAxes(stats: FeedbackStatsRecord | undefined): AxisScores | undefined {
  if (!stats || stats.sample_count <= 0) return undefined
  return {
    pair: ratingToScore(Number(stats.avg_pair_rating)),
    conversation: ratingToScore(Number(stats.avg_conversation_rating)),
    comfort: ratingToScore(Number(stats.avg_comfort_rating)),
    ease: ratingToScore(Number(stats.avg_ease_rating)),
  }
}

function blendAxis(chainValue: number | undefined, userValue: number | undefined, n: number): number {
  const chainVotes = chainValue === undefined ? 0 : CHAIN_PRIOR_VOTES
  const denominator = NEUTRAL_PRIOR_VOTES + chainVotes + n
  const numerator = CENTER * NEUTRAL_PRIOR_VOTES + (chainValue ?? 0) * chainVotes + (userValue ?? 0) * n
  return clamp(numerator / denominator)
}

function stageFor(n: number, chainMatch: ChainMatch | undefined): ScoreStage {
  if (n === 0) return chainMatch ? 'chainBaseline' : 'neutralBaseline'
  if (n <= 2) return 'reference'
  if (n <= 9) return 'provisional'
  return 'established'
}

export function stageLabel(stage: ScoreStage): string {
  switch (stage) {
    case 'chainBaseline': return 'チェーン基準値'
    case 'neutralBaseline': return '初期推定値'
    case 'reference': return '参考値'
    case 'provisional': return '暫定スコア'
    case 'established': return 'ユーザー評価'
  }
}

/**
 * Google★4.0を85点の中心として、★3.5以下=80、★4.5以上=90にクリップ。
 * これは検索セッション中だけ使う初期補正で、DBには保存しない。
 */
export function googleRatingToInitialTarget(rating: number | undefined): number | undefined {
  if (typeof rating !== 'number' || !Number.isFinite(rating)) return undefined
  return clamp(CENTER + (rating - 4.0) * 10, GOOGLE_INITIAL_MIN, GOOGLE_INITIAL_MAX)
}

/** ユーザー評価5件でGoogle補正を完全に0にする。 */
export function googleAdjustmentWeight(sampleCount: number): number {
  return Math.max(0, 1 - sampleCount / GOOGLE_DECAY_REVIEWS)
}

export function evaluateRestaurant(place: Pick<PlaceCandidate, 'name' | 'googleRating'>, stats: FeedbackStatsRecord | undefined, mood: Mood): Evaluation {
  const chainMatch = matchChainPrior(place.name)
  const userAxes = statsAxes(stats)
  const sampleCount = stats?.sample_count ?? 0
  const chainAxes = chainMatch?.prior.axes

  const rawAxes: AxisScores = {
    pair: blendAxis(chainAxes?.pair, userAxes?.pair, sampleCount),
    conversation: blendAxis(chainAxes?.conversation, userAxes?.conversation, sampleCount),
    comfort: blendAxis(chainAxes?.comfort, userAxes?.comfort, sampleCount),
    ease: blendAxis(chainAxes?.ease, userAxes?.ease, sampleCount),
  }

  const priorBase = clamp(baseFromAxes(rawAxes))
  const googleAdjustmentEnabled = String(import.meta.env.VITE_USE_GOOGLE_RATING_INITIAL_ADJUSTMENT ?? 'true').toLowerCase() !== 'false'
  const googleTarget = googleAdjustmentEnabled ? googleRatingToInitialTarget(place.googleRating) : undefined
  const googleWeight = googleTarget === undefined ? 0 : googleAdjustmentWeight(sampleCount)

  // Google★による初期補正は最大±2点。途中で整数化せず連続値のまま計算し、
  // 最終スコアだけ0.1点単位に丸める。チェーンはChain Priorを基準に補正する。
  const normalizedGoogleDelta = googleTarget === undefined
    ? 0
    : Math.max(-1, Math.min(1, (googleTarget - CENTER) / (GOOGLE_INITIAL_MAX - CENTER)))
  const fullGoogleAdjustment = googleTarget === undefined
    ? 0
    : normalizedGoogleDelta * (chainMatch ? GOOGLE_CHAIN_MAX_ADJUSTMENT : GOOGLE_NON_CHAIN_MAX_ADJUSTMENT)
  const googleAdjustment = fullGoogleAdjustment * googleWeight

  const priorVirtualVotes = NEUTRAL_PRIOR_VOTES + (chainMatch ? CHAIN_PRIOR_VOTES : 0)
  const userInfluence = sampleCount / (priorVirtualVotes + sampleCount)
  const confidenceFloor = chainMatch ? 0.42 : googleTarget !== undefined ? 0.28 : 0.15
  const confidence = Math.min(0.97, confidenceFloor + userInfluence * (1 - confidenceFloor))
  const baseScore = roundScore(priorBase + googleAdjustment)
  const source: Evaluation['source'] = sampleCount > 0 ? 'user_feedback' : chainMatch ? 'chain_prior' : 'neutral_prior'

  const evidence: string[] = []
  if (chainMatch) evidence.push(`${chainMatch.prior.name}のChain Priorを適用`)
  else evidence.push('非チェーンPrior 85を適用')
  if (googleTarget !== undefined && googleWeight > 0) {
    evidence.push(`Google ★${place.googleRating?.toFixed(1)}を初期補正に${Math.round(googleWeight * 100)}%反映`)
  }
  if (sampleCount > 0) evidence.push(`ユーザー評価${sampleCount}件を反映`)
  if (sampleCount >= GOOGLE_DECAY_REVIEWS && googleTarget !== undefined) evidence.push('Google初期補正は終了')

  const evaluation: Evaluation = {
    axes: {
      pair: roundScore(rawAxes.pair),
      conversation: roundScore(rawAxes.conversation),
      comfort: roundScore(rawAxes.comfort),
      ease: roundScore(rawAxes.ease),
    },
    baseScore,
    confidence,
    sampleCount,
    source,
    stage: stageFor(sampleCount, chainMatch),
    chainMatch,
    userInfluence,
    priorVirtualVotes,
    googleInitialTarget: googleTarget === undefined ? undefined : roundScore(googleTarget),
    googleAdjustment: roundScore(googleAdjustment),
    googleAdjustmentWeight: googleWeight,
    evidence,
  }

  return applyMood(evaluation, mood)
}

export function confidenceLabel(confidence: number): '高' | '中' | '低' {
  if (confidence >= 0.75) return '高'
  if (confidence >= 0.45) return '中'
  return '低'
}

export function applyMood(evaluation: Evaluation, mood: Mood): Evaluation {
  if (mood === 'none') return { ...evaluation, tonightScore: undefined }
  const rawBase = baseFromAxes(evaluation.axes)
  const weighted = moodWeighted(evaluation.axes, mood)
  const delta = Math.max(-6, Math.min(6, (weighted - rawBase) * 0.8))
  return { ...evaluation, tonightScore: roundScore(evaluation.baseScore + delta) }
}
