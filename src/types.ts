export type LatLng = { lat: number; lng: number }

export type SearchOrigin = {
  label: string
  location: LatLng
  kind: 'current' | 'hotel' | 'address'
  placeId?: string
}

export type RamenType = 'ramen' | 'iekei' | 'tonkotsu' | 'miso' | 'shio' | 'tsukemen' | 'aburasoba'
export type Mood = 'none' | 'stillTalking' | 'relaxed' | 'quick'

export type PlaceCandidate = {
  placeId: string
  name: string
  location: LatLng
  distanceMeters: number
  googleRating?: number
  googleUserRatingCount?: number
  businessStatus?: string
  isOpenNow?: boolean
}

export type AxisScores = {
  pair: number
  conversation: number
  comfort: number
  ease: number
}

export type FeedbackStatsRecord = {
  google_place_id: string
  avg_pair_rating: number
  avg_conversation_rating: number
  avg_comfort_rating: number
  avg_ease_rating: number
  sample_count: number
  last_feedback_at: string | null
}

export type ChainPrior = {
  key: string
  name: string
  aliases: string[]
  axes: AxisScores
  confidence: 'A' | 'B' | 'C'
}

export type ChainMatch = {
  prior: ChainPrior
  matchedAlias: string
}

export type ScoreSource = 'chain_prior' | 'neutral_prior' | 'user_feedback'
export type ScoreStage = 'chainBaseline' | 'neutralBaseline' | 'reference' | 'provisional' | 'established'

export type Evaluation = {
  axes: AxisScores
  baseScore: number
  tonightScore?: number
  confidence: number
  sampleCount: number
  source: ScoreSource
  stage: ScoreStage
  chainMatch?: ChainMatch
  userInfluence: number
  priorVirtualVotes: number
  googleInitialTarget?: number
  googleAdjustment: number
  googleAdjustmentWeight: number
  evidence: string[]
}

export type RankedRestaurant = PlaceCandidate & {
  evaluation: Evaluation
}

export type HotelCandidate = {
  placeId: string
  name: string
  location: LatLng
}

export type AddressCandidate = {
  placeId?: string
  label: string
  formattedAddress: string
  location: LatLng
}
