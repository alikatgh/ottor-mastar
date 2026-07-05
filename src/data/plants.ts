/**
 * Ottor Mastar — Plant Catalog Data
 *
 * Each plant includes:
 * - Trilingual names (Yakut/Sakha, Russian, English) + Latin botanical name
 * - Trilingual descriptions
 * - Medicinal uses
 * - Habitat & blooming season
 * - Photo file references
 *
 * Image filenames are shortened aliases mapped from the original WhatsApp filenames.
 */

export const CATEGORIES = {
  MEDICINAL: 'medicinal',
  EDIBLE: 'edible',
  ORNAMENTAL: 'ornamental',
  POISONOUS: 'poisonous',
};

export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
};

/**
 * Mapping from original filenames to clean slugs for optimized images.
 * After image optimization, files will be at /plants/{slug}.webp
 */
export const IMAGE_MAP: Record<string, string> = {
  'plant-01': 'WhatsApp Image 2026-07-04 at 12.36.22.jpeg',
  'plant-02': 'WhatsApp Image 2026-07-04 at 12.36.23.jpeg',
  'plant-03': 'WhatsApp Image 2026-07-04 at 12.36.26 (1).jpeg',
  'plant-04': 'WhatsApp Image 2026-07-04 at 12.36.26.jpeg',
  'plant-05': 'WhatsApp Image 2026-07-04 at 12.36.27.jpeg',
  'plant-06': 'WhatsApp Image 2026-07-04 at 12.36.29.jpeg',
  'plant-07': 'WhatsApp Image 2026-07-04 at 12.36.29 (1).jpeg',
  'plant-08': 'WhatsApp Image 2026-07-04 at 12.36.30.jpeg',
  'plant-09': 'WhatsApp Image 2026-07-04 at 12.36.31.jpeg',
  'plant-10': 'WhatsApp Image 2026-07-04 at 12.36.32.jpeg',
  'plant-11': 'WhatsApp Image 2026-07-04 at 12.36.32 (1).jpeg',
  'plant-12': 'WhatsApp Image 2026-07-04 at 12.36.32 (2).jpeg',
  'plant-13': 'WhatsApp Image 2026-07-04 at 12.36.33.jpeg',
  'plant-14': 'WhatsApp Image 2026-07-04 at 12.36.33 (1).jpeg',
  'plant-15': 'WhatsApp Image 2026-07-04 at 12.36.33 (2).jpeg',
  'plant-16': 'WhatsApp Image 2026-07-04 at 12.36.34.jpeg',
  'plant-17': 'WhatsApp Image 2026-07-04 at 12.36.35.jpeg',
  'plant-18': 'WhatsApp Image 2026-07-04 at 12.36.36.jpeg',
  'plant-19': 'WhatsApp Image 2026-07-04 at 12.36.36 (1).jpeg',
  'plant-20': 'WhatsApp Image 2026-07-04 at 12.36.36 (2).jpeg',
  'plant-21': 'WhatsApp Image 2026-07-04 at 12.36.37.jpeg',
  'plant-22': 'WhatsApp Image 2026-07-04 at 12.36.37 (1).jpeg',
  'plant-23': 'WhatsApp Image 2026-07-04 at 12.36.38.jpeg',
};

import { Plant } from '../types';

export const plants: Plant[] = [
  {
    id: 'yarrow',
    slug: 'yarrow',
    imageId: 'plant-01',
    names: {
      sah: 'Күөрэгэй ото',
      ru: 'Тысячелистник обыкновенный',
      en: 'Common Yarrow',
      latin: 'Achillea millefolium',
    },
    description: {
      sah: 'Үрдүк кыыл үүнээйи, күөх сибэккилээх. Саха сирин алааһыгар, хонуутугар үүнэр.',
      ru: 'Многолетнее травянистое растение с мелкими белыми цветками, собранными в щитковидные соцветия. Широко распространено на лугах Якутии.',
      en: 'A perennial herb with small white flowers in flat-topped clusters. Widely distributed across Yakutian meadows.',
    },
    medicinalUses: {
      sah: 'Саха эмчитэ хаан тохтотууга, истиигэ, тымныыга туттар.',
      ru: 'Применяется при кровотечениях, воспалениях, простудных заболеваниях. Настой используют для улучшения пищеварения.',
      en: 'Used for bleeding, inflammation, and colds. Infusion aids digestion.',
    },
    habitat: {
      sah: 'Алааһа, хонуу, суол кытыла',
      ru: 'Луга, поляны, обочины дорог',
      en: 'Meadows, clearings, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFFFFF',
  },
  {
    id: 'flax',
    slug: 'flax',
    imageId: 'plant-02',
    names: {
      sah: 'Кыһыл көмүс сибэкки',
      ru: 'Лён сибирский',
      en: 'Siberian Flax',
      latin: 'Linum sibiricum',
    },
    description: {
      sah: 'Чэмэр көк сибэккилээх кыыл үүнээйи. Күн сирдээх сиргэ үүнэр.',
      ru: 'Нежное растение с голубыми цветками. Растёт на солнечных лугах и склонах.',
      en: 'A delicate plant with pale blue flowers. Grows on sunny meadows and slopes.',
    },
    medicinalUses: {
      sah: 'Урбааһын уһуктуурга, тириигэ наар.',
      ru: 'Семена используют как обволакивающее средство при заболеваниях ЖКТ.',
      en: 'Seeds used as a soothing agent for digestive issues.',
    },
    habitat: {
      sah: 'Күн сирдээх хонуу, тиит тыа кыра',
      ru: 'Солнечные луга, разреженные леса',
      en: 'Sunny meadows, open forests',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.ORNAMENTAL],
    color: '#B0C4DE',
  },
  {
    id: 'bedstraw',
    slug: 'bedstraw',
    imageId: 'plant-03',
    names: {
      sah: 'Сарыбай от',
      ru: 'Подмаренник настоящий',
      en: "Lady's Bedstraw",
      latin: 'Galium verum',
    },
    description: {
      sah: 'Саһархай сибэккилээх, хонууга ыаллаата тарбахтыыр.',
      ru: 'Многолетник с ярко-жёлтыми мелкими цветками, собранными в густые метёлки. Издаёт медовый аромат.',
      en: 'A perennial with bright yellow tiny flowers in dense panicles. Emits a honey-like fragrance.',
    },
    medicinalUses: {
      sah: 'Тириини эмтиирэ, истиигэ туттар.',
      ru: 'Используют при кожных заболеваниях, как мочегонное и противовоспалительное средство.',
      en: 'Used for skin conditions, as a diuretic and anti-inflammatory.',
    },
    habitat: {
      sah: 'Хонуу, алааһа, куоратка да',
      ru: 'Луга, поляны, пустыри',
      en: 'Meadows, clearings, wastelands',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFD700',
  },
  {
    id: 'bellflower-clustered',
    slug: 'bellflower-clustered',
    imageId: 'plant-04',
    names: {
      sah: 'Кулуоскай сибэкки',
      ru: 'Колокольчик скученный',
      en: 'Clustered Bellflower',
      latin: 'Campanula glomerata',
    },
    description: {
      sah: 'Күөх-кыһыл сибэккилээх, тобулаах. Саха хонуутугар элбэхтик көстөр.',
      ru: 'Многолетнее растение с тёмно-фиолетовыми цветками, собранными в плотные головчатые соцветия.',
      en: 'A perennial with deep purple flowers clustered in dense heads atop the stem.',
    },
    medicinalUses: {
      sah: 'Тымныыга, сыыһыга туттар.',
      ru: 'Народное средство при простуде и головной боли.',
      en: 'Folk remedy for colds and headaches.',
    },
    habitat: {
      sah: 'Хонуу, тыа кыра',
      ru: 'Луга, лесные опушки',
      en: 'Meadows, forest edges',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.MEDICINAL],
    color: '#7B2D8E',
  },
  {
    id: 'bellflower-deep',
    slug: 'bellflower-deep',
    imageId: 'plant-05',
    names: {
      sah: 'Кулуоскай (күөх)',
      ru: 'Колокольчик скученный (тёмный)',
      en: 'Dark Clustered Bellflower',
      latin: 'Campanula glomerata',
    },
    description: {
      sah: 'Кулуоскай сибэккинин салгыныы бэйэтэ, элбэх сибэккилээх.',
      ru: 'Тот же вид колокольчика скученного, но с более густыми и тёмными соцветиями.',
      en: 'Same species of clustered bellflower, with denser and darker flower heads.',
    },
    medicinalUses: {
      sah: 'Тымныыга эмнэр от.',
      ru: 'Применяют как противовоспалительное средство.',
      en: 'Used as an anti-inflammatory remedy.',
    },
    habitat: {
      sah: 'Хонуу, алааһа',
      ru: 'Луга, поляны',
      en: 'Meadows, clearings',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#5B2C6F',
  },
  {
    id: 'speedwell',
    slug: 'speedwell',
    imageId: 'plant-06',
    names: {
      sah: 'Куобах тыллаах от',
      ru: 'Вероника длиннолистная',
      en: 'Long-leaved Speedwell',
      latin: 'Veronica longifolia',
    },
    description: {
      sah: 'Уһун кыһыл-көк сибэккилээх, үрдүк кыыл от. Хонууга чэпчэкитик үүнэр.',
      ru: 'Высокое многолетнее растение с длинными кистями сине-фиолетовых цветков.',
      en: 'A tall perennial with long racemes of blue-violet flowers.',
    },
    medicinalUses: {
      sah: 'Тымныы-сыыһа тохтотуу, иһин ыарыыта.',
      ru: 'Применяют при заболеваниях дыхательных путей и желудочно-кишечного тракта.',
      en: 'Used for respiratory and digestive ailments.',
    },
    habitat: {
      sah: 'Ыллыктаах хонуу, ситим кытыла',
      ru: 'Влажные луга, берега рек',
      en: 'Wet meadows, riverbanks',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.ORNAMENTAL],
    color: '#6A5ACD',
  },
  {
    id: 'wildflower-meadow',
    slug: 'wildflower-meadow',
    imageId: 'plant-07',
    names: {
      sah: 'Саха хонуутун сибэккилэрэ',
      ru: 'Разнотравный луг',
      en: 'Yakutian Wildflower Meadow',
      latin: 'Pratum mixtum',
    },
    description: {
      sah: 'Саха сирин чэмэр хонууларын көрүҥэ — сибэкки араас өҥнөөх, оттор булкуйан үүнэр.',
      ru: 'Типичная картина якутского разнотравного луга — смесь льна, клевера, колокольчиков и других полевых цветов.',
      en: 'A quintessential Yakutian wildflower meadow with flax, clover, bellflowers, and other wild blooms.',
    },
    medicinalUses: {
      sah: 'Элбэх эм оттор биир сиргэ.',
      ru: 'Сочетание множества лекарственных трав в одном месте.',
      en: 'A natural pharmacy — many medicinal herbs growing together.',
    },
    habitat: {
      sah: 'Алааһа, хонуу',
      ru: 'Открытые луга и поляны',
      en: 'Open meadows and clearings',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#90EE90',
  },
  {
    id: 'buttercup',
    slug: 'buttercup',
    imageId: 'plant-08',
    names: {
      sah: 'Күөх алтан от',
      ru: 'Лютик едкий',
      en: 'Meadow Buttercup',
      latin: 'Ranunculus acris',
    },
    description: {
      sah: 'Сарыбай кыратай сибэккилээх, хонууга элбэх.',
      ru: 'Многолетнее растение с мелкими ярко-жёлтыми глянцевыми цветками. Очень распространён на лугах.',
      en: 'A perennial with small, bright yellow glossy flowers. Very common in meadows.',
    },
    medicinalUses: {
      sah: 'Аһааьыга сатаммат — ахтыылаах! Тас эмнэр эмтиирэ гынарга туттуллар.',
      ru: 'Ядовит! Наружно применяют при болях в суставах и ревматизме.',
      en: 'Poisonous! Externally used for joint pain and rheumatism.',
    },
    habitat: {
      sah: 'Хонуу, алааһа, ыллыктаах сир',
      ru: 'Луга, поляны, влажные места',
      en: 'Meadows, clearings, wet areas',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.POISONOUS],
    color: '#FFD700',
  },
  {
    id: 'anemone',
    slug: 'anemone',
    imageId: 'plant-09',
    names: {
      sah: 'Тыал сибэккитэ',
      ru: 'Ветреница лесная',
      en: 'Snowdrop Anemone',
      latin: 'Anemone sylvestris',
    },
    description: {
      sah: 'Чэмэр үрүҥ сибэккилээх, тыа кыраларыгар үүнэр.',
      ru: 'Нежное растение с белыми пятилепестковыми цветками. Растёт на лесных опушках и полянах.',
      en: 'A graceful plant with white five-petaled flowers. Grows on forest edges and clearings.',
    },
    medicinalUses: {
      sah: 'Саха народнай эмтиирэ — көрүҥэ сылдьарга, бас ыарыытыгар.',
      ru: 'В народной медицине — при головных болях и нарушениях зрения. Растение ядовито, применять осторожно.',
      en: 'In folk medicine — for headaches and vision issues. Plant is toxic, use with care.',
    },
    habitat: {
      sah: 'Тыа кыра, алааһа',
      ru: 'Лесные опушки, поляны',
      en: 'Forest edges, clearings',
    },
    bloomingSeason: 'may-june',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.POISONOUS],
    color: '#FFFFFF',
  },
  {
    id: 'filipendula',
    slug: 'filipendula',
    imageId: 'plant-10',
    names: {
      sah: 'Таба тыытыга',
      ru: 'Лабазник вязолистный',
      en: 'Meadowsweet',
      latin: 'Filipendula ulmaria',
    },
    description: {
      sah: 'Ыраас хаҥырааттаах, кыһыл-үрүҥ түөлбэ сибэккилээх ордук от.',
      ru: 'Высокое растение с пушистыми розовыми соцветиями и характерным сладким ароматом.',
      en: 'A tall plant with fluffy pink flower clusters and a distinctive sweet fragrance.',
    },
    medicinalUses: {
      sah: 'Бас ыарыытыгар, истиигэ — аспирин курдук.',
      ru: 'Природный аспирин — содержит салициловую кислоту. Применяют при головной боли, воспалениях, простуде.',
      en: "Nature's aspirin — contains salicylic acid. Used for headaches, inflammation, and colds.",
    },
    habitat: {
      sah: 'Ыллыктаах хонуу, ситим кытыла',
      ru: 'Влажные луга, берега рек и ручьёв',
      en: 'Wet meadows, riverbanks and stream sides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFB6C1',
  },
  {
    id: 'vetch',
    slug: 'vetch',
    imageId: 'plant-11',
    names: {
      sah: 'Кулумах от',
      ru: 'Горошек мышиный',
      en: 'Tufted Vetch',
      latin: 'Vicia cracca',
    },
    description: {
      sah: 'Кыһыл-күөх кыратай сибэккилээх, муннукка суулалыыр от.',
      ru: 'Вьющееся растение с мелкими фиолетовыми цветками, цепляющееся усиками за соседние травы.',
      en: 'A climbing plant with small purple flowers, clinging to neighboring plants with tendrils.',
    },
    medicinalUses: {
      sah: 'Тириини этиирэ, хаан тохтотуу.',
      ru: 'Применяют как ранозаживляющее и кровоостанавливающее средство.',
      en: 'Used for wound healing and to stop bleeding.',
    },
    habitat: {
      sah: 'Хонуу, суол кытыла',
      ru: 'Луга, обочины дорог',
      en: 'Meadows, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#9370DB',
  },
  {
    id: 'chamomile',
    slug: 'chamomile',
    imageId: 'plant-12',
    names: {
      sah: 'Поповник от',
      ru: 'Ромашка (нивяник обыкновенный)',
      en: 'Oxeye Daisy',
      latin: 'Leucanthemum vulgare',
    },
    description: {
      sah: 'Үрүҥ сибэккилээх, хонуу уонна алааһа сибэккитэ.',
      ru: 'Многолетник с характерными белыми «ромашковыми» цветками и жёлтой серединкой.',
      en: 'A perennial with classic white daisy-like flowers and yellow centers.',
    },
    medicinalUses: {
      sah: 'Көмүс сибэккитэ — истиигэ, иһин ыарыытыгар.',
      ru: 'Применяют при воспалениях, как успокаивающее и противовоспалительное средство.',
      en: 'Used for inflammation, as a calming and anti-inflammatory agent.',
    },
    habitat: {
      sah: 'Хонуу, алааһа, суол кытыла',
      ru: 'Луга, поляны, обочины',
      en: 'Meadows, clearings, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.ORNAMENTAL],
    color: '#FFFFFF',
  },
  {
    id: 'aconite',
    slug: 'aconite',
    imageId: 'plant-13',
    names: {
      sah: 'Үөр ото',
      ru: 'Живокость высокая',
      en: 'Tall Larkspur',
      latin: 'Delphinium elatum',
    },
    description: {
      sah: 'Күөх-кыһыл сибэккилээх, үрдүк кыыл от.',
      ru: 'Высокое растение с яркими сине-фиолетовыми цветками на длинном стебле.',
      en: 'A tall plant with vivid blue-purple flowers on a long stem.',
    },
    medicinalUses: {
      sah: 'Ахтыылаах! Дьиэ оҕотугар-харыстаа.',
      ru: 'Ядовитое растение! В народной медицине применяли наружно при паразитарных заболеваниях.',
      en: 'Poisonous! In folk medicine, used externally for parasitic conditions.',
    },
    habitat: {
      sah: 'Тыа кыра, алааһа, ыллыктаах хонуу',
      ru: 'Лесные опушки, поляны, влажные луга',
      en: 'Forest edges, clearings, wet meadows',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.POISONOUS],
    color: '#4169E1',
  },
  {
    id: 'lupine',
    slug: 'lupine',
    imageId: 'plant-14',
    names: {
      sah: 'Чыычаах тырыыта',
      ru: 'Люпин многолистный',
      en: 'Wild Lupine',
      latin: 'Lupinus polyphyllus',
    },
    description: {
      sah: 'Хара-көк сибэккилээх, сабарай тиистээх сэбирдэхтээх.',
      ru: 'Растение с пальчатыми листьями и кистями синих цветков.',
      en: 'A plant with palmate leaves and spikes of blue flowers.',
    },
    medicinalUses: {
      sah: 'Сирэйи байытар, азооттаах.',
      ru: 'Обогащает почву азотом. В лечебных целях используется ограниченно.',
      en: 'Enriches soil with nitrogen. Limited medicinal use.',
    },
    habitat: {
      sah: 'Хонуу, суол кытыла',
      ru: 'Луга, обочины, склоны',
      en: 'Meadows, roadsides, slopes',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#483D8B',
  },
  {
    id: 'carnation',
    slug: 'carnation',
    imageId: 'plant-15',
    names: {
      sah: 'Кыыл гвоздика',
      ru: 'Гвоздика травянка',
      en: 'Maiden Pink',
      latin: 'Dianthus deltoides',
    },
    description: {
      sah: 'Кыратай кыһыл сибэккилээх, чэмэр хаастаах.',
      ru: 'Невысокое растение с яркими малиновыми одиночными цветками.',
      en: 'A low-growing plant with bright magenta solitary flowers.',
    },
    medicinalUses: {
      sah: 'Хаан тохтотуу, иһин ыарыытыгар.',
      ru: 'Применяют при маточных кровотечениях и болях в животе.',
      en: 'Used for uterine bleeding and abdominal pain.',
    },
    habitat: {
      sah: 'Кураанах хонуу, тыа кыра',
      ru: 'Сухие луга, опушки',
      en: 'Dry meadows, forest edges',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.ORNAMENTAL],
    color: '#FF1493',
  },
  {
    id: 'geranium-pratense',
    slug: 'geranium-pratense',
    imageId: 'plant-16',
    names: {
      sah: 'Кытыылыкай',
      ru: 'Герань луговая',
      en: 'Meadow Cranesbill',
      latin: 'Geranium pratense',
    },
    description: {
      sah: 'Улахан күөх-кыһыл сибэккилээх, кыыл от.',
      ru: 'Многолетник с крупными сине-фиолетовыми цветками и пальчато-рассечёнными листьями.',
      en: 'A perennial with large blue-violet flowers and deeply divided palmate leaves.',
    },
    medicinalUses: {
      sah: 'Хаан тохтотуу, диарея, тириини этиирэ.',
      ru: 'Кровоостанавливающее, вяжущее средство. Применяют при диарее и ранах.',
      en: 'Hemostatic and astringent. Used for diarrhea and wound healing.',
    },
    habitat: {
      sah: 'Хонуу, тыа кыра, суол кытыла',
      ru: 'Луга, опушки, обочины',
      en: 'Meadows, forest edges, roadsides',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.ORNAMENTAL],
    color: '#6A5ACD',
  },
  {
    id: 'wild-strawberry',
    slug: 'wild-strawberry',
    imageId: 'plant-17',
    names: {
      sah: 'Дьэдьэн',
      ru: 'Земляника лесная',
      en: 'Wild Strawberry',
      latin: 'Fragaria vesca',
    },
    description: {
      sah: 'Чэмэр үрүҥ сибэккилээх, аһыыр эмтиитиннээх. Дьэдьэнэ бэрт тааттаах.',
      ru: 'Невысокое растение с белыми цветками и мелкими ароматными ягодами. Одна из любимых ягод якутян.',
      en: 'A low plant with white flowers and small fragrant berries. One of the favorite berries in Yakutia.',
    },
    medicinalUses: {
      sah: 'Чэйгэ хаттарар — витамин элбэх. Сэбирдэхтэрэ иһин ыарыытыгар наар.',
      ru: 'Чай из листьев богат витаминами. Ягоды и листья применяют при авитаминозе и проблемах ЖКТ.',
      en: 'Leaf tea is rich in vitamins. Berries and leaves used for vitamin deficiency and digestive issues.',
    },
    habitat: {
      sah: 'Тыа, тыа кыра, алааһа',
      ru: 'Леса, опушки, поляны',
      en: 'Forests, forest edges, clearings',
    },
    bloomingSeason: 'may-june',
    categories: [CATEGORIES.EDIBLE, CATEGORIES.MEDICINAL],
    color: '#FFFFFF',
  },
  {
    id: 'vetch-pea',
    slug: 'vetch-pea',
    imageId: 'plant-18',
    names: {
      sah: 'Чэмэр кулумах',
      ru: 'Чина луговая',
      en: 'Meadow Vetchling',
      latin: 'Lathyrus pratensis',
    },
    description: {
      sah: 'Кыһыл-саһархай сибэккилээх, суулалыыр от.',
      ru: 'Вьющееся многолетнее растение с ярко-фиолетовыми цветками.',
      en: 'A climbing perennial with bright purple-pink flowers.',
    },
    medicinalUses: {
      sah: 'Тымныыга, сүөһүнү куттар.',
      ru: 'Применяют при простуде и как отхаркивающее средство.',
      en: 'Used for colds and as an expectorant.',
    },
    habitat: {
      sah: 'Хонуу, тыа кыра',
      ru: 'Луга, лесные опушки',
      en: 'Meadows, forest edges',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#DA70D6',
  },
  {
    id: 'astragalus',
    slug: 'astragalus',
    imageId: 'plant-19',
    names: {
      sah: 'Тэбиэн от',
      ru: 'Остролодочник якутский',
      en: 'Yakut Oxytropis',
      latin: 'Oxytropis jacutica',
    },
    description: {
      sah: 'Кыһыл-кыраһа сибэккилээх, сабарай сэбирдэхтээх кыыл от.',
      ru: 'Многолетнее растение с розово-фиолетовыми цветками и перистыми листьями. Эндемик Якутии.',
      en: 'A perennial with pink-purple flowers and pinnate leaves. Endemic to Yakutia.',
    },
    medicinalUses: {
      sah: 'Саха эмтиирэтигэр — күүс бэриирэ, чэйин иһэргэ.',
      ru: 'В традиционной медицине — тонизирующее средство.',
      en: 'In traditional medicine — used as a tonic.',
    },
    habitat: {
      sah: 'Кураанах хонуу, тас сирдэр',
      ru: 'Сухие луга, открытые склоны',
      en: 'Dry meadows, open slopes',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#BA55D3',
  },
  {
    id: 'ranunculus',
    slug: 'ranunculus',
    imageId: 'plant-20',
    names: {
      sah: 'Алтан от',
      ru: 'Лютик золотистый',
      en: 'Goldilocks Buttercup',
      latin: 'Ranunculus auricomus',
    },
    description: {
      sah: 'Сарыбай улахан сибэккилээх, тобулу-тобулу үүнэр.',
      ru: 'Многолетник с яркими золотисто-жёлтыми цветками. Часто встречается среди разнотравья.',
      en: 'A perennial with bright golden-yellow flowers, commonly found among mixed grasses.',
    },
    medicinalUses: {
      sah: 'Ахтыылаах — тас туттуу эрэ!',
      ru: 'Ядовит! Наружно применяют при болях в суставах.',
      en: 'Poisonous! Externally used for joint pain.',
    },
    habitat: {
      sah: 'Хонуу, тыа кыра',
      ru: 'Луга, лесные опушки',
      en: 'Meadows, forest edges',
    },
    bloomingSeason: 'may-july',
    categories: [CATEGORIES.POISONOUS],
    color: '#FFD700',
  },
  {
    id: 'geranium-sibiricum',
    slug: 'geranium-sibiricum',
    imageId: 'plant-21',
    names: {
      sah: 'Сибиир кытыылыкайа',
      ru: 'Герань сибирская',
      en: 'Siberian Geranium',
      latin: 'Geranium sibiricum',
    },
    description: {
      sah: 'Кыратай кыһыл сибэккилээх, сэбирдэхтэрэ маннайгы гэрантан кыратыктар.',
      ru: 'Более мелкий вид герани с розовыми цветками и рассечёнными листьями.',
      en: 'A smaller geranium species with pink flowers and dissected leaves.',
    },
    medicinalUses: {
      sah: 'Диарея, иһин ыарыыта.',
      ru: 'Вяжущее средство при расстройствах кишечника.',
      en: 'Astringent for intestinal disorders.',
    },
    habitat: {
      sah: 'Тыа, тыа кыра',
      ru: 'Леса, опушки',
      en: 'Forests, forest edges',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFB6C1',
  },
  {
    id: 'valerian',
    slug: 'valerian',
    imageId: 'plant-22',
    names: {
      sah: 'Кэтэх от',
      ru: 'Валериана лекарственная',
      en: 'Valerian',
      latin: 'Valeriana officinalis',
    },
    description: {
      sah: 'Үрүҥ-кыһыл түөлбэ сибэккилээх, үрдүк от. Тамахтаах хаҥыраата бар.',
      ru: 'Высокое растение с зонтиковидными белыми соцветиями и характерным запахом корней.',
      en: 'A tall plant with umbrella-like white flower clusters and distinctively scented roots.',
    },
    medicinalUses: {
      sah: 'Доруобуйа — нэрвэни тупсарар, утуйарга. Эм сибэккитэ.',
      ru: 'Знаменитое успокаивающее средство. Корни применяют при бессоннице, нервозности, сердцебиении.',
      en: 'Famous sedative. Roots used for insomnia, anxiety, and heart palpitations.',
    },
    habitat: {
      sah: 'Ыллыктаах хонуу, ситим кытыла, тыа кыра',
      ru: 'Влажные луга, берега рек, опушки',
      en: 'Wet meadows, riverbanks, forest edges',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFFFFF',
  },
  {
    id: 'daylily',
    slug: 'daylily',
    imageId: 'plant-23',
    names: {
      sah: 'Сардаана',
      ru: 'Саранка (лилия кудреватая)',
      en: 'Siberian Lily',
      latin: 'Lilium pensylvanicum',
    },
    description: {
      sah: 'Саха сирин суолтатаах сибэккитэ — сардаана! Кыһыл-араҕас чэмэр сибэккилээх.',
      ru: 'Символ якутской природы — огненно-оранжевые лилии среди лиственничного леса. Одно из красивейших растений Якутии.',
      en: 'Symbol of Yakutian nature — fiery orange lilies among the larch forest. One of the most beautiful plants in Yakutia.',
    },
    medicinalUses: {
      sah: 'Тириини этиирэ, иһин ыарыытыгар. Бу сибэкки Саха Сиригэр харыстанар.',
      ru: 'Луковицы применяли при ранах и болезнях желудка. Растение охраняется в Якутии.',
      en: 'Bulbs were used for wounds and stomach ailments. The plant is protected in Yakutia.',
    },
    habitat: {
      sah: 'Тиит тыа, хонуу, алааһа',
      ru: 'Лиственничные леса, луга, поляны',
      en: 'Larch forests, meadows, clearings',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#FF6347',
  },
];

/**
 * Get the original image filename for a plant
 */
export function getOriginalImagePath(plant: Plant) {
  return IMAGE_MAP[plant.imageId];
}

/**
 * Get the optimized image path for a given plant and size
 * @param {object} plant - Plant object
 * @param {'thumb' | 'medium' | 'full'} size - Image size variant
 */
export function getImagePath(plant: Plant, size = 'medium') {
  return `/plants/${size}/${plant.imageId}.webp`;
}

/**
 * Get all plants in a specific category
 */
export function getPlantsByCategory(category: string) {
  return plants.filter((p) => p.categories.includes(category));
}

/**
 * Get a plant by slug
 */
export function getPlantBySlug(slug: string) {
  return plants.find((p) => p.slug === slug);
}

/**
 * Get plants sorted by name in a given language
 */
export function getPlantsSortedByName(lang: import('../types').Language = 'sah') {
  return [...plants].sort((a, b) =>
    a.names[lang].localeCompare(b.names[lang], lang)
  );
}
