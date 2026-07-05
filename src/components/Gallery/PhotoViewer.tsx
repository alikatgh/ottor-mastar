import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImagePath } from '../../data/plants';
import CategoryBadge from '../common/CategoryBadge';

import { Plant, Language } from "../../types";
export default function PhotoViewer({ plants, currentIndex, onClose, onNavigate, lang }: { plants: Plant[], currentIndex: number, onClose: () => void, onNavigate: (d: number) => void, lang: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const dragY = useMotionValue(0);
  const bgOpacity = useTransform(dragY, [-200, 0, 200], [0.5, 1, 0.5]);

  const plant = plants[currentIndex];
  const imageSrc = getImagePath(plant, 'full');
  const name = plant.names[lang as Language] || plant.names.sah;
  const latinName = plant.names.latin;

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onNavigate(-1);
          break;
        case 'ArrowRight':
          onNavigate(1);
          break;
        case 'i':
          setShowInfo((prev) => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  // Touch swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    // Horizontal swipe (navigate)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60) {
      if (deltaX > 0) onNavigate(-1);
      else onNavigate(1);
    }

    setTouchStart(null);
  }, [touchStart, onNavigate]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    // Pull down to dismiss
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  }, [onClose]);

  const goToDetail = useCallback(() => {
    onClose();
    navigate(`/plant/${plant.slug}`);
  }, [plant.slug, navigate, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="photo-viewer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ opacity: bgOpacity }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10
            w-10 h-10 rounded-full
            bg-white/10 hover:bg-white/20
            flex items-center justify-center
            transition-colors safe-top
          "
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Counter */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 safe-top">
          <span className="text-white/70 text-sm font-medium">
            {currentIndex + 1} / {plants.length}
          </span>
        </div>

        {/* Navigation arrows (desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(-1)}
            className="
              absolute left-4 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 rounded-full
              bg-white/10 hover:bg-white/20
              items-center justify-center
              transition-colors
              hidden sm:flex
            "
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {currentIndex < plants.length - 1 && (
          <button
            onClick={() => onNavigate(1)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 rounded-full
              bg-white/10 hover:bg-white/20
              items-center justify-center
              transition-colors
              hidden sm:flex
            "
            aria-label={t('common.next')}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Main image */}
        <motion.div
          className="w-full h-full flex items-center justify-center p-4"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
          style={{ y: dragY }}
        >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={plant.id}
              src={imageSrc}
              alt={name}
              className="photo-viewer-image"
              layoutId={`plant-${plant.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              draggable={false}
            />
          </AnimatePresence>
        </motion.div>

        {/* Info panel */}
        <motion.div
          className="info-panel safe-bottom"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-xl font-semibold text-white mb-0.5 truncate">
                {name}
              </h3>
              <p className="text-white/60 text-sm italic truncate">
                {latinName}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {plant.categories.map((cat) => (
                  <CategoryBadge key={cat} category={cat} />
                ))}
              </div>
            </div>

            {/* View detail button */}
            <button
              onClick={goToDetail}
              className="
                flex-shrink-0 w-10 h-10 rounded-full
                bg-white/15 hover:bg-white/25
                flex items-center justify-center
                transition-colors
              "
              aria-label="View plant details"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
