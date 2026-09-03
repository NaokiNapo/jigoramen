export default function PrivacyPage() {
  return (
    <div className="legal-shell">
      <header className="legal-header">
        <a className="legal-back-link" href="/">← 事後ラーに戻る</a>
        <span className="brand-chip">JIGO RAMEN</span>
        <h1>プライバシーポリシー</h1>
        <p>事後ラーにおける利用者情報の取り扱いについてご案内します。</p>
      </header>

      <main className="legal-content panel">
        <section>
          <h2>1. はじめに</h2>
          <p>「事後ラー」（以下「本サービス」といいます。）は、利用者のプライバシーを尊重し、本サービスの提供に伴って取り扱う情報を、適用される法令や各サービス提供者の規約等を踏まえて適切に管理するよう努めます。</p>
        </section>

        <section>
          <h2>2. 取得する情報</h2>
          <p>本サービスでは、提供・運営に必要な範囲で、次の情報を取得または利用する場合があります。</p>
          <ul>
            <li><strong>アクセス情報</strong>：アクセス日時、閲覧ページ、参照元、IPアドレス、ブラウザ・端末に関する情報、操作やエラーに関する情報等</li>
            <li><strong>Cookie等</strong>：Cookie、クライアント識別子その他の類似技術により生成される情報</li>
            <li><strong>位置情報</strong>：利用者が端末やブラウザで許可した場合の現在地情報、または利用者が検索したホテル・住所等に対応する位置情報</li>
            <li><strong>フィードバック等</strong>：店舗に対する評価、選択した検索条件その他、利用者が本サービスに入力または送信する情報</li>
            <li><strong>サービス利用情報</strong>：本サービス内で発行される匿名の利用者識別子、利用履歴等</li>
          </ul>
        </section>

        <section>
          <h2>3. 利用目的</h2>
          <p>取得した情報は、次の目的に必要な範囲で利用します。</p>
          <ul>
            <li>本サービスの提供、維持および運営</li>
            <li>検索結果やおすすめ精度の改善</li>
            <li>利用状況の把握および分析</li>
            <li>不正利用、障害またはセキュリティ上の問題の防止・調査</li>
            <li>機能、表示、操作性その他のサービス改善</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </section>

        <section>
          <h2>4. Google Analytics 4の利用</h2>
          <p>本サービスでは、利用状況の把握と改善のため、Google LLCが提供するGoogle Analytics 4を使用しています。Google Analytics 4は、Cookie等を利用して、閲覧状況、端末・ブラウザ情報、おおよその地域等のアクセス情報を収集する場合があります。収集された情報は、Googleの定める方針に基づいて取り扱われます。</p>
          <p className="legal-note">詳しくは、<a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noreferrer">Googleプライバシーポリシー</a>および<a href="https://support.google.com/analytics/answer/6004245?hl=ja" target="_blank" rel="noreferrer">Googleによるデータ保護の説明</a>をご確認ください。</p>
        </section>

        <section>
          <h2>5. Google Maps Platform / Places APIの利用</h2>
          <p>本サービスでは、店舗情報、位置情報、地図情報および周辺店舗の検索結果を提供するため、Google Maps PlatformおよびPlaces APIを利用しています。これらの機能の利用に伴い、検索語句、IPアドレス、位置情報等がGoogleに送信される場合があります。</p>
          <p className="legal-note">Google Mapsの機能およびコンテンツの利用には、<a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noreferrer">Google Maps / Google Earth追加利用規約</a>と<a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noreferrer">Googleプライバシーポリシー</a>が適用されます。</p>
        </section>

        <section>
          <h2>6. 位置情報</h2>
          <p>現在地は、利用者が端末またはブラウザ上で明示的に許可した場合にのみ取得します。取得した現在地は、周辺のラーメン店を検索し、距離や地図を表示するために利用し、これらと関係のない目的には利用しません。位置情報の利用は、端末またはブラウザの設定からいつでも拒否・変更できます。</p>
        </section>

        <section>
          <h2>7. ユーザーフィードバック</h2>
          <p>利用者から送信された店舗評価等のフィードバックは、事後ラー度の算出、検索結果やおすすめ精度の改善、サービス品質の向上のために利用する場合があります。フィードバックの送信時には、重複投稿の抑制等のため、匿名の利用者識別子を使用する場合があります。</p>
        </section>

        <section>
          <h2>8. 第三者サービス</h2>
          <p>本サービスは、提供・運営のために、Google Analytics、Google Maps Platform、Supabase、Vercel等の第三者サービスを利用しています。これらの事業者が取り扱う情報については、各事業者の利用規約、プライバシーポリシーその他の定めが適用される場合があります。</p>
          <ul className="legal-service-links">
            <li><a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noreferrer">Google</a></li>
            <li><a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Supabase</a></li>
            <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel</a></li>
          </ul>
        </section>

        <section>
          <h2>9. 第三者提供</h2>
          <p>本サービスは、法令に基づく場合、生命・身体・財産の保護に必要な場合、またはサービスの提供に必要な業務委託先・第三者サービスへ取り扱いを委ねる場合等を除き、取得した個人情報を不必要に第三者へ提供しません。</p>
        </section>

        <section>
          <h2>10. 安全管理</h2>
          <p>本サービスは、取り扱う情報への不正アクセス、漏えい、滅失または毀損等を防ぐため、サービスの規模や性質に応じて合理的かつ必要な範囲の安全管理措置を講じるよう努めます。</p>
        </section>

        <section>
          <h2>11. 外部リンク</h2>
          <p>本サービスには外部サイトへのリンクが含まれる場合があります。リンク先で行われる情報の取り扱いについては、当該サイトのプライバシーポリシー等をご確認ください。</p>
        </section>

        <section>
          <h2>12. プライバシーポリシーの変更</h2>
          <p>本ポリシーは、法令、サービス内容または利用する外部サービスの変更等に応じて改定する場合があります。重要な変更がある場合は、本サービス上での掲示その他の適切な方法によりお知らせします。</p>
        </section>

        <section>
          <h2>13. お問い合わせ</h2>
          <p>本ポリシーや情報の取り扱いに関するお問い合わせは、<a href="/contact">お問い合わせページ</a>からご連絡ください。</p>
        </section>

        <p className="legal-effective-date">制定日：2026年9月3日</p>
      </main>

      <footer className="legal-footer"><a href="/">事後ラーに戻る</a></footer>
    </div>
  )
}
