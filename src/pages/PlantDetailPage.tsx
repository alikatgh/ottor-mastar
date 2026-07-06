import { Language } from "../types";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ZoomIn, Info } from 'lucide-react';
import { getImagePath, getIllustrationPath } from '../data/plants';
import { findPlantBySlug } from '../data/countries';
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

  // All hooks must run before the early return below (rules of hooks).
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { settings } = useSettings();
  // Search every country so shared links resolve regardless of selection.
  const plant = findPlantBySlug(slug as string);

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">{t('catalog.noResults')}</p>
      </div>
    );
  }

  const imageSrc = getImagePath(plant, 'medium');
  const illSrc = getIllustrationPath(plant, 'medium');

  // Illustration-forward by default: a genuine botanical plate leads with the
  // photo as the secondary swipe. The "lead image" setting flips the order;
  // plants without a plate simply show the photo.
  const plateSlide = illSrc ? [{ kind: 'plate' as const, src: illSrc }] : [];
  const photoSlide = [{ kind: 'photo' as const, src: imageSrc }];
  const slides: { kind: 'plate' | 'photo'; src: string }[] =
    settings.leadImage === 'photo'
      ? [...photoSlide, ...plateSlide]
      : [...plateSlide, ...photoSlide];

  // Full-resolution items for the zoom viewer, in the same order as the slides.
  const fullIll = getIllustrationPath(plant, 'full');
  const plateItem: ViewerItem[] = fullIll
    ? [{
        src: fullIll,
        title: plant.names[lang],
        subtitle: plant.names.latin,
        kind: t('plant.illustration'),
        badges: plant.categories,
      }]
    : [];
  const photoItem: ViewerItem[] = [{
    src: getImagePath(plant, 'full'),
    title: plant.names[lang],
    subtitle: plant.names.latin,
    kind: t('plant.photograph'),
    badges: plant.categories,
  }];
  const viewerItems: ViewerItem[] =
    settings.leadImage === 'photo'
      ? [...photoItem, ...plateItem]
      : [...plateItem, ...photoItem];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== activeSlide) setActiveSlide(index);
    }
  };

  const sections = [
    {
      title: t('plant.names'),
      content: (
        <div className="divide-y divide-hairline">
          <NameRow label={t('plant.yakutName')} value={plant.names.sah} />
          <NameRow label={t('plant.russianName')} value={plant.names.ru} />
          <NameRow label={t('plant.englishName')} value={plant.names.en} />
          <NameRow label={t('plant.latinName')} value={plant.names.latin} italic />
        </div>
      ),
    },
    {
      title: t('plant.medicinalUses'),
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
    <div className="min-h-screen bg-white md:h-screen md:flex md:overflow-hidden">
      {/* Floating back button — mobile only (over the image, which is on top) */}
      <button
        onClick={() => navigate(-1)}
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

        {/* Pagination Dots — frosted chip so they read over plate or photo */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-2.5 py-1.5 rounded-full bg-white/70 backdrop-blur-sm shadow-sm">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${activeSlide === i ? 'bg-forest' : 'bg-forest/25'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============ INFO PANEL — below on mobile, left on desktop ============ */}
      <div
        className="
          relative z-10 bg-white
          -mt-6 rounded-t-[1.75rem] md:mt-0 md:rounded-none
          md:order-1 md:w-1/2 md:h-screen md:overflow-y-auto
          pb-24 md:pb-16
        "
      >
        <div className="max-w-xl mx-auto px-6 pt-8 md:px-8 md:pt-12 lg:px-16 lg:pt-16">
          {/* Desktop back link */}
          <button
            onClick={() => navigate(-1)}
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
            {sections.map(({ title, content }) => (
              <section key={title}>
                <h2 className="overline-label !font-body border-t border-hairline pt-3 mb-3">
                  {title}
                </h2>
                {content}
              </section>
            ))}
          </div>

          {/* Safety disclaimer — this page shows traditional medicinal uses */}
          <div className="mt-8 rounded-xl bg-[#FFF7F2] border border-amber/25 p-3.5 flex items-start gap-2.5">
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
      </div>

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
