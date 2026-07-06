import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';
import { getImagePath, hasIllustration } from '../../data/plants';
import { Plant, Language } from '../../types';

interface PlantCardProps {
  plant: Plant;
  index: number;
  lang: string;
  onClick: () => void;
}

const PlantCard = memo(function PlantCard({ plant, index, lang, onClick }: PlantCardProps) {
  const [loaded, setLoaded] = useState(false);
  const name = plant.names[lang as Language] || plant.names.sah;

  // Optimized thumbnail (webp) served from /plants/thumb/.
  const imageSrc = getImagePath(plant, 'thumb');

  return (
    <motion.div
      className="gallery-item group"
      layoutId={`plant-${plant.id}`}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Skeleton placeholder */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Marker — this plant has a genuine botanical plate on its detail page */}
      {hasIllustration(plant) && (
        <div
          className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          title="Botanical illustration available"
        >
          <Feather className="w-3 h-3 text-white/95" strokeWidth={2} />
        </div>
      )}

      <img
        src={imageSrc}
        alt={name}
        loading={index < 12 ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
      />

      {/* Name label — always visible and readable over any photo. A strong
          bottom scrim plus a text-shadow carries the white text across the
          busiest bright-meadow shots (the old hover-only ghost was invisible
          on touch and low-contrast on light backgrounds). */}
      <div className="
        absolute inset-x-0 bottom-0 px-1.5 pb-1.5 pt-7
        pointer-events-none
        bg-gradient-to-t from-black/80 via-black/40 to-transparent
      ">
        <p
          className="text-white text-[11px] font-medium leading-tight line-clamp-2"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
        >
          {name}
        </p>
      </div>
    </motion.div>
  );
});

export default PlantCard;
