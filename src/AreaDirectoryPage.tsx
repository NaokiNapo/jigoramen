import { useState } from 'react'
import { areaDirectory } from './data/areaDirectory'

export default function AreaDirectoryPage() {
  const [selectedRegionIndex, setSelectedRegionIndex] = useState<number | null>(null)
  const [selectedPrefectureSlug, setSelectedPrefectureSlug] = useState<string | null>(null)
  const selectedRegion = selectedRegionIndex === null ? undefined : areaDirectory[selectedRegionIndex]
  const selectedPrefecture = selectedRegion?.prefectures.find(
    (prefecture) => prefecture.slug === selectedPrefectureSlug,
  )

  function selectRegion(index: number) {
    setSelectedRegionIndex(index)
    setSelectedPrefectureSlug(null)
  }

  return (
    <div className="area-shell directory-shell">
      <header className="area-hero directory-hero">
        <a className="area-back-link" href="/">← 事後ラーに戻る</a>
        <span className="eyebrow">AREA</span>
        <h1>エリアから<em>探す</em></h1>
        <p>全国の主要エリアから、今営業中のラーメン店を探せます。地方、都道府県、エリアの順に選んでください。</p>
        <ol className="directory-flow" aria-label="エリア選択の流れ">
          <li><span>STEP 1</span>地方を選ぶ</li>
          <li><span>STEP 2</span>都道府県を選ぶ</li>
          <li><span>STEP 3</span>エリアを選ぶ</li>
        </ol>
      </header>

      <main className="area-content directory-content">
        <section className="panel directory-step">
          <div className="section-heading">
            <span>01</span>
            <div><h2>地方を選ぶ</h2><p>探したい地方へ移動します。</p></div>
          </div>
          <nav className="directory-region-nav" aria-label="地方を選ぶ">
            {areaDirectory.map((region, index) => (
              <button
                className={selectedRegionIndex === index ? 'active' : ''}
                key={region.region}
                onClick={() => selectRegion(index)}
                type="button"
              >
                {region.region}
              </button>
            ))}
          </nav>
        </section>

        {selectedRegion && (
          <section className="panel directory-region">
            <div className="section-heading">
              <span>02</span>
              <div><h2>{selectedRegion.region}</h2><p>都道府県を選ぶ</p></div>
            </div>
            <div className="prefecture-card-grid">
              {selectedRegion.prefectures.map((prefecture) => (
                <button
                  className={selectedPrefectureSlug === prefecture.slug ? 'active' : ''}
                  key={prefecture.slug}
                  onClick={() => setSelectedPrefectureSlug(prefecture.slug)}
                  type="button"
                >
                  <strong>{prefecture.name}</strong>
                  <span>{prefecture.areas.map((area) => area.name).join('・')}</span>
                  <small>エリアを選ぶ →</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedPrefecture && (
          <section className="panel area-other directory-areas">
            <div className="section-heading">
              <span>03</span>
              <div><h2>{selectedPrefecture.name}</h2><p>エリアを選ぶ</p></div>
            </div>
            <nav className="area-link-grid" aria-label={`${selectedPrefecture.name}のエリア`}>
              {selectedPrefecture.areas.map((area) => (
                <a key={area.slug} href={`/area/${area.slug}`}>
                  <span>{area.name}</span>
                  <small>今営業中のラーメン店を探す →</small>
                </a>
              ))}
            </nav>
            <a className="prefecture-detail-link" href={`/area/${selectedPrefecture.slug}`}>
              {selectedPrefecture.name}のエリアページを見る →
            </a>
          </section>
        )}
      </main>

      <footer className="area-footer"><a href="/">事後ラーの検索画面へ</a></footer>
    </div>
  )
}
