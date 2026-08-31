import type { ChainMatch, ChainPrior } from '../types'

// Ver.6 initial master. The scores are product priors, not Google ratings.
// Axis weights for the final base score are defined in scoring.ts: 35 / 25 / 25 / 15.
export const CHAIN_PRIORS: ChainPrior[] = [
  { key: 'hidakaya', name: '日高屋', aliases: ['熱烈中華食堂日高屋', '中華食堂日高屋', '日高屋'], axes: { pair: 89, conversation: 84, comfort: 85, ease: 94 }, confidence: 'A' },
  { key: 'sugakiya', name: 'Sugakiya', aliases: ['Sugakiya', 'スガキヤ'], axes: { pair: 90, conversation: 78, comfort: 82, ease: 93 }, confidence: 'A' },
  { key: 'ikkakuya', name: '壱角家', aliases: ['横浜家系ラーメン壱角家', '壱角家'], axes: { pair: 79, conversation: 76, comfort: 78, ease: 91 }, confidence: 'B' },
  { key: 'kagetsu', name: 'らあめん花月嵐', aliases: ['らあめん花月嵐', 'ラーメン花月嵐', '花月嵐'], axes: { pair: 85, conversation: 82, comfort: 83, ease: 90 }, confidence: 'B' },
  { key: 'kamukura', name: 'どうとんぼり神座', aliases: ['どうとんぼり神座', '道頓堀神座', 'KAMUKURA', '神座'], axes: { pair: 90, conversation: 83, comfort: 87, ease: 94 }, confidence: 'C' },
  { key: 'machida', name: '町田商店', aliases: ['横浜家系ラーメン町田商店', '町田商店'], axes: { pair: 81, conversation: 74, comfort: 77, ease: 92 }, confidence: 'B' },
  { key: 'tokyo-aburagumi', name: '東京油組総本店', aliases: ['東京油組総本店', '東京油組'], axes: { pair: 77, conversation: 74, comfort: 76, ease: 91 }, confidence: 'B' },
  { key: 'sharin', name: '舎鈴', aliases: ['舎鈴'], axes: { pair: 84, conversation: 82, comfort: 84, ease: 90 }, confidence: 'B' },
  { key: 'bannai', name: '喜多方ラーメン坂内', aliases: ['喜多方ラーメン坂内', '喜多方らーめん坂内', '坂内'], axes: { pair: 88, conversation: 86, comfort: 87, ease: 90 }, confidence: 'B' },
  { key: 'ippudo', name: '一風堂', aliases: ['博多一風堂', 'IPPUDO', '一風堂'], axes: { pair: 88, conversation: 86, comfort: 89, ease: 91 }, confidence: 'B' },
  { key: 'kairikiya', name: '魁力屋', aliases: ['京都北白川ラーメン魁力屋', 'ラーメン魁力屋', '魁力屋'], axes: { pair: 93, conversation: 88, comfort: 90, ease: 92 }, confidence: 'A' },
  { key: 'tenkaippin', name: '天下一品', aliases: ['天下一品'], axes: { pair: 84, conversation: 79, comfort: 81, ease: 90 }, confidence: 'C' },
  { key: 'marugen', name: '丸源ラーメン', aliases: ['丸源ラーメン', '丸源'], axes: { pair: 95, conversation: 90, comfort: 93, ease: 92 }, confidence: 'A' },
  { key: 'rairaitei', name: '来来亭', aliases: ['来来亭'], axes: { pair: 91, conversation: 86, comfort: 89, ease: 92 }, confidence: 'A' },
  { key: 'makotoya', name: 'まこと屋', aliases: ['牛じゃんラーメンまこと屋', 'ラーメンまこと屋', 'まこと屋'], axes: { pair: 91, conversation: 87, comfort: 89, ease: 93 }, confidence: 'B' },
  { key: 'zundoya', name: 'ずんどう屋', aliases: ['ラー麺ずんどう屋', 'ラーメンずんどう屋', 'ずんどう屋'], axes: { pair: 86, conversation: 82, comfort: 84, ease: 93 }, confidence: 'B' },
  { key: 'ichiran', name: '一蘭', aliases: ['ICHIRAN', '一蘭'], axes: { pair: 70, conversation: 68, comfort: 82, ease: 95 }, confidence: 'A' },
  { key: 'tadokoro', name: '麺場 田所商店', aliases: ['麺場田所商店', '田所商店'], axes: { pair: 94, conversation: 90, comfort: 93, ease: 89 }, confidence: 'A' },
  { key: 'korakuen', name: '幸楽苑', aliases: ['幸楽苑'], axes: { pair: 92, conversation: 88, comfort: 90, ease: 91 }, confidence: 'A' },
  { key: 'fujiichiban', name: '藤一番', aliases: ['藤一番'], axes: { pair: 90, conversation: 84, comfort: 86, ease: 95 }, confidence: 'B' },
  { key: 'kajiken', name: '歌志軒', aliases: ['油そば専門店歌志軒', '歌志軒'], axes: { pair: 84, conversation: 80, comfort: 82, ease: 90 }, confidence: 'B' },
  { key: 'ramenfuku', name: 'ラーメン福', aliases: ['ラーメン福'], axes: { pair: 73, conversation: 72, comfort: 76, ease: 83 }, confidence: 'A' },
  { key: 'kotan', name: 'らーめん古潭', aliases: ['らーめん古潭', 'ラーメン古潭', '古潭'], axes: { pair: 91, conversation: 88, comfort: 90, ease: 88 }, confidence: 'B' },
  { key: 'aburado', name: '元祖油堂', aliases: ['元祖油堂'], axes: { pair: 82, conversation: 80, comfort: 88, ease: 93 }, confidence: 'C' },
  { key: 'butayama', name: '豚山', aliases: ['ラーメン豚山', '豚山'], axes: { pair: 77, conversation: 72, comfort: 75, ease: 88 }, confidence: 'B' },
  { key: 'tsujita', name: 'つじ田', aliases: ['めん徳二代目つじ田', 'つじ田'], axes: { pair: 82, conversation: 78, comfort: 83, ease: 86 }, confidence: 'B' },
  { key: 'afuri', name: 'AFURI', aliases: ['AFURI'], axes: { pair: 80, conversation: 77, comfort: 88, ease: 92 }, confidence: 'B' },
  { key: 'hakata-furyu', name: '博多風龍', aliases: ['博多風龍', '風龍'], axes: { pair: 80, conversation: 76, comfort: 78, ease: 93 }, confidence: 'B' },
  { key: 'ikkokudo', name: '一刻魁堂', aliases: ['一刻魁堂'], axes: { pair: 93, conversation: 88, comfort: 91, ease: 91 }, confidence: 'A' },
  { key: 'kinryu', name: '金龍ラーメン', aliases: ['金龍ラーメン'], axes: { pair: 82, conversation: 75, comfort: 72, ease: 93 }, confidence: 'A' },
]

function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u3000・･·\-‐‑–—―_＿\/／()（）\[\]【】「」『』,.，。:：'’"“”]/g, '')
}

const ALIAS_INDEX = CHAIN_PRIORS.flatMap((prior) => prior.aliases.map((alias) => ({ prior, alias, normalized: normalize(alias) })))
  .sort((a, b) => b.normalized.length - a.normalized.length)

export function matchChainPrior(placeName: string): ChainMatch | undefined {
  const normalizedName = normalize(placeName)
  if (!normalizedName) return undefined
  const hit = ALIAS_INDEX.find((entry) => entry.normalized.length >= 2 && normalizedName.includes(entry.normalized))
  return hit ? { prior: hit.prior, matchedAlias: hit.alias } : undefined
}

export function chainPriorBase(prior: ChainPrior): number {
  return prior.axes.pair * 0.35 + prior.axes.conversation * 0.25 + prior.axes.comfort * 0.25 + prior.axes.ease * 0.15
}
