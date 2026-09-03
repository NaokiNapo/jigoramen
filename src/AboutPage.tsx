const operatorName = '事後ラー運営'

const serviceDetails = [
  { label: 'サービス名', value: '事後ラー' },
  { label: '運営形態', value: '個人運営' },
  { label: '運営者', value: operatorName },
]

export default function AboutPage() {
  return (
    <div className="legal-shell">
      <header className="legal-header">
        <a className="legal-back-link" href="/">← 事後ラーに戻る</a>
        <span className="brand-chip">事後ラー</span>
        <h1>運営者情報</h1>
        <p>事後ラーのサービス概要と運営についてご案内します。</p>
      </header>

      <main className="legal-content panel">
        <section>
          <h2>基本情報</h2>
          <dl className="about-details">
            {serviceDetails.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>サイトURL</dt>
              <dd>
                <a href="https://www.jigoramen.com/">https://www.jigoramen.com/</a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>サービス概要</h2>
          <p>
            事後ラーは、飲み会や外出のあとなどに、現在地やエリア、ラーメンの種類、
            その時の気分などから、自分に合ったラーメン店を探せるWebサービスです。
          </p>
          <p>
            店舗ごとに表示する「事後ラー度」は、店舗情報や利用状況等をもとにした
            独自の評価ロジックによる参考情報です。店舗の品質や利用者の満足度を
            保証するものではありません。
          </p>
        </section>

        <section>
          <h2>利用している第三者サービス</h2>
          <p>サービスの提供、店舗情報の表示、利用状況の分析等のため、次の第三者サービスを利用しています。</p>
          <ul>
            <li>Google Maps Platform / Places</li>
            <li>Google Analytics</li>
            <li>Supabase</li>
            <li>Vercel</li>
          </ul>
          <p className="legal-note">
            各社の名称および商標は、それぞれの権利者に帰属します。
            事後ラーが各社と提携していることや、各社の公式サービスであることを示すものではありません。
          </p>
        </section>

        <section>
          <h2>広告・PR等について</h2>
          <p>
            事後ラーでは、現在または将来、広告、アフィリエイト、PR掲載等による
            収益化を行う場合があります。広告やPR等に該当する情報を掲載する場合は、
            ユーザーが識別できるよう適切に表示する方針です。
          </p>
        </section>

        <section>
          <h2>お問い合わせ・関連ページ</h2>
          <p>事後ラーに関するお問い合わせは、お問い合わせページからご連絡ください。</p>
          <ul className="legal-service-links">
            <li><a href="/contact">お問い合わせ</a></li>
            <li><a href="/terms">利用規約</a></li>
            <li><a href="/privacy">プライバシーポリシー</a></li>
          </ul>
        </section>
      </main>

      <footer className="legal-footer">
        <a href="/">事後ラーに戻る</a>
      </footer>
    </div>
  )
}
