# Cross-Cutting Audit — 2026-07-07

**Scope:** Web ↔ iOS ↔ Android parity, CI/tooling, SEO/PWA, content, security

---

## Cross-platform parity matrix

| Behavior | Web | iOS | Android |
|----------|-----|-----|---------|
| mn/zh locale bundled | ✅ | ❌ **NAT-C01** | ✅ |
| Hero plant (`heroSlug`) | ❌ `plants[last]` | ❌ `plants.last` | ❌ `lastOrNull()` |
| Search: mn/zh names | ❌ | ❌ | ❌ |
| Search: diacritic-insensitive | ✅ | ✅ | ✅ |
| Catalog search depth | Names only | Names only | Names only |
| Search page depth | Names + desc + medicinal | Same | Same |
| Offline thumb/medium | ✅ static | ✅ bundled | ✅ assets |
| Viewer per-item country | ✅ | ✅ | ✅ |
| leadImage carousel reset | ✅ | ✅ | ✅ |
| Viewer zoom reset on page change | ✅ | ✅ | ✅ |
| Invalid plant slug | ✅ NotFound | ❌ | ✅ PlantNotFound |
| Invalid country in storage | ✅ clamped | ⚠️ silent fallback | ⚠️ normalize |
| About country-aware | ⚠️ partial | ❌ hardcoded | ⚠️ locale keys, "3" hardcoded |
| Footer country-aware | ✅ | ❌ Yakutia always | Similar |
| Legal mn/zh | ❌ | ❌ | ❌ |
| OS reduce-motion | ✅ CSS @media | ✅ observer | ✅ animator |
| Deep links `plant/{slug}` | ✅ React Router | ❌ | ❌ |
| Settings language scoped | ⚠️ Header yes, Settings no | ✅ country-filtered | ✅ |
| Wikipedia per-language | ✅ sah/mn/zh native name | ✅ | ✅ |
| Typecheck in build | ✅ `tsc -b` | — | — |
| Automated tests | ❌ | ❌ | ❌ |
| CI pipeline | ❌ | ❌ | ❌ |

---

## CI / tooling gaps

| Item | Status | Recommendation |
|------|--------|----------------|
| Unit/integration tests | ❌ 0 test files | Add vitest for `plantSearch`, `validateSettings`, slug guard |
| GitHub Actions | ❌ no `.github/` | Add workflow: lint + typecheck + check:locale + check:sitemap + build |
| `check-locale-keys.cjs` in npm | ❌ | Add `check:locale` script |
| `check-sitemap.cjs` in npm | ❌ | Add `check:sitemap`; run in `prebuild` |
| `data:export` automation | ❌ manual | Document in README; optional pre-commit hook |
| Native build in CI | ❌ | xcodebuild + gradlew assembleDebug |
| Image parity script | ❌ | Verify every `imageId` has thumb/medium WebP |
| Bundle size budget | ❌ | Gate on main chunk <500 KB or document exception |

### Current gates (all pass)

```text
npm run lint       → oxlint (1 warning in scripts/)
npm run typecheck  → tsc -b
npm run build      → tsc -b && vite build
check-locale-keys  → OK
check-sitemap      → OK
```

---

## SEO / PWA

| Item | Status | Location |
|------|--------|----------|
| `sitemap.xml` | ✅ 53 URLs | `public/sitemap.xml` |
| `robots.txt` | ✅ | `public/robots.txt` |
| SPA redirects | ✅ | `public/_redirects` |
| `manifest.webmanifest` | ✅ | `public/` |
| Per-route `<title>` + description | ✅ | `App.tsx:89-131` |
| Per-plant `og:title` + `og:description` | ✅ | `App.tsx:127-128` |
| Per-plant `og:image` | ❌ static Yakutia hero | `index.html:20`, `App.tsx` |
| Per-plant `og:url` | ❌ | `App.tsx` |
| `og:locale` for mn/zh | ❌ falls back sah_RU | `App.tsx:22-26` |
| Self-hosted fonts | ✅ | `public/fonts/` |

---

## Content quality (unchanged from prior audit)

| Item | Status | Reference |
|------|--------|-----------|
| Yakutia photo↔species | 19/23 match; 4 orphans | `photo-species-audit.md` §7 |
| Yakutia plate↔species | 23/23 correct | `illustration-species-audit.md` |
| Mongolia plate↔species | 2 correct (bedstraw, yarrow reused) | `illustration-species-audit.md` |
| Mongolia mn/zh translations | 24/24 plants | `mongolia-translations.ts` |
| Medicinal disclaimers | ✅ web + native | Footer, detail, legal |
| Privacy accuracy | ❌ understates localStorage | `LegalPage.tsx` |

---

## Security posture

| Area | Assessment |
|------|------------|
| Attack surface | Minimal — static SPA, no backend, no auth |
| XSS | None found in src/ |
| External links | `noopener noreferrer` on Wikipedia |
| localStorage | Validated schema on read/write |
| Dependencies | Modern stack; no known critical CVEs checked this audit |
| Privacy compliance | Copy needs update for `om_settings_v1` + i18next key |

---

## Docs inventory

| File | Role |
|------|------|
| `README.md` | Setup, pipeline, native build instructions |
| `docs/BUG_JOURNAL.md` | Fix log + scan patterns |
| `docs/audits/2026-07-06-*.md` | Prior audit package (13 files) |
| `docs/audits/2026-07-07-*.md` | This audit package (5 files) |
| `_src_originals/illustrations/README.md` | Illustration source notes |

---

## Refactoring roadmap (suggested phases)

### Phase 1 — Ship blockers (P0–P1)

1. Add mn/zh locales to `ios/project.yml` + xcodegen
2. Wire `getHeroPlant()` on web + iOS + Android home
3. Add mn/zh to all search implementations
4. Fix Legal page for mn/zh (web; native follows)
5. Filter Settings language picker by country (web)

### Phase 2 — Parity + quality (P2)

6. iOS plant-not-found view
7. iOS About + footer country-aware copy
8. Wire CI checks into npm + GitHub Actions
9. Export `heroSlug` in native JSON
10. Update privacy policy text

### Phase 3 — Polish (P3)

11. Per-plant og:image/url in DocumentMeta
12. Re-source 4 orphan Yakutia photos
13. Remove 13 dead locale keys
14. Dynamic-import country datasets
15. Add vitest for search + settings validation