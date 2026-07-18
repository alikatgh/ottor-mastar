import { Language, loc } from "../types";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect, useId, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ZoomIn, Info, HelpCircle, ExternalLink, ArrowUpRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { getGalleryPaths, getIllustrationPath, getWikipediaUrl } from '../data/plants';
import { findPlantBySlug, COUNTRIES } from '../data/countries';

// Vernacular name-row label per language, for the country-aware names table.
const NAME_LABEL_KEY: Record<Language, string> = {
  sah: 'plant.yakutName',
  ru: 'plant.russianName',
  en: 'plant.englishName',
  mn: 'plant.mongolianName',
  zh: 'plant.chineseName',
};
import { useSettings } from '../context/SettingsContext';
import CategoryBadge from '../components/common/CategoryBadge';
import type { ViewerItem } from '../components/common/ImageViewer';

// Zoom viewer loads on first open, keeping react-zoom-pan-pinch out of this chunk.
const ImageViewer = lazy(() => import('../components/common/ImageViewer'));

export default function PlantDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as Language;

  // Back-navigate, but fall back to the catalog when this page was opened
  // directly (shared link / new tab) with no in-app history to pop. React
  // Router keeps its position in the stack at history.state.idx; idx 0 (or a
  // missing state) means navigate(-1) would leave the app entirely (WEB-M09).
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (idx === undefined || idx <= 0) {
      navigate('/catalog');
    } else {
      navigate(-1);
    }
  };

  // All hooks must run before the early return below (rules of hooks).
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { settings } = useSettings();

  // Reset carousel slide, open viewer, and scroll whenever the slug OR the
  // lead-image order changes. A new plant must start at slide 0, and flipping
  // "lead image" (plate↔photo) reorders `slides`/`viewerItems` so a kept index
  // would point at the wrong asset and dot (WEB-H01, R2-W-H01). Local
  // guarantee, independent of the route animation wrapper's remount.
  useEffect(() => {
    setActiveSlide(0);
    setViewerIndex(null);
    scrollRef.current?.scrollTo({ left: 0 });
  }, [slug, settings.leadImage]);
  // Search every country so shared links resolve regardless of selection.
  const plant = findPlantBySlug(slug as string);

  if (!plant) {
    // Unknown or missing slug (stale link, mistyped URL, or a plant that lives
    // in a country that is not the active dataset). Offer a genuine way out
    // rather than a bare "no results" line meant for empty search (WEB-H06).
    return (
      <div className="min-h-screen bg-card flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-2xl font-bold text-ink mb-2">
            {t('plant.notFound')}
          </h1>
          <p className="text-ink-light text-[15px] leading-relaxed mb-8">
            {t('plant.notFoundBody')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/catalog"
              className="
                inline-flex items-center gap-2 rounded-full
                bg-forest px-5 py-2.5 text-sm font-medium text-white
                no-underline hover:bg-forest-dark transition-colors
              "
            >
              {t('catalog.title')}
            </Link>
            <Link
              to="/"
              className="
                inline-flex items-center gap-2 rounded-full
                border border-hairline px-5 py-2.5 text-sm font-medium text-forest
                no-underline hover:bg-cream-dark/40 transition-colors
              "
            >
              {t('plant.backToGallery')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const illSrc = getIllustrationPath(plant, 'medium');

  // Illustration-forward by default: a genuine botanical plate leads with the
  // photo(s) as the secondary swipe. The "lead image" setting flips the order;
  // plants without a plate simply show the photos. A plant with a gallery adds
  // one photo swipe per frame, ordered close→far (getGalleryPaths).
  const plateSlide = illSrc ? [{ kind: 'plate' as const, src: illSrc }] : [];
  const photoSlides = getGalleryPaths(plant, 'medium').map(
    (src) => ({ kind: 'photo' as const, src }),
  );
  const slides: { kind: 'plate' | 'photo'; src: string }[] =
    settings.leadImage === 'photo'
      ? [...photoSlides, ...plateSlide]
      : [...plateSlide, ...photoSlides];

  // Full-resolution items for the zoom viewer, in the same order as the slides.
  const fullIll = getIllustrationPath(plant, 'full');
  const wikipediaHref = getWikipediaUrl(plant, lang);
  const plateItem: ViewerItem[] = fullIll
    ? [{
        src: fullIll,
        title: loc(plant.names, lang),
        subtitle: plant.names.latin,
        kind: t('plant.illustration'),
        badges: plant.categories,
        href: wikipediaHref,
      }]
    : [];
  const photoItems: ViewerItem[] = getGalleryPaths(plant, 'full').map((src) => ({
    src,
    title: loc(plant.names, lang),
    subtitle: plant.names.latin,
    kind: t('plant.photograph'),
    badges: plant.categories,
    href: wikipediaHref,
  }));
  const viewerItems: ViewerItem[] =
    settings.leadImage === 'photo'
      ? [...photoItems, ...plateItem]
      : [...plateItem, ...photoItems];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== activeSlide) setActiveSlide(index);
    }
  };

  // Scroll the carousel to a specific slide when its pagination dot is
  // activated. onScroll keeps activeSlide in sync as the smooth scroll lands.
  const scrollToSlide = (i: number) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: el.offsetWidth * i, behavior: 'smooth' });
  };

  // Human-readable label for a slide's pagination dot, mirroring the slide
  // buttons ("<plant> — Botanical illustration" / "<plant> — Photograph").
  const slideLabel = (kind: 'plate' | 'photo') =>
    `${plant.names[lang]} — ${kind === 'plate' ? t('plant.illustration') : t('plant.photograph')}`;

  const sections = [
    {
      title: t('plant.names'),
      content: (
        // The vernacular name rows follow the active collection's languages
        // (Yakutia: Yakut/Russian/English; Mongolia: Mongolian/Chinese/English),
        // then the Latin binomial.
        <div className="divide-y divide-hairline">
          {COUNTRIES[settings.country].languages.map((l) => (
            <NameRow key={l} label={t(NAME_LABEL_KEY[l])} value={loc(plant.names, l)} />
          ))}
          <NameRow label={t('plant.latinName')} value={plant.names.latin} italic />
        </div>
      ),
    },
    {
      title: t('plant.medicinalUses'),
      hint: t('plant.medicinalDisclaimer'),
      content: <p className="text-[15px] text-ink-light leading-relaxed">{plant.medicinalUses[lang]}</p>,
    },
    {
      title: t('plant.habitat'),
      content: <p className="text-[15px] text-ink-light leading-relaxed">{plant.habitat[lang]}</p>,
    },
    {
      title: t('plant.bloomingSeason'),
      content: <p className="text-[15px] text-ink-light">{t(`seasons.${plant.bloomingSeason}`)}</p>,
    },
  ];

  return (
    <div className="min-h-screen bg-card md:h-screen md:flex md:overflow-hidden">
      {/* Floating back button — mobile only (over the image, which is on top) */}
      <button
        type="button"
        onClick={goBack}
        aria-label={t('plant.backToGallery')}
        className="
          md:hidden fixed top-4 left-4 z-30 safe-top
          w-10 h-10 rounded-full
          bg-black/35 hover:bg-black/50 backdrop-blur-sm
          flex items-center justify-center transition-colors
        "
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* ============ IMAGE PANEL — top on mobile, right on desktop ============ */}
      <div className="relative bg-parchment h-[44vh] min-h-[280px] md:order-2 md:w-1/2 md:h-screen shrink-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {slides.map((slide, i) =>
            slide.kind === 'plate' ? (
              /* Botanical plate — primary. Shown whole on warm parchment so the
                 aged-paper edges and species caption read as an encyclopedia page. */
              <button
                key="plate"
                type="button"
                onClick={() => setViewerIndex(i)}
                aria-label={`${plant.names[lang]} — ${t('plant.illustration')}`}
                className="flex-none w-full h-full snap-center flex items-center justify-center p-4 pb-14 md:p-6 md:pb-14 lg:p-10 lg:pb-16 cursor-zoom-in"
              >
                <img
                  src={slide.src}
                  alt={`${plant.names[lang]} — ${t('plant.illustration')}`}
                  className="max-w-full max-h-full object-contain drop-shadow-xl"
                />
              </button>
            ) : (
              /* Photograph — secondary swipe. */
              <button
                key="photo"
                type="button"
                onClick={() => setViewerIndex(i)}
                aria-label={`${plant.names[lang]} — ${t('plant.photograph')}`}
                className="flex-none w-full h-full snap-center relative cursor-zoom-in"
              >
                <img
                  src={slide.src}
                  alt={plant.names[lang]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </button>
            )
          )}
        </div>

        {/* Zoom affordance */}
        <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <ZoomIn className="w-4.5 h-4.5 text-white" />
        </div>

        {/* Pagination Dots — frosted chip so they read over plate or photo.
            On mobile the info sheet overlaps this panel by 24px, so the chip
            rides at bottom-12 to stay fully clear of the sheet edge. */}
        {slides.length > 1 && (
          <div className="absolute bottom-12 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1 px-1.5 py-1 rounded-full bg-card/70 backdrop-blur-sm shadow-sm">
            {slides.map((slide, i) => (
              /* Real controls: keyboard-focusable, labelled, and jump to the
                 slide on activation (WEB-M07). The 32px hit target satisfies the
                 touch-target rule; the visible dot stays 8px and never changes
                 geometry on state — only color. */
              <button
                key={slide.kind}
                type="button"
                onClick={() => scrollToSlide(i)}
                aria-label={slideLabel(slide.kind)}
                aria-current={activeSlide === i ? 'true' : undefined}
                className="w-8 h-8 flex items-center justify-center rounded-full"
              >
                <span
                  aria-hidden
                  className={`block w-2 h-2 rounded-full transition-colors ${activeSlide === i ? 'bg-forest' : 'bg-forest/25'}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============ INFO PANEL — below on mobile, left on desktop ============ */}
      <motion.div
        className="
          relative z-10 bg-card
          -mt-6 rounded-t-[1.75rem] md:mt-0 md:rounded-none
          md:order-1 md:w-1/2 md:h-screen md:overflow-y-auto
          pb-24 md:pb-16
        "
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
      >
        {/* iOS sheet grabber — mobile only, where the panel reads as a sheet */}
        <div aria-hidden className="md:hidden w-10 h-[5px] rounded-full bg-ink/15 mx-auto mt-2.5" />
        <div className="max-w-xl mx-auto px-6 pt-8 md:px-8 md:pt-12 lg:px-16 lg:pt-16">
          {/* Desktop back link */}
          <button
            type="button"
            onClick={goBack}
            className="
              hidden md:inline-flex items-center gap-1.5 mb-8
              text-sm font-medium text-ink-muted hover:text-forest
              transition-colors
            "
          >
            <ArrowLeft className="w-4 h-4" />
            {t('plant.backToGallery')}
          </button>

          {/* Title block */}
          <div className="mb-6">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-ink mb-1">
              {plant.names[lang]}
            </h1>
            <p className="text-ink-muted italic text-base lg:text-lg">
              {plant.names.latin}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {plant.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-ink-light text-[15px] lg:text-base leading-relaxed mb-8">
            {plant.description[lang]}
          </p>

          {/* Detail sections — encyclopedia style: letterspaced label over a hairline rule */}
          <div className="space-y-8">
            {sections.map(({ title, content, hint }) => (
              <DetailSection
                key={title}
                title={title}
                hint={hint}
                hintLabel={t('plant.medicinalDisclaimerLabel')}
              >
                {content}
              </DetailSection>
            ))}

            {/* Further reading — a language-matched Wikipedia lookup so readers
                who want to go deeper stay in their chosen language. */}
            <section>
              <h2 className="overline-label !font-body border-t border-hairline pt-3 mb-3">
                {t('plant.furtherReading')}
              </h2>
              <a
                href={getWikipediaUrl(plant, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-3 rounded-xl border border-hairline bg-card
                  px-4 py-3.5 no-underline hover:bg-cream-dark/40 transition-colors
                  motion-safe:active:scale-[0.99]
                "
              >
                <ExternalLink className="w-4 h-4 text-forest shrink-0" strokeWidth={1.9} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{t('plant.readOnWikipedia')}</p>
                  <p className="text-xs text-ink-muted truncate tabular-nums">
                    {lang}.wikipedia.org
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-muted/60 shrink-0" />
              </a>
            </section>
          </div>

          {/* Safety disclaimer — this page shows traditional medicinal uses */}
          <div className="mt-8 rounded-xl bg-amber-tint border border-amber/25 p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-warm shrink-0 mt-0.5" />
            <p className="text-xs text-ink-light leading-relaxed">
              {t('common.disclaimerShort')}{' '}
              <Link to="/legal" className="font-medium text-forest hover:text-forest-dark no-underline">
                {t('common.readDisclaimer')}
              </Link>
            </p>
          </div>

          {/* Back to gallery */}
          <div className="mt-6 pt-6 border-t border-hairline">
            <Link
              to="/"
              className="
                inline-flex items-center gap-2
                text-sm font-medium text-forest
                hover:text-forest-dark
                no-underline transition-colors
              "
            >
              <ArrowLeft className="w-4 h-4" />
              {t('plant.backToGallery')}
            </Link>
          </div>
        </div>
      </motion.div>

      {viewerIndex !== null && (
        <Suspense fallback={null}>
          <ImageViewer
            items={viewerItems}
            index={viewerIndex}
            onIndexChange={setViewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

function NameRow({ label, value, italic = false }: { label: string, value: string, italic?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 first:pt-0">
      <span className="text-sm text-ink-muted flex-shrink-0">{label}</span>
      <span className={`text-sm text-ink font-medium text-right ${italic ? 'italic font-normal' : ''}`}>{value}</span>
    </div>
  );
}

/**
 * A detail section whose heading carries an optional (?) that reveals a short
 * legal note. The note renders as an in-flow block BELOW the heading (full
 * content width) rather than a floating popover — so it can never overflow the
 * viewport and get clipped, as the old right-anchored tooltip did on narrow
 * screens. Used on "Medicinal uses" to make explicit that the content is
 * informational, carries no instructions, and shifts responsibility to the reader.
 */
function DetailSection({
  title,
  hint,
  hintLabel,
  children,
}: {
  title: string;
  hint?: string;
  hintLabel: string;
  children: React.ReactNode;
}) {
  const [showHint, setShowHint] = useState(false);
  const tipId = useId();

  // Close on Escape while open, so keyboard users can dismiss it (WEB-M14).
  useEffect(() => {
    if (!showHint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHint(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showHint]);

  return (
    <section>
      <h2 className="overline-label !font-body border-t border-hairline pt-3 mb-3 flex items-center gap-2">
        {title}
        {hint && (
          <button
            type="button"
            aria-label={hintLabel}
            aria-expanded={showHint}
            aria-controls={showHint ? tipId : undefined}
            onClick={() => setShowHint((v) => !v)}
            className="text-ink-muted/70 hover:text-forest transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </h2>
      <AnimatePresence initial={false}>
        {hint && showHint && (
          <motion.p
            key="hint"
            id={tipId}
            role="note"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            className="
              mb-3 rounded-xl border border-hairline bg-cream-dark/30
              p-3 text-[12px] leading-relaxed font-body normal-case tracking-normal
              text-ink-light
            "
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
      {children}
    </section>
  );
}
