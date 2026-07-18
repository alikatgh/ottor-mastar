# Ottor Mastar — Facebook strategy

A practical plan for growing a community around the herbarium. Ottor Mastar is a
free, offline, no-ads illustrated guide to the wild plants of **Yakutia (Sakha)**
and **Mongolia**, in five languages. That identity — cultural, beautiful,
non-commercial — is the whole marketing advantage. Lean into it.

## Positioning & voice

- **What we are:** a living herbarium of the Sakha land (and now Mongolia) —
  botanical plates, field photos, and the plant's names in Sakha, Russian,
  English, Mongolian, Latin, plus notes on folk tradition.
- **Voice:** warm, unhurried, reverent of the land and language. Not salesy. A
  quiet museum, not a startup. Post in the reader's language (see Localization).
- **Two honesty rules that protect the brand** (carry them from the app):
  1. The plates are **illustrations in a 19th-century botanical style**, not
     scans of historical works — never imply they're archival originals.
  2. Folk-medicine notes are **cultural/historical only, not medical advice.**
     Every such post carries a one-line disclaimer. Never encourage readers to
     gather, identify, or consume a plant from a post.

## Mongolia targeting campaign ⭐ (the current growth push)

The near-term goal is **users in Mongolia**, so the Mongolia plants run as their
own campaign — not an afterthought bolted onto the Sakha page. The plan:

- **Mongolian first, English below.** Every Mongolia post leads with a Mongolian
  caption (the story), then a short English block under an `— English —` rule for
  reach and for the diaspora. Never machine-dump five languages into one caption.
- **Geo-target Ulaanbaatar.** When boosting, target **Ulaanbaatar + interest:
  gardening/botany/nature**, not the whole country — the audience is city people
  who walk past these flowers, not remote herders.
- **The Central Park hook.** ~7 of the Mongolia species are ornamentals actually
  planted in **Ulaanbaatar's Central Park / city flowerbeds** (marigold, pansy,
  ornamental kale, dusty miller, rugosa rose, dahlia, blue spruce, cosmos…).
  Their posts open with *"walking through Central Park you often pass this
  flower"* — instant local recognition, the thing that makes a passer-by stop,
  read, and share. Wild steppe plants (cornflower, yarrow, alfalfa, bedstraw…)
  **never** get that line — the caption must never claim a steppe plant grows in
  the park. This is enforced in the generator (`isParkPlant` keys off the plant's
  own habitat text), so the honesty rule can't drift.
- **Stories, not labels.** The Mongolian lead is a small, interesting fact — where
  you'd meet it, what it looks like, a folk note — not a dry species card. People
  share stories about the flower they walked past this morning; they scroll past
  taxonomy.
- **How it's generated:** `node scripts/gen-social-posts.cjs 2026-07-27 12 --country
  mongolia` → `docs/social/calendar-mongolia.{json,md}`, ready for the Meta poster.
  The Yakutia/Russian calendar is the same script without `--country` (or
  `--country yakutia`).

## Content pillars (rotate these)

1. **Plant of the week** ⭐ (the anchor, ~1×/week)
   One species: the botanical plate + the best field photo, its names in all
   languages, one line of habitat, one line of folk/cultural note. This is the
   most shareable unit — it shows off the app's actual content and travels well
   in plant/heritage groups.
2. **Language & heritage** (~1×/week)
   The Sakha name and its meaning; a saying; a seasonal note (e.g. *sardaana*
   lily blooming = midsummer in Yakutia). Ties plants to culture and language
   revitalization — a strong emotional hook for the Sakha diaspora.
3. **Behind the herbarium** (~2×/month)
   Field photography, "we added 6 new species this week," how the offline app is
   built. **Mirror the in-app News section** — every News post is a Facebook post.
4. **Seasonal / useful** (~2×/month)
   What's flowering now; how to use the app with no signal on the tundra; the
   trilingual naming as a bridge between communities.
5. **Community** (ongoing)
   Ask followers for a plant's local name; repost (with credit + permission)
   good user photos; answer ID questions — always with the "not for foraging"
   caveat.

## Cadence

- **3 posts / week** is realistic and sustainable for a small team. Better
  consistent-and-few than a burst then silence.
- Suggested rhythm: **Mon** Plant of the week · **Wed** Heritage/language ·
  **Fri** Seasonal / behind-the-scenes / community.
- Batch a month of Plant-of-the-week posts in one sitting (the app already has
  all the assets) and schedule them via Meta Business Suite.

## Localization

- **Two audiences, two lead languages** — run them as two content streams:
  - **Mongolia stream** → **Mongolian first**, English below (see the Mongolia
    targeting campaign above). Geo-boost Ulaanbaatar.
  - **Yakutia stream** → **Russian + Sakha first**, English below. Geo-boost the
    Sakha Republic.
- Practical: two calendars from one generator (`--country mongolia` /
  `--country yakutia`). Start on a single Page with the two streams tagged by
  language; split into a dedicated Mongolian Page only once Mongolia traffic
  justifies it. Don't machine-dump five languages into one caption — it reads as
  spam.

## Audience & where to find them

- **Facebook Groups are the growth engine** for a niche like this — post the
  Plant-of-the-week into: Sakha/Yakutia community groups, Mongolian nature &
  steppe groups, plant-identification groups, botanical-art groups, foraging/
  herbalism groups (respecting their rules + the disclaimer).
- **Partners to tag / collaborate with:** North-Eastern Federal University
  (Yakutsk) botany dept, regional botanical gardens & museums, Sakha cultural
  organizations, indigenous-language initiatives. A single share from an
  institutional page outperforms weeks of organic posts.
- **Hashtags** (a few, not a wall): `#Саха #Якутия #Sakha #Yakutia #Mongolia
  #этноботаника #botanicalart #herbarium #wildflowers #ургамал`.

## Growth tactics

- **Every post links to the app** — App Store now, "Mac & Android soon" (and
  update when they ship). Put the link in the first comment, not the caption
  (Facebook throttles outbound-link posts; a comment link ranks better).
- **The plates are the ad.** They're genuinely beautiful — that's rare organic
  reach. Post the plate as the image, not a screenshot of the app UI.
- **Boost the best organic performer**, not a cold post: let a Plant-of-the-week
  run 48h, then put a small budget behind the one with the highest share rate,
  geo-targeted to Sakha Republic + Mongolia + interest:botany. $5–10 goes far.
- **Cross-post to Instagram** from the same Meta account — same visual content,
  a younger audience, near-zero extra effort.

## Metrics that matter (ignore vanity likes)

- **Shares** — the true signal for this content; a shared plate reaches a new
  network. Track which pillar/species gets shared most and make more of it.
- **App Store link clicks** (UTM-tag the links) — the real conversion.
- **Group-referral traffic** and **follower growth from institutional shares.**
- Review monthly; double down on the 2–3 post types that actually travel.

## First-30-days checklist

1. Create the Page — name, the leaf/lily icon as the profile image, a botanical
   plate as the cover, bio in Ru/Sah/En with the App Store link + website.
2. Link the Instagram account (Meta Business Suite) and the website.
3. Batch + schedule **8 Plant-of-the-week** posts (covers 2 months of the anchor
   slot). Assets are already in the app.
4. Write **3 heritage posts** (sardaana, a Sakha plant name's meaning, a season).
5. Join 8–10 relevant Groups; introduce the project once, respectfully, then
   contribute value (not just links).
6. Reach out to **2 institutional partners** for a share/collaboration.
7. After 2 weeks, boost the single best organic post ($10, geo+interest).

## Ready-to-adapt starter posts

**Plant of the week — Sardaana**
> 🌸 Сардаана · *Lilium pensylvanicum* · Siberian Lily
> The emblem flower of the Sakha land — a flame-orange lily that opens across
> the meadows at the height of summer. In Sakha tradition its bulb was dried and
> ground for flour. Now blooming in our herbarium — and, we found this year, on
> the Mongolian steppe too.
> _Illustration in vintage botanical style. Cultural note only — not medical or
> foraging advice._
> 👉 (link in first comment)

**Behind the herbarium — new species**
> This week the Mongolia collection grew to 30 plants — fireweed, thistle, wild
> onion, spurge, and the sardaana lily, each with new field photos. All offline,
> all free. What should we document next? Tell us the plant and its local name. 👇

**Heritage — a name's meaning**
> "Оттор мастар" means *herbs and trees* — the growing things of the land. Every
> plant in the guide carries its name in Sakha, Russian, English and Latin,
> because a name is the first thing we lose and the first thing worth keeping.

---

_Note: creating the Page and publishing posts are actions for the owner — this
doc is the plan and the drafts. Ask and I'll write a full month's post calendar
with per-species captions pulled straight from the app's data._
