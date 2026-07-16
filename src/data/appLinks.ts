/**
 * Store links for the native Ottor Mastar apps — single source of truth so the
 * homepage badge, the Help page, and the /app landing hub can never drift.
 *
 * iOS is live on the App Store (app record 6789648576, Education, free).
 * Android ships via Google Play only — the record exists but the listing is
 * still in review; add PLAY_URL below the day it goes live and the badges
 * that opt in will light up automatically.
 */
export const APP_STORE_APP_ID = '6789648576';
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`;

// Android — Google Play only (no APK sideload). Uncomment when the listing is live:
// export const PLAY_PACKAGE = 'com.aulenor.ottormastar';
// export const PLAY_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;
