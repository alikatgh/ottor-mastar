/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { Plant } from '../types';
import { COUNTRIES, DEFAULT_COUNTRY, isCountryAvailable, CountryId } from '../data/countries';

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
  textSize: 'default',
  reduceMotion: false,
  leadImage: 'plate',
  tileLabels: true,
  tileTap: 'viewer',
};

const STORAGE_KEY = 'om_settings_v1';

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    // A persisted country whose dataset has since emptied must not strand the
    // user on a blank app — fall back to the default collection.
    if (!isCountryAvailable(parsed.country)) parsed.country = DEFAULT_COUNTRY;
    return parsed;
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

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
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
  return COUNTRIES[settings.country].plants;
}
