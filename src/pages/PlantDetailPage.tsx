import { Language } from "../types";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Stethoscope, Globe } from 'lucide-react';
import { getPlantBySlug, getImagePath } from '../data/plants';
import CategoryBadge from '../components/common/CategoryBadge';

export default function PlantDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
    const lang = i18n.language as Language;

  const plant = getPlantBySlug(slug as string);

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">{t('catalog.noResults')}</p>
      </div>
    );
  }

  const imageSrc = getImagePath(plant, 'medium');
  const illSrc = plant.illustrationId ? `/plants/medium/${plant.illustrationId}.webp` : null;

  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      icon: Globe,
      title: t('plant.names'),
      content: (
        <div className="space-y-2">
          <NameRow label={t('plant.yakutName')} value={plant.names.sah} />
          <NameRow label={t('plant.russianName')} value={plant.names.ru} />
          <NameRow label={t('plant.englishName')} value={plant.names.en} />
          <NameRow label={t('plant.latinName')} value={plant.names.latin} italic />
        </div>
      ),
    },
    {
      icon: Stethoscope,
      title: t('plant.medicinalUses'),
      content: <p className="text-sm text-ink-light leading-relaxed">{plant.medicinalUses[lang]}</p>,
    },
    {
      icon: MapPin,
      title: t('plant.habitat'),
      content: <p className="text-sm text-ink-light leading-relaxed">{plant.habitat[lang]}</p>,
    },
    {
      icon: Calendar,
      title: t('plant.bloomingSeason'),
      content: <p className="text-sm text-ink-light">{t(`seasons.${plant.bloomingSeason}`)}</p>,
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Image Carousel */}
      <motion.div
        className="relative h-[55vh] min-h-[350px] max-h-[550px]"
        layoutId={`plant-${plant.id}`}
      >
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Photo */}
          <div className="flex-none w-full h-full snap-center relative">
            <img
              src={imageSrc}
              alt={plant.names[lang]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-cream" />
          </div>
          
          {/* Illustration */}
          {illSrc && (
            <div className="flex-none w-full h-full snap-center relative bg-[#F4F1EA]">
              <img
                src={illSrc}
                alt={`${plant.names[lang]} illustration`}
                className="w-full h-full object-contain p-4 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-cream" />
            </div>
          )}
        </div>

        {/* Pagination Dots */}
        {illSrc && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
            <div className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 0 ? 'bg-white' : 'bg-white/40'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 1 ? 'bg-white' : 'bg-white/40'}`} />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="
            absolute top-4 left-4 z-10 safe-top
            w-10 h-10 rounded-full
            bg-white/20 hover:bg-white/30 backdrop-blur-sm
            flex items-center justify-center
            transition-colors
          "
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 -mt-12 relative z-10 pb-24 sm:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-3xl shadow-elevated p-6"
        >
          {/* Title block */}
          <div className="mb-6">
            <h1 className="font-heading text-3xl font-bold text-ink mb-1">
              {plant.names[lang]}
            </h1>
            <p className="text-ink-muted italic text-base">
              {plant.names.latin}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {plant.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-ink-light text-[15px] leading-relaxed mb-8">
            {plant.description[lang]}
          </p>

          {/* Detail sections */}
          <div className="space-y-6">
            {sections.map(({ icon: Icon, title, content }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forest/8 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-forest" />
                  </div>
                  <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">
                    {title}
                  </h2>
                </div>
                <div className="pl-[42px]">
                  {content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back to gallery */}
          <div className="mt-8 pt-6 border-t border-black/5">
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
        </motion.div>
      </div>
    </div>
  );
}

function NameRow({ label, value, italic = false }: { label: string, value: string, italic?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-ink-muted uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className={`text-sm text-ink text-right ${italic ? 'italic' : ''}`}>{value}</span>
    </div>
  );
}
