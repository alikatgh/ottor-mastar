import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, Settings } from '../context/SettingsContext';
import { COUNTRIES, COUNTRY_IDS, isCountryAvailable } from '../data/countries';
import { LANGUAGES } from '../i18n';

/**
 * The page renders itself from SECTIONS below — adding a setting is one entry
 * here plus its keys in the three locale files (and, for a new behavior, the
 * component that reads it from useSettings). No new layout code per setting.
 */

type EnumSetting = {
  kind: 'enum';
  key: { [K in keyof Settings]: Settings[K] extends string ? K : never }[keyof Settings];
  labelKey: string;
  noteKey?: string;
  options: { value: string; labelKey: string; disabled?: boolean }[];
};

type ToggleSetting = {
  kind: 'toggle';
  key: { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
  labelKey: string;
  noteKey?: string;
};

type SettingDef = EnumSetting | ToggleSetting;

type SectionDef = { titleKey: string; items: SettingDef[] };

/**
 * The one Country row lives in its own section so Language (owned by i18next,
 * rendered separately) and Country read as two distinct groups rather than one
 * combined "region" block. Hoisted to a module constant — computed once, not
 * on every render.
 */
const COUNTRY_SECTION: SectionDef = {
  titleKey: 'settings.sectionCountry',
  items: [
    {
      kind: 'enum',
      key: 'country',
      labelKey: 'settings.country',
      noteKey: 'settings.countryNote',
      options: COUNTRY_IDS.map((id) => ({
        value: id,
        labelKey: `settings.country_${id}`,
        disabled: !isCountryAvailable(id),
      })),
    },
  ],
};

/** Generic (i18next-independent) settings sections, rendered from data. */
const SECTIONS: SectionDef[] = [
  {
    titleKey: 'settings.sectionContent',
    items: [
      { kind: 'toggle', key: 'showLatin', labelKey: 'settings.showLatin' },
      {
        kind: 'enum',
        key: 'catalogSort',
        labelKey: 'settings.catalogSort',
        options: [
          { value: 'name', labelKey: 'settings.sortName' },
          { value: 'season', labelKey: 'settings.sortSeason' },
        ],
      },
      {
        kind: 'enum',
        key: 'leadImage',
        labelKey: 'settings.leadImage',
        options: [
          { value: 'plate', labelKey: 'settings.leadPlate' },
          { value: 'photo', labelKey: 'settings.leadPhoto' },
        ],
      },
    ],
  },
  {
    titleKey: 'settings.sectionDisplay',
    items: [
      {
        kind: 'enum',
        key: 'textSize',
        labelKey: 'settings.textSize',
        options: [
          { value: 'small', labelKey: 'settings.textSmall' },
          { value: 'default', labelKey: 'settings.textDefault' },
          { value: 'large', labelKey: 'settings.textLarge' },
        ],
      },
      { kind: 'toggle', key: 'reduceMotion', labelKey: 'settings.reduceMotion' },
    ],
  },
  {
    titleKey: 'settings.sectionGallery',
    items: [
      { kind: 'toggle', key: 'tileLabels', labelKey: 'settings.tileLabels' },
      {
        kind: 'enum',
        key: 'tileTap',
        labelKey: 'settings.tileTap',
        options: [
          { value: 'viewer', labelKey: 'settings.tapViewer' },
          { value: 'detail', labelKey: 'settings.tapDetail' },
        ],
      },
    ],
  },
];

/**
 * The detected browser default language, clamped to a supported code — the same
 * region-strip + supported-list logic i18n uses at init. Reset returns the app
 * to this rather than leaving the user's last manual pick in place (WEB-L16).
 */
const SUPPORTED_LANGS = LANGUAGES.map((l) => l.code);
const FALLBACK_LANG = 'sah';

function detectedDefaultLanguage(): string {
  const candidates =
    typeof navigator !== 'undefined'
      ? [...(navigator.languages ?? []), navigator.language]
      : [];
  for (const raw of candidates) {
    if (!raw) continue;
    const code = raw.split('-')[0];
    if (SUPPORTED_LANGS.includes(code)) return code;
  }
  return FALLBACK_LANG;
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { settings, update, reset } = useSettings();

  // Reset the stored settings AND return the language to the detected browser
  // default, so a full reset leaves nothing of the previous session behind.
  const resetAll = () => {
    reset();
    i18n.changeLanguage(detectedDefaultLanguage());
  };

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-heading text-4xl font-bold text-ink mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-ink-muted mb-10">{t('settings.storageNote')}</p>

        <div className="space-y-10">
          {/* Language — owned by i18next, so it renders as its own group */}
          <Section titleKey="settings.sectionLanguage" t={t}>
            <Row label={t('settings.language')}>
              <Segmented
                value={i18n.language}
                // Only the active country's languages (Yakutia: sah/ru/en;
                // Mongolia: mn/zh/en), in the country's order — matching the
                // header switcher.
                options={COUNTRIES[settings.country].languages.map((code) => {
                  const l = LANGUAGES.find((x) => x.code === code);
                  return { value: code, label: l?.shortLabel ?? code };
                })}
                onChange={(code) => i18n.changeLanguage(code)}
              />
            </Row>
          </Section>

          {/* Country — a distinct group from Language */}
          <Section titleKey={COUNTRY_SECTION.titleKey} t={t}>
            {COUNTRY_SECTION.items.map((item) => (
              <SettingRow key={item.key} item={item} settings={settings} update={update} t={t} />
            ))}
          </Section>

          {SECTIONS.map((section) => (
            <Section key={section.titleKey} titleKey={section.titleKey} t={t}>
              {section.items.map((item) => (
                <SettingRow key={item.key} item={item} settings={settings} update={update} t={t} />
              ))}
            </Section>
          ))}

          <Section titleKey="settings.sectionData" t={t}>
            <div className="py-3.5">
              <button
                onClick={resetAll}
                className="
                  text-sm font-medium text-ink-light
                  border border-hairline-strong rounded-full px-4 py-2
                  hover:bg-cream-dark transition-colors
                "
              >
                {t('settings.reset')}
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  titleKey,
  t,
  children,
}: {
  titleKey: string;
  t: (k: string) => string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="overline-label border-t border-hairline pt-3">
        {t(titleKey)}
      </h2>
      <div className="divide-y divide-hairline">{children}</div>
    </section>
  );
}

function SettingRow({
  item,
  settings,
  update,
  t,
}: {
  item: SettingDef;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  t: (k: string) => string;
}) {
  return (
    <Row label={t(item.labelKey)} note={item.noteKey ? t(item.noteKey) : undefined}>
      {item.kind === 'toggle' ? (
        <Toggle
          checked={settings[item.key]}
          label={t(item.labelKey)}
          onChange={(v) => update({ [item.key]: v } as Partial<Settings>)}
        />
      ) : (
        <Segmented
          value={settings[item.key]}
          options={item.options.map((o) => ({
            value: o.value,
            label: t(o.labelKey),
            disabled: o.disabled,
            disabledHint: o.disabled ? t('settings.comingSoon') : undefined,
          }))}
          onChange={(v) => {
            // Only accept a value the control actually offers, so a stray/stale
            // click can never write an out-of-enum value for this key. update()
            // re-validates too, but this keeps the bad value from ever leaving
            // the control (WEB-M13).
            if (item.options.some((o) => o.value === v)) {
              update({ [item.key]: v } as Partial<Settings>);
            }
          }}
        />
      )}
    </Row>
  );
}

function Row({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] text-ink">{label}</p>
        {note && <p className="text-xs text-ink-muted mt-0.5 leading-snug max-w-[36ch]">{note}</p>}
      </div>
      {/* When the control doesn't fit beside the label it drops to its own
          line, still right-aligned. */}
      <div className="shrink-0 ml-auto">{children}</div>
    </div>
  );
}

/** Pill segmented control — active state changes only color, never geometry. */
function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string; disabled?: boolean; disabledHint?: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-hairline overflow-hidden">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            disabled={opt.disabled}
            title={opt.disabled ? opt.disabledHint : undefined}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-1.5 text-xs font-medium transition-colors
              ${active
                ? 'bg-forest text-white'
                : opt.disabled
                  ? 'text-ink-muted/50 cursor-not-allowed'
                  : 'text-ink-light hover:bg-cream-dark'}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Switch — fixed-size track, knob slides; container geometry never changes. */
function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6.5 rounded-full border transition-colors duration-200
        ${checked ? 'bg-forest border-forest' : 'bg-cream-dark border-hairline-strong'}
      `}
    >
      <span
        className={`
          absolute top-1/2 -translate-y-1/2 left-0.5
          w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? 'translate-x-[18px]' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
