import { useTranslation } from 'react-i18next';

const CATEGORY_STYLES: Record<string, string> = {
  medicinal: 'badge-medicinal',
  edible: 'badge-edible',
  ornamental: 'badge-ornamental',
  poisonous: 'badge-poisonous',
};

/**
 * Category chip: hairline border + 6px status dot.
 * Color carries the category as a small signal; the text stays ink.
 * `onDark` renders the white-outline variant for the full-screen viewer.
 */
export default function CategoryBadge({ category, onDark = false }: { category: string; onDark?: boolean }) {
  const { t } = useTranslation();

  return (
    <span className={`badge ${CATEGORY_STYLES[category] || ''} ${onDark ? 'badge-on-dark' : ''}`}>
      <span className="badge-dot" />
      {t(`categories.${category}`)}
    </span>
  );
}
