import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PlantCard from './PlantCard';
import PhotoViewer from './PhotoViewer';

import { Plant } from "../../types";
export default function GalleryGrid({ plants }: { plants: Plant[] }) {
  const { i18n } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef(null);

  const handleOpen = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNavigate = useCallback((direction: number) => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      const next = prev + direction;
      if (next < 0 || next >= plants.length) return prev;
      return next;
    });
  }, [plants.length]);

  return (
    <>
      <div ref={gridRef} className="gallery-grid">
        {plants.map((plant, index) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            index={index}
            lang={i18n.language}
            onClick={() => handleOpen(index)}
          />
        ))}
      </div>

      {/* Full-screen Photo Viewer */}
      {selectedIndex !== null && (
        <PhotoViewer
          plants={plants}
          currentIndex={selectedIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
          lang={i18n.language}
        />
      )}
    </>
  );
}
