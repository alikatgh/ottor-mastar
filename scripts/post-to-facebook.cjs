#!/usr/bin/env node
/**
 * Publish the next "Plant of the week" to a Facebook Page via the Meta Graph
 * API: post the botanical plate as a photo with the caption, then drop the
 * app/App-Store link as the first comment (Facebook ranks link-in-comment
 * higher than link-in-caption — see docs/FACEBOOK_STRATEGY.md).
 *
 * Reads docs/social/calendar[-<country>].json (from gen-social-posts.cjs).
 * Which entry it posts:
 *   - default: the entry whose `date` == today (UTC), so a weekly cron just works.
 *   - `--calendar mongolia`: use calendar-mongolia.json (the active campaign;
 *     omit for the base calendar.json).
 *   - `--week N`: force a specific week (manual / testing).
 *   - `--dry-run`: print what it WOULD post, call nothing.
 *
 * Requires env (GitHub Actions secrets):
 *   FB_PAGE_ID     — the Page's numeric id
 *   FB_PAGE_TOKEN  — a long-lived Page access token with pages_manage_posts
 *
 * Nothing posts without both env vars — safe to run in CI before they're set.
 */
const fs = require('fs');
const path = require('path');

const GRAPH = 'https://graph.facebook.com/v21.0';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const weekArg = (() => {
  const i = args.indexOf('--week');
  return i >= 0 ? parseInt(args[i + 1], 10) : null;
})();
const calendarArg = (() => {
  const i = args.indexOf('--calendar');
  return i >= 0 ? `-${args[i + 1]}` : '';
})();

const calendar = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', `docs/social/calendar${calendarArg}.json`), 'utf8'),
);

const today = new Date().toISOString().slice(0, 10);

// Two guards keep the cron from ever double-posting the posts that were
// scheduled by hand in the Meta Planner (those fire via Facebook's own
// scheduler, independent of this cron):
//   1. FB_AUTOPILOT_FROM  - skip any calendar date before this day entirely.
//   2. MANUAL_DONE        - explicit dates already hand-scheduled that fall ON
//      or AFTER the autopilot day, so they'd otherwise collide. Weeks 1-2 and
//      Aug 3/5/10 were placed by hand; autopilot starts 2026-08-07 to fill the
//      Fri Aug 7 gap, so only the Aug 10 Monday needs excluding.
const MANUAL_DONE = new Set(['2026-08-10']);
const from = process.env.FB_AUTOPILOT_FROM;
if (!weekArg) {
  if (from && today < from) {
    console.log(`Before autopilot start ${from} (hand-scheduled window). Nothing to do.`);
    process.exit(0);
  }
  if (MANUAL_DONE.has(today)) {
    console.log(`${today} was hand-scheduled in the Planner. Skipping to avoid a double-post.`);
    process.exit(0);
  }
}
const entry = weekArg
  ? calendar.find((e) => e.week === weekArg)
  : calendar.find((e) => e.date === today);

if (!entry) {
  console.log(`No post scheduled for ${weekArg ? `week ${weekArg}` : today}. Nothing to do.`);
  process.exit(0);
}

const { FB_PAGE_ID, FB_PAGE_TOKEN } = process.env;

if (dryRun || !FB_PAGE_ID || !FB_PAGE_TOKEN) {
  console.log(dryRun ? '[dry-run]' : '[no FB_PAGE_ID/FB_PAGE_TOKEN — skipping publish]');
  console.log('Would post:', entry.slug, '→', entry.imageUrl);
  console.log('---\n' + entry.caption + '\n---\ncomment:', entry.firstComment);
  process.exit(0);
}

async function graph(pathPart, body) {
  const res = await fetch(`${GRAPH}/${pathPart}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: FB_PAGE_TOKEN }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Graph API ${res.status}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

(async () => {
  // 1) Upload every frame unpublished (real photos first, plate last - the
  //    voice rule), then publish one feed post with the caption. Entries with
  //    no images (Friday text statuses) post as message-only.
  const urls = (entry.imageUrls || [entry.imageUrl]).filter(Boolean);
  const media = [];
  for (const url of urls) {
    const up = await graph(`${FB_PAGE_ID}/photos`, { url, published: false });
    media.push({ media_fbid: up.id });
  }
  const body = { message: entry.caption };
  if (media.length) body.attached_media = media;
  const feed = await graph(`${FB_PAGE_ID}/feed`, body);
  const postId = feed.id;
  console.log(`Posted ${entry.slug} [${entry.format || 'plant'}] (${media.length} photos) → ${postId}`);

  // 2) Link as the first comment.
  if (postId && entry.firstComment) {
    await graph(`${postId}/comments`, { message: entry.firstComment });
    console.log('Added link comment.');
  }
})().catch((e) => {
  console.error('Publish failed:', e.message);
  process.exit(1);
});
