# Places, not countries — product roadmap idea

_Parked 2026-07-18. Revisit when location #3 is added or funding lands._

## The idea

The app currently organizes plants by **country** (Yakutia, Mongolia). But the
truth of the collection — and the funding story — is that it's built from
**places**: documented transects walked by one person.

- **Place 1:** a remote village road, Yakutia
- **Place 2:** National Garden Park (Үндэсний цэцэрлэгт хүрээлэн), Ulaanbaatar

Reframe collections as named places instead of flat country lists:

- Each place gets a name, a short story ("photographed on morning runs,
  summer 2026"), a species count, and optionally a dot on a map.
- The scaling story becomes visible **inside the product**: every funded
  expansion adds a new named place, not just more rows in a country.
- Mirrors how the collection actually grows (a walk at a time) and matches the
  origin-story pitch in [FACEBOOK_STRATEGY.md](FACEBOOK_STRATEGY.md)
  (Funding & scaling narrative).

## What it would touch (rough)

- **Data model:** a `places` layer between country and plants — `place: {id,
  name (localized), country, story (localized), coords?}`; each plant gets a
  `placeId` (all current Mongolia plants → national-garden-park; all current
  Yakutia plants → the village road). Countries stay as a grouping/locale
  concept (settings, geo-default) — places are the collection unit.
- **Web:** home/browse shows place cards (name + story + count); optional
  simple map view later.
- **Native:** same place cards in iOS + Android; data flows through the
  existing export-native-data.cjs / plants.json pipeline, so it's one schema
  change fanned out.
- **Social:** the generator's park hook already encodes place provenance —
  a `place` field in the dataset would replace the habitat-regex heuristic
  with real data.

## Sequencing

Do NOT build this now. Trigger points, whichever comes first:

1. A third location gets photographed → places become necessary, build then.
2. A funding application needs a demo of the "expandable places" vision → a
   cheap version (place cards, no map) is enough to show.
