import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { assertUniqueSlugs } from './data/countries'

// Dev-only: fail loudly if two countries share a plant slug (would shadow one
// via the global /plant/<slug> route). Kept in app startup — not at data-module
// load — so countries.ts stays free of import.meta/process and transpiles to
// CommonJS for the export/sitemap scripts (WEB-L18).
if (import.meta.env.DEV) {
  assertUniqueSlugs()
}

// Guard the mount point (WEB-L01): if #root is missing the DOM is malformed,
// so fail loudly with a clear message instead of silently rendering nothing.
const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found — cannot mount the app.')
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
