import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PlantCard from './PlantCard';
import ImageViewer, { ViewerItem } from '../common/ImageViewer';
import { getImagePath } from '../../data/plants';
import { Plant, Language } from '../../types';

export default function GalleryGrid({ plants }: { plants: Plant[] }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as Language;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef(null);

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
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* Full-screen zoomable viewer */}
      {selectedIndex !== null && (
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
      )}
    </>
  );
}
