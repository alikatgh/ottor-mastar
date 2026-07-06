import { useState, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PlantCard from './PlantCard';
import type { ViewerItem } from '../common/ImageViewer';
import { getImagePath } from '../../data/plants';
import { useSettings } from '../../context/SettingsContext';
import { Plant, Language } from '../../types';

// The zoom viewer (and its react-zoom-pan-pinch dependency) only loads the
// first time a photo is opened — it has no business in the initial bundle.
const ImageViewer = lazy(() => import('../common/ImageViewer'));

export default function GalleryGrid({ plants }: { plants: Plant[] }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as Language;
  const { settings } = useSettings();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef(null);

  // Close the viewer whenever the collection changes (e.g. country switch):
  // otherwise `selectedIndex` can point past the new, shorter list and the
  // overlay renders nothing with no way to dismiss it (WEB-C02). `plants` is a
  // stable per-country reference, so this only fires on an actual change.
  useEffect(() => {
    setSelectedIndex(null);
  }, [plants]);

  const items: ViewerItem[] = useMemo(
    () =>
      plants.map((p) => ({
        src: getImagePath(p, 'full'),
        title: p.names[lang] || p.names.sah,
        subtitle: p.names.latin,
        badges: p.categories,
      })),
    [plants, lang]
  );

  return (
    <>
      <div ref={gridRef} className="gallery-grid">
        {plants.map((plant, index) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            index={index}
            lang={i18n.language}
            onClick={() =>
              settings.tileTap === 'detail'
                ? navigate(`/plant/${plant.slug}`)
                : setSelectedIndex(index)
            }
          />
        ))}
      </div>

      {/* Full-screen zoomable viewer */}
      {selectedIndex !== null && (
        <Suspense fallback={null}>
          <ImageViewer
            items={items}
            index={selectedIndex}
            onIndexChange={setSelectedIndex}
            onClose={() => setSelectedIndex(null)}
            onOpenDetail={(i) => {
              setSelectedIndex(null);
              navigate(`/plant/${plants[i].slug}`);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
