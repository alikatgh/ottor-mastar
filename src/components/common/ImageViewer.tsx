import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryBadge from './CategoryBadge';
import { useSettings } from '../../context/SettingsContext';

export interface ViewerItem {
  src: string;
  title: string;
  subtitle?: string;
  /** Category keys, rendered as badges under the title. */
  badges?: string[];
  /** Small label above the title, e.g. "Illustration" / "Photograph". */
  kind?: string;
}

interface ImageViewerProps {
  items: ViewerItem[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** Optional action button in the caption (e.g. open the plant's detail page). */
  onOpenDetail?: (i: number) => void;
}

/**
 * Full-screen image viewer with native-feel zoom and iOS-Photos motion.
 *
 * - Pinch, double-tap, and wheel zoom + drag-to-pan (react-zoom-pan-pinch).
 * - Springy scale-up on open; swipe DOWN (when not zoomed) drags the image
 *   with the finger while the backdrop and chrome fade — release past the
 *   threshold to dismiss, otherwise it springs back. Close/Esc fade out.
 * - A blurred copy of the image fills the letterbox instead of black bars
 *   (iOS Photos style), so portrait shots don't leave a narrow image in a
 *   sea of black.
 * - The caption (name / latin / badges) is always visible and high-contrast.
 */
export default function ImageViewer({ items, index, onIndexChange, onClose, onOpenDetail }: ImageViewerProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  // While zoomed in, vertical drags belong to pan — dismiss is scale-1 only.
  const [zoomed, setZoomed] = useState(false);
  const closingRef = useRef(false);

  // Swipe-down state: image follows the finger; backdrop & chrome fade with it.
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 320], [1, 0.25]);
  const chromeOpacity = useTransform(y, [0, 120], [1, 0]);
  const dragScale = useTransform(y, [0, 360], [1, 0.86]);
  // Whole-overlay fade, driven imperatively for open and close.
  const fade = useMotionValue(settings.reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!settings.reduceMotion) animate(fade, 1, { duration: 0.2, ease: 'easeOut' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = useCallback((flungDown = false) => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (settings.reduceMotion) {
      onClose();
      return;
    }
    if (flungDown) {
      animate(y, y.get() + window.innerHeight * 0.4, { duration: 0.24, ease: [0.32, 0.72, 0, 1] });
    }
    animate(fade, 0, { duration: 0.22, ease: 'easeOut' }).then(() => onClose());
  }, [settings.reduceMotion, onClose, y, fade]);

  const go = useCallback((dir: number) => {
    const next = index + dir;
    if (next >= 0 && next < items.length) onIndexChange(next);
  }, [index, items.length, onIndexChange]);

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, requestClose]);

  if (!item) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[300] select-none"
      style={{ touchAction: 'none', opacity: fade }}
    >
      {/* Backdrop — solid base + blurred copy of the image filling the
          letterbox (iOS Photos style). It dims as the image is dragged down,
          revealing the page behind, exactly like the Photos app. */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: backdropOpacity }}>
        <div className="absolute inset-0 bg-neutral-950" />
        <img
          key={`bg-${index}`}
          src={item.src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/70" />
      </motion.div>

      {/* Zoomable image — draggable down to dismiss while not zoomed. */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale: dragScale }}
        drag={zoomed ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.55 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) requestClose(true);
          else animate(y, 0, { type: 'spring', stiffness: 420, damping: 34 });
        }}
      >
        <TransformWrapper
          key={`zoom-${index}`}
          initialScale={1}
          minScale={1}
          maxScale={6}
          centerOnInit
          doubleClick={{ mode: 'zoomIn', step: 1.4 }}
          wheel={{ step: 0.12 }}
          pinch={{ step: 6 }}
          panning={{ disabled: !zoomed, velocityDisabled: true }}
          onTransform={(_ref, state) => setZoomed(state.scale > 1.02)}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            {/* The fit box leaves a small margin for the top counter and the
                caption panel. Kept tight so the image stays large and sits just
                above the caption — no dead gap between them. The keyed remount
                per photo re-runs the little spring, giving each image the
                Photos-app settle. */}
            <motion.div
              className="w-screen h-screen flex items-center justify-center px-3 pt-14 pb-24"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
            >
              <img
                src={item.src}
                alt={item.title}
                draggable={false}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </TransformComponent>
        </TransformWrapper>
      </motion.div>

      {/* Top bar: counter + close */}
      <motion.div style={{ opacity: chromeOpacity }} className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 safe-top pointer-events-none">
        <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium tabular-nums">
          {index + 1} / {items.length}
        </span>
        <button
          onClick={() => requestClose()}
          aria-label={t('common.close')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Navigation arrows + caption fade together with the drag */}
      <motion.div style={{ opacity: chromeOpacity }} className="absolute inset-0 z-10 pointer-events-none">
      {hasPrev && (
        <button
          onClick={() => go(-1)}
          aria-label={t('common.previous')}
          className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => go(1)}
          aria-label={t('common.next')}
          className="pointer-events-auto absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Caption panel — always visible, editorial. Letterspaced kind label
          over a serif name and italic Latin, category dots, and a Details
          action. Solid-enough scrim so it reads as a cohesive panel. */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 pt-20 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black via-black/85 to-transparent">
        <div className="max-w-3xl mx-auto flex items-end justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            {item.kind && (
              <p className="overline-label !text-white/55 mb-2">{item.kind}</p>
            )}
            <h3 className="font-heading text-[1.6rem] leading-[1.1] sm:text-3xl font-semibold text-white">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-white/65 text-sm sm:text-base italic mt-1.5 truncate">
                {item.subtitle}
              </p>
            )}
            {item.badges && item.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {item.badges.map((cat) => (
                  <CategoryBadge key={cat} category={cat} onDark />
                ))}
              </div>
            )}
          </div>

          {onOpenDetail && (
            <button
              onClick={() => onOpenDetail(index)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 pl-4 pr-3.5 py-2.5 rounded-full bg-white text-ink text-sm font-semibold hover:bg-white/90 transition-colors motion-safe:active:scale-[0.97]"
            >
              {t('plant.details')}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
