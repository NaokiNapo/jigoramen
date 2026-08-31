const LOW = [184, 229, 255] as const
const MID = [255, 255, 255] as const
const HIGH = [255, 184, 204] as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function mix(from: readonly number[], to: readonly number[], t: number) {
  return from.map((value, index) => Math.round(value + (to[index] - value) * t))
}

/**
 * 事後ラー度 75以下→水色MAX、85→白、95以上→ピンクMAXとして連続補間する。
 * スコアは内部値のまま使うため、0.1点単位の差も色へ反映される。
 */
export function scoreBackground(score: number): string {
  const normalized = clamp(score, 75, 95)
  const rgb = normalized <= 85
    ? mix(LOW, MID, (normalized - 75) / 10)
    : mix(MID, HIGH, (normalized - 85) / 10)

  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}
