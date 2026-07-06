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

      {/* Name overlay on hover */}
      <div className="
        absolute bottom-0 left-0 right-0 p-2
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
        bg-gradient-to-t from-black/50 to-transparent
      ">
        <p className="text-white text-xs font-medium drop-shadow-lg truncate">
          {name}
        </p>
      </div>
    </motion.div>
  );
});

export default PlantCard;
