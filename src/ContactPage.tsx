const inquiryTypes = [
  'サービスに関するお問い合わせ',
  '不具合・表示内容に関する報告',
  '店舗情報の修正・削除依頼',
  '広告・PR掲載に関するお問い合わせ',
  'その他',
]

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim()
const mailtoHref = contactEmail
  ? `mailto:${contactEmail}?subject=${encodeURIComponent('事後ラーへのお問い合わせ')}`
  : undefined

export default function ContactPage() {
  return (
    <div className="legal-shell">
      <header className="legal-header">
        <a className="legal-back-link" href="/">← 事後ラーに戻る</a>
        <span className="brand-chip">事後ラー</span>
        <h1>お問い合わせ</h1>
        <p>事後ラーへのご連絡はこちらからお寄せください。</p>
      </header>

      <main className="legal-content panel">
        <section>
          <h2>お問い合わせについて</h2>
          <p>
            事後ラーに関するご意見・ご質問、不具合報告、店舗情報の修正依頼、
            広告・PR掲載等についてのお問い合わせを受け付けています。
          </p>
          <ul className="contact-types">
            {inquiryTypes.map((type) => <li key={type}>{type}</li>)}
          </ul>
        </section>

        <section>
          <h2>メールでのお問い合わせ</h2>
          {mailtoHref ? (
            <>
              <p>以下のリンクからメールを起動してお問い合わせください。</p>
              <a className="button button--primary contact-mail-link" href={mailtoHref}>
                メールで問い合わせる
              </a>
              <p className="legal-note">件名には「事後ラーへのお問い合わせ」が自動で入力されます。</p>
            </>
          ) : (
            <p className="contact-unavailable" role="status">
              問い合わせ先メールアドレスを準備中です。
            </p>
          )}
          <p className="legal-note">
            現在、本ページには送信フォームを設置していません。お問い合わせはメールで受け付けています。
          </p>
        </section>

        <section>
          <h2>お問い合わせ前にご確認ください</h2>
          <ul>
            <li>お問い合わせの内容によっては、返信できない場合があります。</li>
            <li>店舗の予約、営業時間、商品等については、各店舗へ直接お問い合わせください。</li>
            <li>営業、勧誘等に関するご連絡への返信は保証していません。</li>
          </ul>
          <p>
            お問い合わせに伴う個人情報の取扱いについては、
            <a href="/privacy">プライバシーポリシー</a>
            をご確認ください。
          </p>
        </section>
      </main>

      <footer className="legal-footer">
        <a href="/">事後ラーに戻る</a>
      </footer>
    </div>
  )
}
