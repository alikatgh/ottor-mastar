import { useTranslation } from 'react-i18next';

const CATEGORY_STYLES = {
  medicinal: 'badge-medicinal',
  edible: 'badge-edible',
  ornamental: 'badge-ornamental',
  poisonous: 'badge-poisonous',
};

const CATEGORY_ICONS = {
  medicinal: '💚',
  edible: '🍃',
  ornamental: '🌸',
  poisonous: '⚠️',
};

export default function CategoryBadge({ category }: { category: string }) {
  const { t } = useTranslation();

  return (
    <span className={`badge ${CATEGORY_STYLES[category] || ''}`}>
      <span>{CATEGORY_ICONS[category]}</span>
      {t(`categories.${category}`)}
    </span>
  );
}
