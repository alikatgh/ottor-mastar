import { Plant } from '../types';
import { CATEGORIES } from './plants';
import { MONGOLIA_I18N } from './mongolia-translations';

/**
 * Mongolia dataset — plants photographed in Mongolia (city parks + steppe edge
 * near Ulaanbaatar). A mix of cultivated ornamentals and wild steppe natives.
 *
 * HOW THIS WAS BUILT / HOW TO EXTEND:
 * - Images: one best photo per species, optimized by `scripts/optimize-mongolia.cjs`
 *   into public/mongolia/{thumb,medium,full}/<imageId>.webp. Duplicate camera
 *   shots of the same plant were grouped to a single entry.
 * - To add more: drop the picks into the script's IMAGE_MAP, run it, then add a
 *   Plant entry here with the same imageId. Slugs must stay unique ACROSS
 *   countries (see findPlantBySlug in countries.ts).
 * - Botanical plates: the original AI-generated Mongolia plates depicted
 *   UNRELATED species (Salsola, Gentiana, Stipa…) with fabricated captions, so
 *   they were removed (see docs/audits/2026-07-06-illustration-species-audit.md).
 *   Only two Mongolia species also occur in Yakutia and reuse that collection's
 *   correct plate: yarrow (Achillea millefolium → mongolia-10-ill) and bedstraw
 *   (Galium verum → mongolia-07-ill). Every other Mongolia plant renders
 *   photo-only until a genuine, species-matched plate is added. hasIllustration()
 *   reads the manifest, so dropping a correct plate + `npm run optimize` lights
 *   it up — no edit here needed.
 *
 * The Mongolia option in Settings enables itself once this array is non-empty.
 *
 * `imageBase` is stamped onto every plant centrally in countries.ts (the single
 * choke point), so entries here omit it.
 *
 * Species IDs are best-effort from the photographs; the app-wide disclaimer and
 * the per-entry (?) note on medicinal uses apply.
 */
const RAW: Omit<Plant, 'imageBase'>[] = [
  {
    id: 'mn-marigold',
    slug: 'mn-marigold',
    imageId: 'mongolia-01',
    names: {
      sah: 'Бархаат сибэкки',
      ru: 'Бархатцы прямостоячие',
      en: 'African Marigold',
      latin: 'Tagetes erecta',
    },
    description: {
      sah: 'Улахан оранжевай-саһархай сибэккилээх киэргэл үүнээйи. Монголия куораттарын паркаларыгар киэҥник олордуллар.',
      ru: 'Декоративное однолетнее растение с крупными оранжево-жёлтыми махровыми соцветиями. Массово высаживается в парках и на клумбах городов Монголии.',
      en: 'An ornamental annual with large, ball-shaped orange-yellow blooms. Planted in great numbers in the parks and flowerbeds of Mongolian cities.',
    },
    medicinalUses: {
      sah: 'Норуот эмчитигэр өйдөбүлгэ киллэриллэр; сибэккитэ буһаҕаска сыаналанар. Сүрүннээн киэргэл туһугар олордуллар.',
      ru: 'В народной медицине настой цветков применяли при простуде и как противовоспалительное; выращивается главным образом как декоративное.',
      en: 'Folk use records the flowers as an anti-inflammatory and cold remedy; grown chiefly as an ornamental.',
    },
    habitat: {
      sah: 'Куорат парката, клумба, ааҕар сир',
      ru: 'Городские парки, клумбы, цветники',
      en: 'City parks, flowerbeds, planted borders',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#F5A623',
  },
  {
    id: 'mn-cornflower',
    slug: 'mn-cornflower',
    imageId: 'mongolia-02',
    names: {
      sah: 'Күөх туллук сибэкки',
      ru: 'Василёк синий',
      en: 'Cornflower',
      latin: 'Centaurea cyanus',
    },
    description: {
      sah: 'Чаҕылхай күөх сибэккилээх, нарын үүнээйи. Бааһынаҕа, суол кытыытыгар уонна клумбаҕа көстөр.',
      ru: 'Изящное растение с ярко-синими корзинками соцветий. Встречается на полях, обочинах и в цветниках.',
      en: 'A slender plant with vivid blue flower-heads. Found in fields, along roadsides, and in planted beds.',
    },
    medicinalUses: {
      sah: 'Сибэккитин настойун харах ыарыытыгар уонна сүөл ыарыытыгар туттар этилэр.',
      ru: 'Настой краевых цветков традиционно применяли при воспалениях глаз и как лёгкое мочегонное.',
      en: 'An infusion of the ray florets was traditionally used for eye inflammation and as a mild diuretic.',
    },
    habitat: {
      sah: 'Бааһына, хонуу, суол кытыла',
      ru: 'Поля, луга, обочины дорог',
      en: 'Fields, meadows, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#4A6FE3',
  },
  {
    id: 'mn-petunia',
    slug: 'mn-petunia',
    imageId: 'mongolia-03',
    gallery: ['mongolia-03-2', 'mongolia-03-3'],
    names: {
      sah: 'Петуния сибэкки',
      ru: 'Петуния',
      en: 'Petunia',
      latin: 'Petunia × atkinsiana',
    },
    description: {
      sah: 'Хонуор-күлүмүрдээх сибэккилээх киэргэл үүнээйи. Куорат клумбаларыгар, вазаларга элбэхтик олордуллар.',
      ru: 'Декоративное растение с крупными воронковидными цветками разных оттенков. Широко используется в городском озеленении.',
      en: 'An ornamental with large trumpet-shaped flowers in many colours. A mainstay of city planters and beds.',
    },
    medicinalUses: {
      sah: 'Эмкэ туттуллуута биллибэт — киэргэл эрэ туһугар олордуллар.',
      ru: 'Лекарственного применения не имеет — исключительно декоративное растение.',
      en: 'No medicinal use — grown purely as an ornamental.',
    },
    habitat: {
      sah: 'Куорат клумбата, вазалар',
      ru: 'Городские клумбы, кашпо',
      en: 'City flowerbeds and containers',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#7E57C2',
  },
  {
    id: 'mn-pansy',
    slug: 'mn-pansy',
    imageId: 'mongolia-04',
    names: {
      sah: 'Анюта хараҕа',
      ru: 'Виола (Анютины глазки)',
      en: 'Garden Pansy',
      latin: 'Viola × wittrockiana',
    },
    description: {
      sah: 'Намыһах, элбэх өҥнөөх сибэккилээх үүнээйи. Тымныыны тулуйар, саас эрдэ сибэккилиир.',
      ru: 'Невысокое растение с многоцветными «глазастыми» цветками. Холодостойкое, зацветает рано весной.',
      en: 'A low plant with multicoloured “faced” flowers. Cold-hardy and among the first to bloom in spring.',
    },
    medicinalUses: {
      sah: 'Аймах көрүҥэ (Viola tricolor) норуот эмигэр тириигэ туһаныллар; сибэккитэ сиэнэр.',
      ru: 'Близкий вид (Viola tricolor) в народной медицине применяли при кожных болезнях; цветки съедобны.',
      en: 'A close relative (Viola tricolor) was used in folk medicine for skin conditions; the flowers are edible.',
    },
    habitat: {
      sah: 'Клумба, парк, ааҕар сир',
      ru: 'Клумбы, парки, бордюры',
      en: 'Beds, parks, borders',
    },
    bloomingSeason: 'may-july',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.EDIBLE],
    color: '#5C4B9E',
  },
  {
    id: 'mn-ornamental-kale',
    slug: 'mn-ornamental-kale',
    imageId: 'mongolia-05',
    gallery: ['mongolia-05-2'],
    names: {
      sah: 'Киэргэл хаппыста',
      ru: 'Декоративная капуста',
      en: 'Ornamental Kale',
      latin: 'Brassica oleracea',
    },
    description: {
      sah: 'Кудрявай, үрүҥ-күөх эбэтэр кыһыл-күлүмэх сэбирдэхтээх хаппыста. Күһүҥҥү клумбаны киэргэтэр.',
      ru: 'Капуста с кудрявыми бело-зелёными или пурпурными листьями, собранными в розетку. Украшает осенние клумбы.',
      en: 'A kale with frilled white-green or purple leaves in a rosette. A staple of autumn flowerbeds.',
    },
    medicinalUses: {
      sah: 'Киэргэл көрүҥэ сиэниллибэт; аймах хаппыстата сиэнэр уонна битэмииннээх.',
      ru: 'Декоративная форма в пищу не идёт; съедобные сорта того же вида богаты витаминами.',
      en: 'The ornamental form is not eaten; edible cultivars of the same species are rich in vitamins.',
    },
    habitat: {
      sah: 'Куорат клумбата, парк',
      ru: 'Городские клумбы, парки',
      en: 'City beds, parks',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.EDIBLE],
    color: '#C8D6B9',
  },
  {
    id: 'mn-dusty-miller',
    slug: 'mn-dusty-miller',
    imageId: 'mongolia-06',
    names: {
      sah: 'Үрүҥ-көмүс сэбирдэх',
      ru: 'Цинерария приморская',
      en: 'Dusty Miller',
      latin: 'Jacobaea maritima',
    },
    description: {
      sah: 'Көмүс-үрүҥ, туулаах сэбирдэхтээх киэргэл үүнээйи. Өҥүнэн атын сибэккилэри тэҥнээн көрдөрөр.',
      ru: 'Декоративное растение с серебристо-белыми опушёнными листьями. Служит контрастным фоном для ярких цветов.',
      en: 'An ornamental grown for its silvery, felted foliage. Used as a pale foil for brighter flowers.',
    },
    medicinalUses: {
      sah: 'Эмкэ туттуллубат — киэргэл эрэ туһугар. Сэбирдэҕэ сиэнэн буолбат.',
      ru: 'В лечебных целях не применяется — только декоративное; растение несъедобно.',
      en: 'Not used medicinally — purely ornamental; the plant is inedible.',
    },
    habitat: {
      sah: 'Клумба, ааҕар сир, парк',
      ru: 'Клумбы, бордюры, парки',
      en: 'Beds, borders, parks',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#B9C0C7',
  },
  {
    id: 'mn-bedstraw',
    slug: 'mn-bedstraw',
    imageId: 'mongolia-07',
    names: {
      sah: 'Саһархай сарбынньах',
      ru: 'Подмаренник настоящий',
      en: "Lady's Bedstraw",
      latin: 'Galium verum',
    },
    description: {
      sah: 'Минньигэс сыттаах, саһархай вак сибэккилээх үүнээйи. Монголия хонууларыгар киэҥник үүнэр.',
      ru: 'Растение со множеством мелких ярко-жёлтых душистых цветков. Обычно на степных лугах Монголии.',
      en: 'A plant with clouds of tiny, fragrant yellow flowers. Common on the meadow-steppe of Mongolia.',
    },
    medicinalUses: {
      sah: 'Настойун тириигэ, бүөргэ уонна нерваҕа туһаныллар этилэр; өҥнөөх кыраасканы биэрэр.',
      ru: 'Настой применяли при кожных и почечных недугах, как успокаивающее; даёт жёлтую и красную краску.',
      en: 'An infusion was used for skin and kidney complaints and as a sedative; also yields yellow and red dye.',
    },
    habitat: {
      sah: 'Хонуу, ходуһа, суол кытыла',
      ru: 'Луга, степь, обочины',
      en: 'Meadows, steppe, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#EEC900',
  },
  {
    id: 'mn-alfalfa',
    slug: 'mn-alfalfa',
    imageId: 'mongolia-08',
    gallery: ['mongolia-08-2'],
    names: {
      sah: 'Люцерна',
      ru: 'Люцерна посевная',
      en: 'Alfalfa',
      latin: 'Medicago sativa',
    },
    description: {
      sah: 'Күлүмэх-күөх сибэккилээх бобовай үүнээйи. Сүөһү аһылыгар олордуллар, айылҕаҕа да үүнэр.',
      ru: 'Бобовое растение с сине-фиолетовыми соцветиями. Возделывается как кормовое, встречается и одичавшим.',
      en: 'A legume with blue-violet flower spikes. Grown as fodder and also found running wild.',
    },
    medicinalUses: {
      sah: 'Битэмииннэ уонна минералга баай; настойун сут-мэлдьи туругун тупсарарга туттар этилэр.',
      ru: 'Богата витаминами и минералами; настой применяли как общеукрепляющее и при упадке сил.',
      en: 'Rich in vitamins and minerals; the infusion was used as a general tonic for fatigue.',
    },
    habitat: {
      sah: 'Бааһына, хонуу, суол кытыла',
      ru: 'Поля, луга, обочины',
      en: 'Fields, meadows, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#6A5ACD',
  },
  {
    id: 'mn-rugosa-rose',
    slug: 'mn-rugosa-rose',
    imageId: 'mongolia-09',
    names: {
      sah: 'Кыһыл ньургуһун (роза)',
      ru: 'Роза морщинистая',
      en: 'Rugosa Rose',
      latin: 'Rosa rugosa',
    },
    description: {
      sah: 'Күлүмэх-кыһыл сибэккилээх, сытыы иннэлээх куустаах күөх мас. Парктарга уонна кыраныыссаҕа олордуллар.',
      ru: 'Колючий кустарник с крупными розово-пурпурными цветками и морщинистыми листьями. Часто в парках и живых изгородях.',
      en: 'A thorny shrub with large pink-purple flowers and wrinkled leaves. Common in parks and hedges.',
    },
    medicinalUses: {
      sah: 'Отоҥноро (плод) С битэмиинигэ олус баай; чэйгэ, вареньеҕэ туттуллар.',
      ru: 'Плоды (шиповник) исключительно богаты витамином C; используют для чая, отваров и варенья.',
      en: 'The hips are exceptionally rich in vitamin C; used for tea, decoctions, and preserves.',
    },
    habitat: {
      sah: 'Парк, кыраныысса, күөл кытыла',
      ru: 'Парки, изгороди, берега',
      en: 'Parks, hedges, shorelines',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE, CATEGORIES.ORNAMENTAL],
    color: '#D6488B',
  },
  {
    id: 'mn-yarrow',
    slug: 'mn-yarrow',
    imageId: 'mongolia-10',
    names: {
      sah: 'Хаан тохтотор от',
      ru: 'Тысячелистник обыкновенный',
      en: 'Yarrow',
      latin: 'Achillea millefolium',
    },
    description: {
      sah: 'Үрүҥ сибэккилээх, нарын сэбирдэхтээх от. Монголия хонууларыгар, суол кытыытыгар киэҥник тарҕанар.',
      ru: 'Растение с белыми щитковидными соцветиями и перистыми листьями. Обычно на лугах и обочинах Монголии.',
      en: 'A herb with flat white flower-clusters and feathery leaves. Widespread on Mongolian meadows and roadsides.',
    },
    medicinalUses: {
      sah: 'Хаан тохтоторго, иһиини эмтииргэ уонна тымныыга былыргыттан туттуллар.',
      ru: 'Издавна применяется при кровотечениях, воспалениях и простуде; настой улучшает пищеварение.',
      en: 'Long used for bleeding, inflammation, and colds; the infusion aids digestion.',
    },
    habitat: {
      sah: 'Хонуу, ходуһа, суол кытыла',
      ru: 'Луга, степь, обочины',
      en: 'Meadows, steppe, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#FFFFFF',
  },
  {
    id: 'mn-dahlia',
    slug: 'mn-dahlia',
    imageId: 'mongolia-11',
    names: {
      sah: 'Георгин сибэкки',
      ru: 'Георгина',
      en: 'Dahlia',
      latin: 'Dahlia pinnata',
    },
    description: {
      sah: 'Улахан, элбэх өҥнөөх сибэккилээх киэргэл үүнээйи. Сайын бүтүүтэ, күһүн саҕаланыытыгар сибэккилиир.',
      ru: 'Декоративное растение с крупными махровыми соцветиями разных цветов. Цветёт с конца лета до осени.',
      en: 'An ornamental with large, full blooms in many colours. Flowers from late summer into autumn.',
    },
    medicinalUses: {
      sah: 'Эмкэ туттуллубат — киэргэл эрэ туһугар олордуллар.',
      ru: 'В медицине не применяется — только декоративное растение.',
      en: 'Not used medicinally — grown as an ornamental.',
    },
    habitat: {
      sah: 'Куорат парката, клумба',
      ru: 'Городские парки, клумбы',
      en: 'City parks, flowerbeds',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#EBD96B',
  },
  {
    id: 'mn-blue-spruce',
    slug: 'mn-blue-spruce',
    imageId: 'mongolia-12',
    gallery: ['mongolia-12-2'],
    names: {
      sah: 'Күөх-көмүс тыт (ель)',
      ru: 'Ель колючая (голубая)',
      en: 'Blue Spruce',
      latin: 'Picea pungens',
    },
    description: {
      sah: 'Күөх-көмүс иннэлээх, кэрэ хонуор мас. Монголия куораттарын уулуссаларыгар, парктарыгар олордуллар.',
      ru: 'Хвойное дерево с колючей голубовато-серебристой хвоей. Высаживают вдоль улиц и в парках городов Монголии.',
      en: 'A conifer with stiff, silvery-blue needles. Planted along streets and in the parks of Mongolian cities.',
    },
    medicinalUses: {
      sah: 'Сымнаҕас иннэтэ С битэмииннээх; хвоя ыһыгынан тыҥаны, тымныыны эмтииргэ туһаныллар.',
      ru: 'Молодая хвоя содержит витамин C; хвойные отвары применяли при простуде и для дезинфекции.',
      en: 'Young needles carry vitamin C; needle decoctions were used for colds and as a disinfectant.',
    },
    habitat: {
      sah: 'Уулусса, парк, олордуллубут ойуур',
      ru: 'Улицы, парки, посадки',
      en: 'Streets, parks, plantings',
    },
    bloomingSeason: 'may-june',
    categories: [CATEGORIES.ORNAMENTAL, CATEGORIES.MEDICINAL],
    color: '#6E8B9E',
  },
  {
    id: 'mn-willow',
    slug: 'mn-willow',
    imageId: 'mongolia-13',
    names: {
      sah: 'Талах',
      ru: 'Ива',
      en: 'Willow',
      latin: 'Salix',
    },
    description: {
      sah: 'Уу кытыытыгар үүнэр, синньигэс сэбирдэхтээх мас. Монголия үрэхтэрин, күөллэрин кытыытыгар элбэх.',
      ru: 'Дерево или кустарник с узкими листьями, растущее у воды. Обычно по берегам рек и озёр Монголии.',
      en: 'A tree or shrub with narrow leaves, growing by water. Common along Mongolian riverbanks and lakeshores.',
    },
    medicinalUses: {
      sah: 'Хатырыгар салицин баар — сылырҕаны, ыарыыны намтатарга былыр туттуллар этэ (аспирин төрдө).',
      ru: 'Кора содержит салицин — исстари применялась как жаропонижающее и обезболивающее (прообраз аспирина).',
      en: 'The bark contains salicin — long used to lower fever and ease pain (the forerunner of aspirin).',
    },
    habitat: {
      sah: 'Үрэх, күөл кытыла, дьэдьэннээх сир',
      ru: 'Берега рек и озёр, влажные места',
      en: 'Riverbanks, lakeshores, wet ground',
    },
    bloomingSeason: 'may-june',
    categories: [CATEGORIES.MEDICINAL],
    color: '#8FA05A',
  },
  {
    id: 'mn-dandelion',
    slug: 'mn-dandelion',
    imageId: 'mongolia-14',
    names: {
      sah: 'Саһархай туллук (одуванчик)',
      ru: 'Одуванчик лекарственный',
      en: 'Dandelion',
      latin: 'Taraxacum officinale',
    },
    description: {
      sah: 'Саһархай сибэккилээх, сэлээппэлээх сиэмэлээх киэҥник биллэр от. Хонуоҕа, суол кытыытыгар үүнэр.',
      ru: 'Всем известное растение с жёлтыми корзинками и пушистыми семенами-парашютиками. Растёт на лугах и обочинах.',
      en: 'The familiar plant with yellow heads and downy parachute seeds. Grows on meadows and roadsides.',
    },
    medicinalUses: {
      sah: 'Силиитэ, сэбирдэҕэ тыынга, быарга туһалаах; илин сибэккитэ сиэнэр, вареньеҕэ туттуллар.',
      ru: 'Корни и листья применяли для аппетита и печени; молодые листья и цветки съедобны.',
      en: 'Roots and leaves were used for appetite and the liver; young leaves and flowers are edible.',
    },
    habitat: {
      sah: 'Хонуу, ходуһа, суол кытыла',
      ru: 'Луга, степь, обочины',
      en: 'Meadows, steppe, roadsides',
    },
    bloomingSeason: 'may-july',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#F2C200',
  },
  {
    id: 'mn-wormwood',
    slug: 'mn-wormwood',
    imageId: 'mongolia-15',
    names: {
      sah: 'Эрбэһин (полынь)',
      ru: 'Полынь',
      en: 'Wormwood',
      latin: 'Artemisia',
    },
    description: {
      sah: 'Аһыы сыттаах, көмүс-күөх сэбирдэхтээх от. Монголия хонуутун симэлитэр — тыаһа-ууһа сүрдээх.',
      ru: 'Ароматное растение с серебристо-зелёными рассечёнными листьями и горьким запахом. Один из символов монгольской степи.',
      en: 'An aromatic herb with silvery, dissected leaves and a bitter scent. One of the signatures of the Mongolian steppe.',
    },
    medicinalUses: {
      sah: 'Аһыы настойун сут-мэлдьини аһарарга, паразиты үүрэргэ туттар этилэр. Дозаны кэһии дьааттаах.',
      ru: 'Горький настой применяли для аппетита и от паразитов. Передозировка опасна — растение сильнодействующее.',
      en: 'The bitter infusion was used for appetite and against parasites. Overdose is dangerous — a potent plant.',
    },
    habitat: {
      sah: 'Ходуһа, кураанах сир, суол кытыла',
      ru: 'Степь, сухие склоны, обочины',
      en: 'Steppe, dry slopes, roadsides',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#9CA986',
  },
  {
    id: 'mn-phlomis',
    slug: 'mn-phlomis',
    imageId: 'mongolia-16',
    gallery: ['mongolia-16-2'],
    names: {
      sah: 'Күлүмэх эргиэлэс сибэкки',
      ru: 'Зопник клубненосный',
      en: 'Tuberous Jerusalem Sage',
      latin: 'Phlomoides tuberosa',
    },
    description: {
      sah: 'Үрдүк умнаһыгар күлүмэх-кыһыл сибэккитэ эргиэнэн тэлгэнэр степной от. Монголия хонуутугар киэҥник көстөр.',
      ru: 'Степное растение с пурпурно-розовыми цветками, собранными мутовками по высокому стеблю. Обычно в монгольской степи.',
      en: 'A steppe plant with pink-purple flowers set in whorls up a tall stem. Common across the Mongolian steppe.',
    },
    medicinalUses: {
      sah: 'Силиин клубенэ аһылыкка сыаналанар; настойун ис ыарыытыгар туттар этилэр.',
      ru: 'Клубеньки на корнях съедобны; настой применяли при желудочных расстройствах и как укрепляющее.',
      en: 'The small root tubers are edible; an infusion was used for stomach ailments and as a tonic.',
    },
    habitat: {
      sah: 'Ходуһа, кураанах хонуу',
      ru: 'Степь, сухие луга',
      en: 'Steppe, dry meadows',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#C97AAE',
  },
  {
    id: 'mn-astragalus',
    slug: 'mn-astragalus',
    imageId: 'mongolia-17',
    names: {
      sah: 'Астрагал',
      ru: 'Астрагал',
      en: 'Milkvetch',
      latin: 'Astragalus',
    },
    description: {
      sah: 'Күлүмэх сибэккилээх бобовай от. Монголия хонуутугар бу ууһугар сүүһүнэн көрүҥ баар.',
      ru: 'Бобовое растение с фиолетовыми соцветиями-кистями. В монгольской степи насчитываются сотни видов этого рода.',
      en: 'A legume with purple flower-clusters. Hundreds of species of this genus grow across the Mongolian steppe.',
    },
    medicinalUses: {
      sah: 'Сорох көрүҥэ восточнай эмгэ сүрэххэ, иммунитеккэ туһаныллар. Сорох көрүҥэ дьааттаах — сэрэнэн.',
      ru: 'Некоторые виды в восточной медицине применяют как тонизирующее для сердца и иммунитета. Ряд видов ядовит — будьте осторожны.',
      en: 'Some species are used in Eastern medicine as a heart and immune tonic. Several species are toxic — take care.',
    },
    habitat: {
      sah: 'Ходуһа, кураанах хонуу',
      ru: 'Степь, сухие луга',
      en: 'Steppe, dry meadows',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#7B5EA7',
  },
  {
    id: 'mn-cinquefoil',
    slug: 'mn-cinquefoil',
    imageId: 'mongolia-18',
    names: {
      sah: 'Биэс сэбирдэх (лапчатка)',
      ru: 'Лапчатка',
      en: 'Cinquefoil',
      latin: 'Potentilla',
    },
    description: {
      sah: 'Саһархай биэс лэппиэстээх сибэккилээх от. Монголия хонуутун саһархайынан симиир.',
      ru: 'Растение с ярко-жёлтыми пятилепестковыми цветками. Массово окрашивает монгольские луга в жёлтый.',
      en: 'A plant with bright yellow five-petalled flowers. Colours whole stretches of Mongolian grassland yellow.',
    },
    medicinalUses: {
      sah: 'Настойун иһиини эмтииргэ, тыл-уос сытыырҕааһыныгар туттар этилэр.',
      ru: 'Настой применяли при воспалениях и расстройстве желудка, для полоскания горла.',
      en: 'An infusion was used for inflammation and upset stomach, and as a gargle.',
    },
    habitat: {
      sah: 'Хонуу, ходуһа, суол кытыла',
      ru: 'Луга, степь, обочины',
      en: 'Meadows, steppe, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#F5C518',
  },
  {
    id: 'mn-plantain',
    slug: 'mn-plantain',
    imageId: 'mongolia-19',
    names: {
      sah: 'Ыт тыла (подорожник)',
      ru: 'Подорожник большой',
      en: 'Broadleaf Plantain',
      latin: 'Plantago major',
    },
    description: {
      sah: 'Кэтит сэбирдэхтээх, синньигэс умнастаах от. Суол кытыытыгар, аайы сиргэ үүнэр.',
      ru: 'Растение с широкими листьями в розетке и узкими колосками. Растёт у дорог и на вытоптанных местах.',
      en: 'A plant with broad rosette leaves and slender flower-spikes. Grows along paths and on trodden ground.',
    },
    medicinalUses: {
      sah: 'Сэбирдэҕин баас, кэһии үрдүгэр ууруллар — эмтиир, хаан тохтотор аналлаах.',
      ru: 'Свежий лист прикладывают к ранам и порезам — заживляющее и кровоостанавливающее средство.',
      en: 'A fresh leaf is applied to wounds and cuts — a wound-healing, blood-staunching remedy.',
    },
    habitat: {
      sah: 'Суол кытыла, аайы сир, ааҕар сир',
      ru: 'Обочины, тропы, вытоптанные места',
      en: 'Roadsides, paths, trodden ground',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#7FA05A',
  },
  {
    id: 'mn-ryegrass',
    slug: 'mn-ryegrass',
    imageId: 'mongolia-20',
    gallery: ['mongolia-20-2'],
    names: {
      sah: 'Күөх-көмүс от (вострец)',
      ru: 'Востре́ц китайский',
      en: 'Chinese Ryegrass',
      latin: 'Leymus chinensis',
    },
    description: {
      sah: 'Күөх-көмүс өҥнөөх, бөҕө силистээх степной от. Монголия хонуутун сүрүн аһылыга — сүөһүгэ туһалаах.',
      ru: 'Дерновинный злак сизо-зелёного оттенка. Основа монгольских пастбищ — ценный корм для скота.',
      en: 'A blue-green sod-forming grass. A backbone of Mongolian pasture and a valued forage for livestock.',
    },
    medicinalUses: {
      sah: 'Эмкэ туттуллубат — сүөһү аһылыга. Хонууну хатааһынтан харыстыыр.',
      ru: 'В медицине не применяется — кормовое растение; закрепляет почву степи.',
      en: 'Not used medicinally — a forage grass; it also binds and protects steppe soil.',
    },
    habitat: {
      sah: 'Ходуһа, хонуу, мэччирэҥ',
      ru: 'Степь, луга, пастбища',
      en: 'Steppe, meadows, pasture',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.EDIBLE],
    color: '#9DB08A',
  },
  {
    id: 'mn-dragonhead',
    slug: 'mn-dragonhead',
    imageId: 'mongolia-21',
    names: {
      sah: 'Дракон бас (змееголовник)',
      ru: 'Змееголовник',
      en: 'Dragonhead',
      latin: 'Dracocephalum',
    },
    description: {
      sah: 'Күлүмэх-күөх сибэккилээх, минньигэс сыттаах степной от. Монголия хонуутугар киэҥник тарҕанар.',
      ru: 'Ароматное степное растение с сине-фиолетовыми цветками. Широко распространено в монгольской степи.',
      en: 'An aromatic steppe herb with blue-violet flowers. Widespread across the Mongolian steppe.',
    },
    medicinalUses: {
      sah: 'Настойун сүрэххэ, нерваҕа, тымныыга туһаныллар; чэйгэ минньигэс сыттаах эбии.',
      ru: 'Настой применяли как успокаивающее, при простуде и головной боли; душистая добавка к чаю.',
      en: 'An infusion was used as a sedative and for colds and headache; a fragrant addition to tea.',
    },
    habitat: {
      sah: 'Ходуһа, кураанах хонуу, тас өттө',
      ru: 'Степь, сухие луга, склоны',
      en: 'Steppe, dry meadows, slopes',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.MEDICINAL],
    color: '#5E6FC0',
  },
  {
    id: 'mn-guelder-rose',
    slug: 'mn-guelder-rose',
    imageId: 'mongolia-22',
    names: {
      sah: 'Отон мас (калина)',
      ru: 'Калина обыкновенная',
      en: 'Guelder Rose',
      latin: 'Viburnum opulus',
    },
    description: {
      sah: 'Үрүҥ сибэккилээх, күһүн кыһыл отоннолор күөх мас. Уу кытыытыгар, ойуур кытыытыгар үүнэр.',
      ru: 'Кустарник с белыми соцветиями и красными ягодами осенью. Растёт у воды и по опушкам.',
      en: 'A shrub with white flower-clusters and red berries in autumn. Grows by water and along woodland edges.',
    },
    medicinalUses: {
      sah: 'Отоно хаан баттааһынын намтатарга, тымныыга туһаныллар; хатырыга хаан тохтотор.',
      ru: 'Ягоды применяли при повышенном давлении и простуде; кора — кровоостанавливающее средство.',
      en: 'The berries were used for high blood pressure and colds; the bark as a blood-staunching remedy.',
    },
    habitat: {
      sah: 'Уу кытыла, ойуур кытыла, парк',
      ru: 'Берега, опушки, парки',
      en: 'Watersides, woodland edges, parks',
    },
    bloomingSeason: 'june-july',
    categories: [CATEGORIES.MEDICINAL, CATEGORIES.EDIBLE],
    color: '#E8E4DA',
  },
  {
    id: 'mn-hawksbeard',
    slug: 'mn-hawksbeard',
    imageId: 'mongolia-23',
    names: {
      sah: 'Саһархай от (скерда)',
      ru: 'Скерда',
      en: 'Hawksbeard',
      latin: 'Crepis',
    },
    description: {
      sah: 'Саһархай, одуванчикка майгынныыр сибэккилээх от. Кураанах хонууга, суол кытыытыгар үүнэр.',
      ru: 'Растение с жёлтыми, похожими на одуванчик соцветиями. Растёт на сухих лугах и обочинах.',
      en: 'A plant with yellow, dandelion-like flower-heads. Grows on dry meadows and roadsides.',
    },
    medicinalUses: {
      sah: 'Эдэр сэбирдэҕэ сиэнэр; норуот эмигэр сэдэхтик туттуллар.',
      ru: 'Молодые листья съедобны; в народной медицине применяется редко.',
      en: 'Young leaves are edible; little used in folk medicine.',
    },
    habitat: {
      sah: 'Кураанах хонуу, суол кытыла',
      ru: 'Сухие луга, обочины',
      en: 'Dry meadows, roadsides',
    },
    bloomingSeason: 'june-august',
    categories: [CATEGORIES.EDIBLE],
    color: '#F3C218',
  },
  {
    id: 'mn-cosmos',
    slug: 'mn-cosmos',
    imageId: 'mongolia-24',
    names: {
      sah: 'Оранжевай космея',
      ru: 'Космея серно-жёлтая',
      en: 'Sulphur Cosmos',
      latin: 'Cosmos sulphureus',
    },
    description: {
      sah: 'Оранжевай-саһархай сибэккилээх, синньигэс сэбирдэхтээх киэргэл үүнээйи. Куорат клумбаларыгар олордуллар.',
      ru: 'Декоративное растение с оранжево-жёлтыми цветками и ажурными листьями. Высаживается на городских клумбах.',
      en: 'An ornamental with orange-yellow flowers and finely cut leaves. Planted in city flowerbeds.',
    },
    medicinalUses: {
      sah: 'Эмкэ туттуллубат — киэргэл эрэ туһугар олордуллар.',
      ru: 'В медицине не применяется — только декоративное растение.',
      en: 'Not used medicinally — grown as an ornamental.',
    },
    habitat: {
      sah: 'Куорат клумбата, парк',
      ru: 'Городские клумбы, парки',
      en: 'City flowerbeds, parks',
    },
    bloomingSeason: 'july-august',
    categories: [CATEGORIES.ORNAMENTAL],
    color: '#F07B1D',
  },
];

/**
 * Fold the machine-assisted Mongolian + Chinese translations into each plant's
 * localized fields. The base sah/ru/en stays authored in RAW above; mn/zh live
 * in mongolia-translations.ts and are merged here so both the web app and the
 * native export get the full five-language dataset from one source.
 */
export const mongoliaPlants: Omit<Plant, 'imageBase'>[] = RAW.map((p) => {
  const t = MONGOLIA_I18N[p.id];
  if (!t) return p;
  return {
    ...p,
    names: { ...p.names, mn: t.names.mn, zh: t.names.zh },
    description: { ...p.description, mn: t.description.mn, zh: t.description.zh },
    medicinalUses: { ...p.medicinalUses, mn: t.medicinalUses.mn, zh: t.medicinalUses.zh },
    habitat: { ...p.habitat, mn: t.habitat.mn, zh: t.habitat.zh },
  };
});
