import type { PageMetadata } from './areaDirectory'

const SITE_ORIGIN = 'https://www.jigoramen.com'

export type StaticPagePath = '/about' | '/privacy' | '/terms' | '/contact'

export const staticPageMetadata: Record<StaticPagePath, PageMetadata> = {
  '/about': {
    title: '運営者情報 | 事後ラー',
    description: '事後ラーのサービス概要、運営者、利用している第三者サービス、広告・PR掲載の方針についてご案内します。',
    canonical: `${SITE_ORIGIN}/about`,
  },
  '/privacy': {
    title: 'プライバシーポリシー | 事後ラー',
    description: '事後ラーにおけるアクセス情報・Cookie・位置情報・フィードバック等の取り扱い、Google Analytics・Google Maps Platformの利用についてご案内します。',
    canonical: `${SITE_ORIGIN}/privacy`,
  },
  '/terms': {
    title: '利用規約 | 事後ラー',
    description: '事後ラーをご利用いただく際の条件、禁止事項、店舗情報の正確性、事後ラー度の位置づけ、免責事項などを定めています。',
    canonical: `${SITE_ORIGIN}/terms`,
  },
  '/contact': {
    title: 'お問い合わせ | 事後ラー',
    description: '事後ラーへのご意見・ご質問、不具合報告、店舗情報の修正・削除依頼、広告・PR掲載に関するお問い合わせ窓口です。',
    canonical: `${SITE_ORIGIN}/contact`,
  },
}

export function isStaticPagePath(pathname: string): pathname is StaticPagePath {
  return Object.prototype.hasOwnProperty.call(staticPageMetadata, pathname)
}
