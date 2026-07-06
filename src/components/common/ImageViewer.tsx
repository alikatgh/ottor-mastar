import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryBadge from './CategoryBadge';

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
 * Full-screen image viewer with native-feel zoom.
 *
 * - Pinch, double-tap, and wheel zoom + drag-to-pan (react-zoom-pan-pinch).
 * - A blurred copy of the image fills the letterbox instead of black bars
 *   (iOS Photos style), so portrait shots don't leave a narrow image in a
 *   sea of black.
 * - The caption (name / latin / badges) is always visible and high-contrast.
 */
export default function ImageViewer({ items, index, onIndexChange, onClose, onOpenDetail }: ImageViewerProps) {
  const { t } = useTranslation();
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

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
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  if (!item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] bg-neutral-950 select-none" style={{ touchAction: 'none' }}>
      {/* Blurred fill so letterboxed images don't sit in harsh black bars */}
      <img
        key={`bg-${index}`}
        src={item.src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-40 pointer-events-none"
      />
      <div className="absolute inset-0 bg-neutral-950/40 pointer-events-none" />

      {/* Zoomable image */}
      <TransformWrapper
        key={`zoom-${index}`}
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit
        doubleClick={{ mode: 'zoomIn', step: 1.4 }}
        wheel={{ step: 0.12 }}
        pinch={{ step: 6 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          {/* The fit box reserves room for the top counter bar and the caption
              so the contained image fills the clear central zone — as large as
              possible while staying fully visible, never tucked under chrome. */}
          <div className="w-screen h-screen flex items-center justify-center px-3 pt-16 pb-40 sm:pb-32">
            <img
              src={item.src}
              alt={item.title}
              draggable={false}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Top bar: counter + close */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 safe-top pointer-events-none">
        <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium tabular-nums">
          {index + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => go(-1)}
          aria-label={t('common.previous')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => go(1)}
          aria-label={t('common.next')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Caption — always visible, editorial. Letterspaced kind label over a
          serif name and italic Latin, category dots, and a Details action. */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pt-24 pb-6 px-5 safe-bottom bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <div className="max-w-3xl mx-auto flex items-end justify-between gap-5">
          <div className="min-w-0">
            {item.kind && (
              <p className="overline-label !text-white/55 mb-1.5">{item.kind}</p>
            )}
            <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white leading-tight">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-white/70 text-sm sm:text-base italic mt-1 truncate">
                {item.subtitle}
              </p>
            )}
            {item.badges && item.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
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
    </div>,
    document.body
  );
}
