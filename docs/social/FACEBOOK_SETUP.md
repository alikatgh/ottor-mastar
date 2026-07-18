# Facebook launch — do-this-now checklist

Everything on the code side is ready: 30 Mongolia posts scheduled weekly from
**Monday 2026-07-20**, and the GitHub Action posts automatically every Monday
09:00 UTC (17:00 Ulaanbaatar) once the two secrets exist. What remains needs
your Facebook account — these are the exact steps.

## 1. Create the Page (~10 min)

1. facebook.com → Menu → **Pages → Create new Page**.
2. **Name:** `Ottor Mastar — Оттор Мастар` (searchable in both scripts).
3. **Category:** Education Website (or "Science, Technology & Engineering").
4. **Bio** (150 chars max — Mongolian first, this is the Mongolia campaign):
   > Ургамлын амьд гербарий — Үндэсний цэцэрлэгт хүрээлэнгээс эхэлсэн. Living
   > herbarium of Mongolia & Yakutia. Free app ⬇️
5. **Profile picture:** the app icon — `public/icon-512.png` (or the
   lily icon used for the stores).
6. **Cover:** a botanical plate, e.g.
   `public/mongolia/full/mongolia-01-ill.webp` (marigold) — download, upload.
7. Page → About → **Website:** `https://ottormastar.aulenor.com` · add the App
   Store link `https://apps.apple.com/app/id6789648576`.

## 2. Get the Page ID + long-lived token (~10 min)

1. Go to **developers.facebook.com** → My Apps → **Create App** → type
   "Business" (name: e.g. `ottor-mastar-poster`; this app stays in Dev mode —
   that's fine, you're only posting to your own Page).
2. Open **Graph API Explorer** (developers.facebook.com/tools/explorer):
   - App: the app you just made.
   - **User or Page → Get Page Access Token** → select your Page; approve the
     `pages_manage_posts`, `pages_read_engagement` permissions when prompted.
3. Exchange it for a long-lived token (~60 days): in the Explorer, GET
   `oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_TOKEN>`
   (App ID/Secret: app dashboard → Settings → Basic). Then in the Explorer
   with that long-lived USER token, GET `me/accounts` — the response lists
   your Page with its **`id`** (= FB_PAGE_ID) and an **`access_token`**
   (= FB_PAGE_TOKEN — a Page token obtained from a long-lived user token
   does not expire).

## 3. Add the GitHub secrets (~2 min)

github.com/alikatgh/ottor-mastar → Settings → Secrets and variables →
Actions → New repository secret:

- `FB_PAGE_ID` — the numeric Page id
- `FB_PAGE_TOKEN` — the Page access token

## 4. Test, then it's fully automatic

1. GitHub → **Actions → "Plant of the Week → Facebook" → Run workflow**, set
   `week` = `1` → the marigold post (with the National Garden Park hook)
   publishes immediately, link lands in the first comment.
2. If it looks good on the Page — done. Every Monday 09:00 UTC the cron posts
   the next week automatically. 30 weeks are queued (through 2027-02).

## Ongoing (manual, ~15 min/week — see FACEBOOK_STRATEGY.md)

- Reply to comments; end replies with "What place should we walk next?" and
  screenshot any "do my region" comments into `docs/funding/`.
- Around week 2: post the **origin story** + **roadmap** posts (drafts in the
  strategy doc) — the two anchors of the funding narrative.
- After 2 weeks: boost the best organic performer, $10, geo = Ulaanbaatar +
  interest gardening/nature.

## Token expiry note

If posting ever fails with an OAuth error (~60-day user-token path), re-run
step 2.3 and update the `FB_PAGE_TOKEN` secret. The workflow fails loudly in
the Actions tab, so you'll see it.
