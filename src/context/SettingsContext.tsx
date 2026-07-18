/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import i18n from '../i18n';
import { Plant, Language } from '../types';
import { COUNTRIES, COUNTRY_IDS, DEFAULT_COUNTRY, isCountryAvailable, CountryId } from '../data/countries';
import { detectGeoDefault } from '../utils/geoDefault';

/**
 * All user settings live here as one typed object persisted to localStorage.
 * Language is intentionally NOT part of this store — i18next already owns and
 * persists it; the Settings page controls it through i18n directly.
 */
export interface Settings {
  /** Which country's collection the whole app shows. Always defaults to Yakutia. */
  country: CountryId;
  /** Italic Latin names in catalog/search lists and the plates shelf. */
  showLatin: boolean;
  /** Default ordering of the catalog index. */
  catalogSort: 'name' | 'season';
  /** Color theme; 'system' follows the OS preference live. */
  theme: 'system' | 'light' | 'dark';
  /** Root text scale — every rem-based size in the app follows it. */
  textSize: 'small' | 'default' | 'large';
  /** Calms framer-motion and CSS animation/scroll effects. */
  reduceMotion: boolean;
  /** Which image leads on a plant page: the botanical plate or the field photo. */
  leadImage: 'plate' | 'photo';
  /** Name scrims on gallery photo tiles. */
  tileLabels: boolean;
  /** What tapping a gallery tile opens. */
  tileTap: 'viewer' | 'detail';
}

export const DEFAULT_SETTINGS: Settings = {
  country: DEFAULT_COUNTRY,
  showLatin: true,
  catalogSort: 'name',
  theme: 'system',
  textSize: 'default',
  reduceMotion: false,
  leadImage: 'plate',
  tileLabels: true,
  tileTap: 'viewer',
};

const STORAGE_KEY = 'om_settings_v1';

// Allowed values per enum setting — the single source the validator clamps to.
const CATALOG_SORTS = ['name', 'season'] as const;
const THEMES = ['system', 'light', 'dark'] as const;
const TEXT_SIZES = ['small', 'default', 'large'] as const;
const LEAD_IMAGES = ['plate', 'photo'] as const;
const TILE_TAPS = ['viewer', 'detail'] as const;

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Coerce any parsed/patched shape into a valid `Settings`. Never throws and
 * never lets an invalid enum, non-boolean, or unknown/unavailable country
 * through — a tampered `country: "france"` in localStorage otherwise makes
 * `COUNTRIES[id]` undefined and crashes `usePlants()` (WEB-C01). Every field
 * is validated, not just country (WEB-M12), and this same guard runs on
 * `update()` so programmatic writes can't corrupt the store either.
 */
function validateSettings(input: unknown): Settings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const country = oneOf<CountryId>(raw.country, COUNTRY_IDS, DEFAULT_COUNTRY);
  return {
    country: isCountryAvailable(country) ? country : DEFAULT_COUNTRY,
    showLatin: bool(raw.showLatin, DEFAULT_SETTINGS.showLatin),
    catalogSort: oneOf(raw.catalogSort, CATALOG_SORTS, DEFAULT_SETTINGS.catalogSort),
    theme: oneOf(raw.theme, THEMES, DEFAULT_SETTINGS.theme),
    textSize: oneOf(raw.textSize, TEXT_SIZES, DEFAULT_SETTINGS.textSize),
    reduceMotion: bool(raw.reduceMotion, DEFAULT_SETTINGS.reduceMotion),
    leadImage: oneOf(raw.leadImage, LEAD_IMAGES, DEFAULT_SETTINGS.leadImage),
    tileLabels: bool(raw.tileLabels, DEFAULT_SETTINGS.tileLabels),
    tileTap: oneOf(raw.tileTap, TILE_TAPS, DEFAULT_SETTINGS.tileTap),
  };
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // First launch (nothing stored): pick the collection from the device's own
    // region/timezone — Mongolia → Mongolia, Russia/rest → Yakutia — so a visitor
    // in Ulaanbaatar lands on the Mongolia page instead of the Yakut one. Offline,
    // no tracking. Once the user has any stored settings, their choice wins.
    if (!raw) {
      const geo = detectGeoDefault();
      const country = isCountryAvailable(geo.country) ? geo.country : DEFAULT_COUNTRY;
      return { ...DEFAULT_SETTINGS, country };
    }
    return validateSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private-mode storage failures are non-fatal */
    }
  }, [settings]);

  // Display settings apply as <html> data attributes so plain CSS can react
  // (see index.css) without threading props through every component.
  useEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize;
    document.documentElement.dataset.reduceMotion = String(settings.reduceMotion);
  }, [settings.textSize, settings.reduceMotion]);

  // Theme: stamp the RESOLVED value ('system' → the OS preference, tracked
  // live) so the CSS only ever deals with light|dark. Also sync the browser
  // chrome color (<meta name="theme-color">) to the canvas.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved =
        settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      document.documentElement.dataset.theme = resolved;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', resolved === 'dark' ? '#1A1914' : '#2D5F2D');
    };
    apply();
    if (settings.theme === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
  }, [settings.theme]);

  // Keep the interface language coherent with the country. Each collection
  // offers its own languages (Yakutia: sah/ru/en; Mongolia: mn/zh/en). When the
  // reader switches country — or lands with a detected language the current
  // country doesn't offer — move them to that country's default language.
  // Runs on mount and whenever country changes.
  useEffect(() => {
    const { languages, defaultLanguage } = COUNTRIES[settings.country];
    if (!languages.includes(i18n.language as Language)) {
      i18n.changeLanguage(defaultLanguage);
    }
  }, [settings.country]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      update: (patch) => setSettings((s) => validateSettings({ ...s, ...patch })),
      reset: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {/* 'user' respects the OS reduced-motion preference when our own toggle is off */}
      <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

/** The active country's plant collection — the only way pages should get plants. */
export function usePlants(): Plant[] {
  const { settings } = useSettings();
  // Defence in depth: settings are validated on load/update, but never index
  // COUNTRIES with an unchecked key — fall back to the default collection.
  return (COUNTRIES[settings.country] ?? COUNTRIES[DEFAULT_COUNTRY]).plants;
}
