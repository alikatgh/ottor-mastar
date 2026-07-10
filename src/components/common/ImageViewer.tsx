import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ExternalLink } from 'lucide-react';
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
  /** Optional external link (the language-matched Wikipedia article). */
  href?: string;
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
 * Layout is responsive around the same zoom/drag core:
 * - Mobile: image fills the screen; an editorial caption panel floats at the
 *   bottom (name / Latin / badges / actions).
 * - Desktop (md+): a "museum placard" — the image sits in the left region and
 *   a metadata panel fills the space beside it (kind label, serif name, Latin,
 *   category badges, Wikipedia link, Details action, plate counter), so a
 *   portrait photo no longer floats in a sea of blurred backdrop.
 *
 * Interaction:
 * - Pinch, double-tap, and wheel zoom + drag-to-pan (react-zoom-pan-pinch).
 * - Springy scale-up on open; swipe DOWN (when not zoomed) drags the image
 *   with the finger while the backdrop and chrome fade — release past the
 *   threshold to dismiss, otherwise it springs back. Close/Esc fade out.
 * - A blurred copy of the image fills the letterbox instead of black bars
 *   (iOS Photos style), so portrait shots don't leave a narrow image in a
 *   sea of black.
 */
export default function ImageViewer({ items, index, onIndexChange, onClose, onOpenDetail }: ImageViewerProps) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  // While zoomed in, vertical drags belong to pan — dismiss is scale-1 only.
  const [zoomed, setZoomed] = useState(false);
  const closingRef = useRef(false);
  // Guards animate().then(onClose) against firing after unmount.
  const mountedRef = useRef(true);
  // a11y: close button gets focus on open; restore to the opener on close.
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

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

  // Track mount so a deferred close never calls onClose after unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
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
    animate(fade, 0, { duration: 0.22, ease: 'easeOut' }).then(() => {
      if (mountedRef.current) onClose();
    });
  }, [settings.reduceMotion, onClose, y, fade]);

  const go = useCallback((dir: number) => {
    const next = index + dir;
    if (next >= 0 && next < items.length) onIndexChange(next);
  }, [index, items.length, onIndexChange]);

  // Nothing to show — dismiss on the next tick (effect, not during render).
  useEffect(() => {
    if (items.length === 0) requestClose();
  }, [items.length, requestClose]);

  // A new photo starts un-zoomed; keeps the swipe-down dismiss enabled.
  useEffect(() => {
    setZoomed(false);
  }, [index]);

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // a11y: focus the close button on open, restore focus to the opener on close.
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => { openerRef.current?.focus?.(); };
  }, []);

  // Keyboard: Esc closes, arrows navigate (only while not zoomed so they
  // don't fight pan), Tab is trapped within the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { requestClose(); return; }
      if (e.key === 'ArrowLeft') { if (!zoomed) go(-1); return; }
      if (e.key === 'ArrowRight') { if (!zoomed) go(1); return; }
      if (e.key === 'Tab') {
        const root = overlayRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) { e.preventDefault(); last.focus(); }
        } else {
          if (active === last || !root.contains(active)) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, requestClose, zoomed]);

  if (!item) return null;

  const counter = `${index + 1} / ${items.length}`;

  return createPortal(
    <motion.div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
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
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/70" />
      </motion.div>

      {/* Content: image region (+ desktop museum-placard panel). */}
      <div className="absolute inset-0 flex flex-col md:flex-row">
        {/* Image region — holds the zoom/drag machinery. min-* so the flex
            child can shrink and object-contain has a bounded box. */}
        <div className="relative flex-1 min-h-0 min-w-0">
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
                {/* Fit box. Mobile reserves room for the top counter and the
                    floating caption; desktop reserves only the top bar since
                    the metadata lives in the placard panel. The keyed remount
                    per photo re-runs the little spring — the Photos-app settle. */}
                <motion.div
                  className="w-full h-full flex items-center justify-center px-3 pt-14 pb-28 md:px-8 lg:px-12 md:pt-16 md:pb-10"
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    draggable={false}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </TransformComponent>
            </TransformWrapper>
          </motion.div>

          {/* Navigation arrows — inside the image region, so on desktop the
              right arrow sits at the image/panel boundary rather than under
              the panel; on mobile they hug the screen edges. */}
          <motion.div style={{ opacity: chromeOpacity }} className="absolute inset-0 z-10 pointer-events-none">
            {hasPrev && (
              <button
                onClick={() => go(-1)}
                aria-label={t('common.previous')}
                className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => go(1)}
                aria-label={t('common.next')}
                className="pointer-events-auto absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Museum-placard panel (desktop only). A frosted dark column filling
            the space beside the image with the specimen's editorial metadata. */}
        <aside className="hidden md:flex md:flex-col md:justify-center shrink-0 w-[340px] lg:w-[400px] h-full border-l border-white/10 bg-neutral-950/55 backdrop-blur-2xl px-8 lg:px-10 py-16 overflow-y-auto">
          {item.kind && <p className="overline-label !text-white/50">{item.kind}</p>}
          <h2 className="font-heading font-semibold text-white leading-[1.06] mt-3 text-[2rem] lg:text-[2.6rem]">
            {item.title}
          </h2>
          {item.subtitle && (
            <p className="text-white/60 italic mt-2 text-lg">{item.subtitle}</p>
          )}
          {item.badges && item.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {item.badges.map((cat) => (
                <CategoryBadge key={cat} category={cat} onDark />
              ))}
            </div>
          )}

          {(item.href || onOpenDetail) && (
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-2.5">
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 no-underline hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-white/70 shrink-0" strokeWidth={1.9} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">{t('plant.readOnWikipedia')}</span>
                    <span className="block text-xs text-white/45 truncate tabular-nums">
                      {i18n.language}.wikipedia.org
                    </span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/40 shrink-0" />
                </a>
              )}
              {onOpenDetail && (
                <button
                  onClick={() => onOpenDetail(index)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white text-[#201E19] text-sm font-semibold hover:bg-white/90 transition-colors motion-safe:active:scale-[0.98]"
                >
                  {t('plant.details')}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <p className="mt-8 text-white/35 text-xs tabular-nums tracking-[0.15em]">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </p>
        </aside>
      </div>

      {/* Top bar: counter (mobile only — the placard carries it on desktop)
          and close (always). */}
      <motion.div style={{ opacity: chromeOpacity }} className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 safe-top pointer-events-none">
        <span className="md:hidden px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium tabular-nums">
          {counter}
        </span>
        <span aria-hidden className="hidden md:block" />
        <button
          ref={closeButtonRef}
          onClick={() => requestClose()}
          aria-label={t('common.close')}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Mobile caption panel — always visible, editorial. Hidden on desktop,
          where the placard takes over. */}
      <motion.div style={{ opacity: chromeOpacity }} className="md:hidden absolute inset-x-0 bottom-0 z-10 pointer-events-none">
        <div className="pointer-events-auto pt-20 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black via-black/85 to-transparent">
          <div className="max-w-3xl mx-auto flex items-end justify-between gap-4">
            <div className="min-w-0">
              {item.kind && (
                <p className="overline-label !text-white/55 mb-2">{item.kind}</p>
              )}
              <h2 className="font-heading text-[1.6rem] leading-[1.1] font-semibold text-white">
                {item.title}
              </h2>
              {item.subtitle && (
                <p className="text-white/65 text-sm italic mt-1.5 truncate">{item.subtitle}</p>
              )}
              {item.badges && item.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {item.badges.map((cat) => (
                    <CategoryBadge key={cat} category={cat} onDark />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('plant.readOnWikipedia')}
                  className="w-11 h-11 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-white" strokeWidth={1.9} />
                </a>
              )}
              {/* Fixed near-black, not text-ink: the viewer is always a dark
                  surface and dark-theme --color-ink is near-white. */}
              {onOpenDetail && (
                <button
                  onClick={() => onOpenDetail(index)}
                  className="inline-flex items-center gap-1.5 pl-4 pr-3.5 py-2.5 rounded-full bg-white text-[#201E19] text-sm font-semibold hover:bg-white/90 transition-colors motion-safe:active:scale-[0.97]"
                >
                  {t('plant.details')}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
