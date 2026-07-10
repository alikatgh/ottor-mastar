# Ottor Mastar — Desktop (Windows / macOS / Linux)

Two desktop ports exist:

## 1. Windows (and any OS) — Electron shell (this folder)

A thin shell around the finished web app: `sync-app.cjs` copies the static
`../dist` build into `app/`, `main.cjs` serves it on a loopback port (SPA
routing keeps working) and opens a window. **Fully offline** — every plant,
image and language ships inside the installer. External links (Wikipedia)
open in the system browser.

```bash
cd desktop
npm install
npm start                 # run locally (any OS)
npm run smoke             # CI check: boots, loads, exits 0

npm run dist:win          # → release/Ottor Mastar Setup <v>.exe  (NSIS, one-click)
                          # → release/Ottor Mastar-<v>-win.zip    (portable)
npm run dist:mac          # → release/*.dmg  (unsigned; prefer the Catalyst app below)
```

- Windows builds cross-compile fine from macOS. Default arch follows the host —
  pass `--x64` for Intel/AMD PCs (most of them): `npx electron-builder --win nsis zip --x64`.
- Artifacts land in `desktop/release/` (gitignored).
- The `.exe` is unsigned: Windows SmartScreen will show "unrecognized app" —
  users click *More info → Run anyway*. Code-signing certificate removes that.

## 2. macOS — native Mac Catalyst app (preferred on Mac)

The SwiftUI iOS app runs as a native Mac app (22 MB vs Electron's ~150 MB):

```bash
cd ios && xcodegen
xcodebuild -project OttorMastar.xcodeproj -scheme OttorMastar \
  -destination 'generic/platform=macOS,variant=Mac Catalyst' build
```

Or in Xcode: select the **My Mac (Mac Catalyst)** destination and Run.
For distribution outside your own Macs it needs Developer-ID signing +
notarization (same Apple account as the iOS submission).
