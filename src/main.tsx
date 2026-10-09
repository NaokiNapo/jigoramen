import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AboutPage from './AboutPage'
import AreaDirectoryPage from './AreaDirectoryPage'
import AreaPage from './AreaPage'
import ContactPage from './ContactPage'
import PrefecturePage from './PrefecturePage'
import {
  areaDirectoryMetadata,
  areaPagesByPath,
  prefecturePagesByPath,
  type PageMetadata,
} from './data/areaDirectory'
import { isStaticPagePath, staticPageMetadata } from './data/staticPages'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'
import './styles.css'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const areaPage = areaPagesByPath[pathname]
const prefecturePage = prefecturePagesByPath[pathname]

const page = areaPage
  ? <AreaPage area={areaPage} />
  : prefecturePage
    ? <PrefecturePage prefecture={prefecturePage} />
    : pathname === '/area'
      ? <AreaDirectoryPage />
  : pathname === '/privacy'
  ? <PrivacyPage />
  : pathname === '/terms'
    ? <TermsPage />
    : pathname === '/contact'
      ? <ContactPage />
      : pathname === '/about'
        ? <AboutPage />
        : <App />


function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

function applyPageMetadata(metadata: PageMetadata) {
  document.title = metadata.title
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', metadata.canonical)
  setMetaContent('meta[name="description"]', metadata.description)
  setMetaContent('meta[property="og:title"]', metadata.title)
  setMetaContent('meta[property="og:description"]', metadata.description)
  setMetaContent('meta[property="og:url"]', metadata.canonical)
  setMetaContent('meta[name="twitter:title"]', metadata.title)
  setMetaContent('meta[name="twitter:description"]', metadata.description)
}

if (areaPage) applyPageMetadata(areaPage)
if (prefecturePage) applyPageMetadata(prefecturePage)
if (pathname === '/area') applyPageMetadata(areaDirectoryMetadata)
if (isStaticPagePath(pathname)) applyPageMetadata(staticPageMetadata[pathname])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
