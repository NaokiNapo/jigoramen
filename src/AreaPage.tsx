import { areaPages, type AreaPageConfig } from './data/areaDirectory'
import { trackEvent } from './utils/analytics'

type AreaPageProps = {
  area: AreaPageConfig
}

export default function AreaPage({ area }: AreaPageProps) {
  const otherAreas = areaPages.filter(
    (candidate) => candidate.prefectureSlug === area.prefectureSlug && candidate.slug !== area.slug,
  )

  return (
    <div className="area-shell">
      <header className="area-hero">
        <a className="area-back-link" href="/">← ホームに戻る</a>
        <span className="eyebrow">AREA GUIDE</span>
        <h1>{area.name}で<em>今営業中</em>のラーメン店を探す</h1>
        <p>{area.lead}</p>
        <a className="button button--primary area-cta" href={`/?area=${encodeURIComponent(area.slug)}`} onClick={() => trackEvent('area_cta_click', {
          area_name: area.name, area_slug: area.slug, prefecture_name: area.prefectureName, region_name: area.regionName,
        })}>
          {area.name}でおすすめを検索
        </a>
      </header>

      <main className="area-content">
        <section className="panel area-feature">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>{area.name}で深夜ラーメンを探す</h2>
              <p>{area.name}周辺の特徴</p>
            </div>
          </div>
          <p>{area.feature}</p>
          <p className="area-note">
            営業時間や営業状況は変わる場合があります。来店前に店舗の最新情報をご確認ください。
          </p>
        </section>

        <section className="panel area-other">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>ほかのエリアから探す</h2>
              <p>{area.prefectureName}の対応エリアから選べます。</p>
            </div>
          </div>
          <nav className="area-link-grid" aria-label="ほかのエリア">
            {otherAreas.map((candidate) => (
              <a key={candidate.slug} href={`/area/${candidate.slug}`}>
                <span>{candidate.name}</span>
                <small>今営業中のラーメン店を探す →</small>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer className="area-footer">
        <a href={`/area/${area.prefectureSlug}`}>{area.prefectureName}のエリア一覧へ</a>
        <a href="/">事後ラーの検索画面へ</a>
      </footer>
    </div>
  )
}
