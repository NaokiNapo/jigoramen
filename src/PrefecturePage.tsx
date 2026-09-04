import type { PrefecturePageConfig } from './data/areaDirectory'

type PrefecturePageProps = { prefecture: PrefecturePageConfig }

export default function PrefecturePage({ prefecture }: PrefecturePageProps) {
  return (
    <div className="area-shell prefecture-shell">
      <header className="area-hero">
        <a className="area-back-link" href="/">← ホームに戻る</a>
        <span className="eyebrow">AREA / {prefecture.regionName}</span>
        <h1>{prefecture.shortName}で<em>深夜ラーメン</em>のエリアを探す</h1>
        <p>{prefecture.lead}</p>
      </header>

      <main className="area-content">
        <section className="panel area-other prefecture-areas">
          <div className="section-heading">
            <span>03</span>
            <div><h2>{prefecture.name}の対応エリア</h2><p>エリアを選んで検索へ進みます。</p></div>
          </div>
          <nav className="area-link-grid" aria-label={`${prefecture.name}のエリア`}>
            {prefecture.areas.map((area) => (
              <a key={area.slug} href={`/area/${area.slug}`}>
                <span>{area.name}</span><small>今営業中のラーメン店を探す →</small>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer className="area-footer"><a href="/area">全国のエリア一覧へ</a></footer>
    </div>
  )
}
