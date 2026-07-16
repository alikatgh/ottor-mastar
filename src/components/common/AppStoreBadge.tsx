import { APP_STORE_URL } from '../../data/appLinks';

/**
 * "Download on the App Store" badge.
 *
 * Built on the ink/cream tokens rather than fixed black/white so it inverts
 * with the theme for free — a black badge on the light parchment canvas, a
 * white badge on the dark canvas — which is exactly Apple's own two-variant
 * convention. The Apple mark is the standard logo glyph; the wordmark stays in
 * English (Apple's guidelines permit the English badge in every locale, and it
 * reads as the badge everywhere).
 */
export default function AppStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Ottor Mastar on the App Store"
      className={
        'inline-flex items-center gap-2.5 rounded-xl bg-ink px-3.5 py-2 ' +
        'no-underline select-none transition-transform duration-100 ' +
        'hover:opacity-90 active:scale-[0.985] ' +
        className
      }
    >
      <svg viewBox="0 0 384 512" aria-hidden="true" className="w-[26px] h-[26px] fill-cream shrink-0">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <span className="flex flex-col text-cream leading-none text-left">
        <span className="text-[9px] font-medium tracking-[0.02em] opacity-85">Download on the</span>
        <span className="text-[17px] font-semibold tracking-[-0.01em] mt-[3px]">App Store</span>
      </span>
    </a>
  );
}
