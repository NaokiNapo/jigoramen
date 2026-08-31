import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { FeedbackStatsRecord } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const hasSupabaseConfig = Boolean(url && key && !url?.includes('YOUR_') && !key?.includes('YOUR_'))
export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null

export async function fetchFeedbackStats(placeIds: string[]): Promise<Map<string, FeedbackStatsRecord>> {
  if (!supabase || placeIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('jigo_feedback_stats_v6')
    .select('google_place_id,avg_pair_rating,avg_conversation_rating,avg_comfort_rating,avg_ease_rating,sample_count,last_feedback_at')
    .in('google_place_id', placeIds)
  if (error) throw new Error(`事後ラーDBの読み込みに失敗しました: ${error.message}`)
  return new Map((data as FeedbackStatsRecord[]).map((row) => [row.google_place_id, row]))
}

export async function ensureAnonymousUser(): Promise<string> {
  if (!supabase) throw new Error('Supabaseが未設定です。')
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.user.id) return sessionData.session.user.id
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) throw new Error(`匿名ログインに失敗しました: ${error?.message ?? 'unknown error'}`)
  return data.user.id
}

export async function submitFeedback(input: {
  googlePlaceId: string
  pair: number
  conversation: number
  comfort: number
  ease: number
}): Promise<void> {
  if (!supabase) throw new Error('Supabaseが未設定です。')
  const userId = await ensureAnonymousUser()
  const { error } = await supabase.from('jigo_user_feedback_v6').insert({
    google_place_id: input.googlePlaceId,
    user_id: userId,
    pair_score: input.pair,
    conversation_score: input.conversation,
    comfort_score: input.comfort,
    ease_score: input.ease,
  })
  if (error) {
    if (error.code === '23505') throw new Error('この店舗への評価は本日すでに送信済みです。')
    throw new Error(`フィードバック送信に失敗しました: ${error.message}`)
  }
}
