import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../types';

type Tri = Record<Language, string>;
type TriList = Record<Language, string[]>;

const T = {
  title: { sah: 'Быраап уонна кистэлэҥ', ru: 'Правовая информация и конфиденциальность', en: 'Legal & Privacy' } as Tri,
  updated: { sah: 'Сонньуйуллубута: 2026 сыл', ru: 'Обновлено: 2026 год', en: 'Last updated: 2026' } as Tri,
  intro: {
    sah: 'Оттор Мастар — үөрэхтээһин уонна культура проега. Маны туһаныаҥ иннинэ бу сирэйи ааҕыаҥ.',
    ru: '«Оттор Мастар» — образовательный и культурный проект. Пожалуйста, ознакомьтесь с этой страницей перед использованием приложения.',
    en: 'Ottor Mastar is an educational and cultural project. Please read this page before using the application.',
  } as Tri,
};

const DISCLAIMER = {
  heading: { sah: 'Эппиэтинэстэн аккаастаныы', ru: 'Отказ от ответственности', en: 'Disclaimer' } as Tri,
  body: {
    sah: [
      'Бу приложение биэрэр информацията (ааттара, ойдобулунуута, үүнэр сирэ, норуот эмтиир туттуута) — үөрэхтээһин уонна билии тэнитэр сыаллаах эрэ.',
      'Бу эмчит сүбэтэ БУОЛБАТАХ. Ханнык баҕарар үүнээйини бэлиэтииргэ, хомуйарга, астыырга эбэтэр аһыырга туттума.',
      'Элбэх кыыл үүнээйи дьаактаах, өлөрөр кыахтаах, уонна аһыыр эбэтэр эмтиир үүнээйилэри кытта майгыннаһар. Бу приложениеҕэ олоҕуран туох да үүнээйини аһаама, тутума, туттума — сыыһа бэлиэтээһин ыар охсууну эбэтэр өлүүнү аҕалыан сөп.',
      'Норуот эмтиир туттуута культура уонна история туһугар эрэ суруллубут, сүбэ буолбатах. Доруобуйаҕар туһаныаҥ иннинэ эмчиккэ көрдөр.',
      'Ааптардар уонна кыттыылаахтар бу приложение информациятын туһанааһынтан тахсар ханнык баҕарар сүтүккэ, охсууга, ыарыыга, дьааттаныыга эбэтэр алдьаныыга эппиэттээбэттэр. Эн бэйэҥ эппиэтинэскинэн туттаҕын.',
    ],
    ru: [
      'Вся информация в этом приложении (названия, описания, места обитания, сведения о традиционном и лечебном применении) предоставляется исключительно в общеобразовательных и справочных целях.',
      'Это НЕ является медицинской, лечебной консультацией или советом по безопасности и не должно использоваться для определения, сбора, приготовления или употребления каких-либо растений.',
      'Многие дикорастущие растения ядовиты или смертельно опасны и внешне похожи на съедобные или лекарственные виды. Никогда не употребляйте, не трогайте и не используйте растения, полагаясь на это приложение. Ошибка в определении может привести к тяжёлым отравлениям или смерти.',
      'Сведения о народном и традиционном применении приведены исключительно из культурного и исторического интереса и не являются рекомендацией. Перед любым применением растений в лечебных целях обязательно проконсультируйтесь с квалифицированным врачом.',
      'Авторы и участники проекта не несут никакой ответственности за любой ущерб, вред здоровью, болезнь, отравление или убытки, прямо или косвенно связанные с использованием информации из этого приложения или доверием к ней. Вы используете эту информацию исключительно на свой страх и риск.',
    ],
    en: [
      'All information in this application (names, descriptions, habitats, and notes on traditional or medicinal use) is provided for general educational and reference purposes only.',
      'It is NOT medical, health, or safety advice, and must not be used to identify, gather, prepare, or consume any plant.',
      'Many wild plants are toxic or deadly and closely resemble edible or medicinal species. Never eat, touch, or use any plant based on this application. Misidentification can cause serious injury or death.',
      'Traditional and folk uses are recorded for cultural and historical interest only and are not a recommendation. Always consult a qualified medical professional before using any plant for health purposes.',
      'The authors and contributors accept no responsibility or liability whatsoever for any loss, injury, illness, poisoning, or damage arising directly or indirectly from the use of, or reliance on, any information in this application. You use this information entirely at your own risk.',
    ],
  } as TriList,
};

const PRIVACY = {
  heading: { sah: 'Кистэлэҥ политиката', ru: 'Политика конфиденциальности', en: 'Privacy Policy' } as Tri,
  body: {
    sah: [
      'Оттор Мастар туох да бэйэ туһунан информацияны хомуйбат, харайбат, ыыппат. Бэлиэтэнии, киирии, реклама эбэтэр атын сирдэр кэтээн көрүүлэрэ суох.',
      'Соҕотох харайыллар — эн талбыт тылыҥ, ол эн браузерыҥ иһигэр (localStorage) эрэ хараллар, приложение өйдүүр туһугар. Ол эн тэрилгиттэн тахсыбат, браузер туруоруутунан ханнык баҕарар кэмҥэ сотуллуон сөп.',
      'Кэтээн көрөр cookie туттуллубат. Эйигин билэр аналитика хомуллубат.',
      'Бу приложение эн даннайыҥ туһунан тас ыйытыы ыытпат.',
    ],
    ru: [
      '«Оттор Мастар» не собирает, не хранит и не передаёт никаких персональных данных. Нет учётных записей, входа, рекламы и стороннего отслеживания.',
      'Единственное, что сохраняется, — выбранный вами язык интерфейса, который хранится локально в вашем браузере (localStorage), чтобы приложение помнило ваш выбор. Эти данные не покидают ваше устройство и могут быть удалены в любой момент через настройки браузера.',
      'Отслеживающие cookie не используются. Аналитика, идентифицирующая вас, не собирается.',
      'Приложение не отправляет внешних сетевых запросов с вашими данными.',
    ],
    en: [
      'Ottor Mastar does not collect, store, or share any personal data. There are no user accounts, no sign-in, no advertising, and no third-party tracking.',
      'The only thing stored is your chosen interface language, kept locally in your browser (localStorage) so the app remembers your preference. This never leaves your device and can be cleared at any time via your browser settings.',
      'No tracking cookies are used. No analytics that identify you are collected.',
      'The app makes no external network requests carrying your data.',
    ],
  } as TriList,
};

const CONTENT = {
  heading: { sah: 'Ис хоһоон уонна аптар', ru: 'Контент и авторские права', en: 'Content & copyright' } as Tri,
  body: {
    sah: [
      'Ботаническай ойуулар уонна хаартыскалар үөрэхтээһин уонна культура сыалыгар туттуллаллар. Үүнээйи туһунан ойдобул уопсай ботаника билиитин уонна саха норуотун үгэһин холбуур.',
      '© 2026 Оттор Мастар.',
    ],
    ru: [
      'Ботанические иллюстрации и фотографии используются в образовательных и культурных целях. Описания растений сочетают общие ботанические сведения и якутскую (саха) народную традицию.',
      '© 2026 Оттор Мастар.',
    ],
    en: [
      'Botanical illustrations and photographs are used for educational and cultural purposes. Plant descriptions combine general botanical knowledge with Yakut (Sakha) folk tradition.',
      '© 2026 Ottor Mastar.',
    ],
  } as TriList,
};

function Section({ heading, paragraphs, tone = 'default' }: {
  heading: string;
  paragraphs: string[];
  tone?: 'default' | 'warn';
}) {
  return (
    <section className={`rounded-2xl border p-6 ${tone === 'warn' ? 'bg-[#FFF7F2] border-amber/25' : 'bg-card border-hairline'}`}>
      <h2 className="font-heading text-lg font-semibold text-ink mb-4">{heading}</h2>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-ink-light text-[15px] leading-relaxed">{p}</p>
        ))}
      </div>
    </section>
  );
}

export default function LegalPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  return (
    <div className="min-h-screen pt-16 pb-24 md:pb-10">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium text-ink-muted hover:text-forest no-underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('nav.about')}
        </Link>

        <h1 className="font-heading text-3xl font-bold text-ink mb-1">{T.title[lang]}</h1>
        <p className="text-ink-muted text-sm mb-2">{T.updated[lang]}</p>
        <p className="text-ink-light text-[15px] leading-relaxed mb-8">{T.intro[lang]}</p>

        <div className="space-y-4">
          <Section tone="warn" heading={DISCLAIMER.heading[lang]} paragraphs={DISCLAIMER.body[lang]} />
          <Section heading={PRIVACY.heading[lang]} paragraphs={PRIVACY.body[lang]} />
          <Section heading={CONTENT.heading[lang]} paragraphs={CONTENT.body[lang]} />
        </div>
      </div>
    </div>
  );
}
