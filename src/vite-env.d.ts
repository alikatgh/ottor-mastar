/// <reference types="vite/client" />

// Vite's client types declare the side-effect module shapes the app relies on
// (`*.css`, `*.svg`, `?url`, `import.meta.env`, …) so `tsc -b` can resolve
// `import './index.css'` in main.tsx. Without this, tsc errors TS2882.
