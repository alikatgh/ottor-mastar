import { useState, memo, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { getImagePath } from '../../data/plants';
import { useSettings } from '../../context/SettingsContext';
import { Plant, Language } from '../../types';

interface PlantCardProps {
  plant: Plant;
  index: number;
  lang: string;
  onClick: () => void;
}

const PlantCard = memo(function PlantCard({ plant, index, lang, onClick }: PlantCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { settings } = useSettings();
  const name = plant.names[lang as Language] || plant.names.sah;

  // Optimized thumbnail (webp) served from /plants/thumb/.
  const imageSrc = getImagePath(plant, 'thumb');

  // Keyboard-activate the card the same way a click does. Enter/Space are the
  // standard "activate" keys for a role="button"; preventDefault stops Space
  // from scrolling the grid.
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      className="gallery-item group"
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Skeleton placeholder — until the photo loads, or a parchment fill if
          it fails outright (broken/missing asset), so we never leave a raw
          broken-image icon over the herbarium grid (WEB-L11). */}
      {!loaded && !failed && (
        <div className="absolute inset-0 skeleton" />
      )}
      {failed && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-parchment)' }}
          aria-hidden="true"
        >
          <span className="font-serif text-2xl text-ink-muted/50 select-none">❦</span>
        </div>
      )}

      {!failed && (
      <img
        src={imageSrc}
        alt={name}
        loading={index < 12 ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
      />
      )}

      {/* Name label — always visible and readable over any photo. A strong
          bottom scrim plus a text-shadow carries the white text across the
          busiest bright-meadow shots (the old hover-only ghost was invisible
          on touch and low-contrast on light backgrounds). Can be turned off
          in Settings for a pure photo wall. */}
      {settings.tileLabels && (
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
      )}
    </motion.div>
  );
});

export default PlantCard;
