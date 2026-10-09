// Build-time only entry: rendered in Node by scripts/prerender-static-pages.mjs
// so that the home page and the legal/info pages ship their content as static HTML.
import { StrictMode, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import AboutPage from './AboutPage'
import ContactPage from './ContactPage'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'
import { staticPageMetadata, type StaticPagePath } from './data/staticPages'

const pageElements: Record<StaticPagePath, ReactElement> = {
  '/about': <AboutPage />,
  '/privacy': <PrivacyPage />,
  '/terms': <TermsPage />,
  '/contact': <ContactPage />,
}

function render(element: ReactElement) {
  return renderToString(<StrictMode>{element}</StrictMode>)
}

export function renderHome() {
  return render(<App />)
}

export function renderStaticPages() {
  return (Object.keys(pageElements) as StaticPagePath[]).map((path) => ({
    path,
    metadata: staticPageMetadata[path],
    html: render(pageElements[path]),
  }))
}
