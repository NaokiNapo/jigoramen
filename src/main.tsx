import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AboutPage from './AboutPage'
import AreaPage from './AreaPage'
import ContactPage from './ContactPage'
import { areaPagesByPath, type AreaPageConfig } from './data/areaPages'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'
import './styles.css'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const areaPage = areaPagesByPath[pathname]

const page = areaPage
  ? <AreaPage area={areaPage} />
  : pathname === '/privacy'
  ? <PrivacyPage />
  : pathname === '/terms'
    ? <TermsPage />
    : pathname === '/contact'
      ? <ContactPage />
      : pathname === '/about'
        ? <AboutPage />
        : <App />

if (pathname === '/privacy') document.title = 'プライバシーポリシー | 事後ラー'
if (pathname === '/terms') document.title = '利用規約 | 事後ラー'
if (pathname === '/contact') document.title = 'お問い合わせ | 事後ラー'
if (pathname === '/about') document.title = '運営者情報 | 事後ラー'

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

function applyAreaMetadata(area: AreaPageConfig) {
  document.title = area.title
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', area.canonical)
  setMetaContent('meta[name="description"]', area.description)
  setMetaContent('meta[property="og:title"]', area.title)
  setMetaContent('meta[property="og:description"]', area.description)
  setMetaContent('meta[property="og:url"]', area.canonical)
  setMetaContent('meta[name="twitter:title"]', area.title)
  setMetaContent('meta[name="twitter:description"]', area.description)
}

if (areaPage) applyAreaMetadata(areaPage)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
