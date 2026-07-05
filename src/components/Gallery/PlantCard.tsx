import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { getImagePath } from '../../data/plants';
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

  // Use original images from the public/images/ folder
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
