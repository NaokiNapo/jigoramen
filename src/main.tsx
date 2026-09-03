import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AboutPage from './AboutPage'
import ContactPage from './ContactPage'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'
import './styles.css'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

const page = pathname === '/privacy'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
