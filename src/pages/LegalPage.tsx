import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../types';

type Tri = Record<Language, string>;
type TriList = Record<Language, string[]>;

const T = {
  title: { sah: 'Сокуон уонна тус кистэлэҥ', ru: 'Правовая информация и конфиденциальность', en: 'Legal & Privacy' } as Tri,
  updated: { sah: 'Саҥардылынна: 2026 сыл', ru: 'Обновлено: 2026 год', en: 'Last updated: 2026' } as Tri,
  intro: {
    sah: 'Оттор Мастар — үөрэхтээһин уонна култуура бырайыага. Бу сыһыарыыны туһаныаххыт иннинэ бу сирэйи ааҕыҥ.',
    ru: '«Оттор Мастар» — образовательный и культурный проект. Пожалуйста, ознакомьтесь с этой страницей перед использованием приложения.',
    en: 'Ottor Mastar is an educational and cultural project. Please read this page before using the application.',
  } as Tri,
};

const DISCLAIMER = {
  heading: { sah: 'Эппиэтинэһи сүкпэт буолуу', ru: 'Отказ от ответственности', en: 'Disclaimer' } as Tri,
  body: {
    sah: [
      'Бу сыһыарыы биэрэр иһитиннэриитэ (ааттара, ойуулааһыннара, үүнэр сирдэрэ, норуот эмтиир туттуута) — үөрэхтээһин уонна билии тарҕатар сыаллаах эрэ.',
      'Бу эмчит сүбэтэ БУОЛБАТАХ. Ханнык баҕарар үүнээйини бэлиэтииргэ, хомуйарга, буһарарга эбэтэр сииргэ туһанымаҥ.',
      'Элбэх айылҕа үүнээйитэ дьааттаах, өлөрөр кыахтаах, уонна сиэнэр эбэтэр эмтээх отторго олус майгынныыр. Бу сыһыарыыга олоҕуран туох да үүнээйини сиэмэҥ, тутумаҥ, туттумаҥ — сыыһа быһаарыы ыар охсууга эбэтэр өлүүнү аҕалыан сөп.',
      'Норуот эмтиир туттуута култуура уонна устуоруйа туһугар эрэ суруллубут, сүбэ буолбатах. Доруобуйаҕытыгар туһаныаххыт иннинэ булгуччу бырааска көрдөрүҥ.',
      'Ааптардар уонна кыттыылаахтар бу сыһыарыы иһитиннэриитин туһаныыттан тахсар ханнык баҕарар сүтүккэ, охсууга, ыарыыга, дьааттаныыга эбэтэр алдьаныыга эппиэтинэс сүкпэттэр. Бэйэҕит сэрэниҥ.',
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
  heading: { sah: 'Тус дааннайдары харыстааһын', ru: 'Политика конфиденциальности', en: 'Privacy Policy' } as Tri,
  body: {
    sah: [
      '«Оттор Мастар» туох да тус дааннайдары хомуйбат, харайбат уонна ыыппат. Бэлиэтэнии, киирии, реклама эбэтэр кэтээн көрүү суох.',
      'Соҕотох харайыллара — эһиги талбыт тылгыт, ол браузергыт иһигэр эрэ хараллар (localStorage). Ол тэрилгититтэн тахсыбат уонна ханнык баҕарар кэмҥэ браузер туруоруутунан сотуллуон сөп.',
      'Кэтээн көрөр cookie туттуллубат. Эһигини билэр аналитика хомуллубат.',
      'Бу сыһыарыы эһиги дааннайгытын таска ыытпат.',
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
  heading: { sah: 'Иһинээҕитэ уонна ааптар бырааба', ru: 'Контент и авторские права', en: 'Content & copyright' } as Tri,
  body: {
    sah: [
      'Ботаника ойуулара уонна хаартыскалара үөрэхтээһин уонна култуура сыалыгар туттуллаллар. Үүнээйилэр быһаарыылара уопсай ботаника билиитин уонна саха норуотун үгэстэрин холбууллар.',
      'Ботаника ойуулара — көрдөрөр сыаллаах эрэ, көмпүүтэринэн оҥоһуллубут стильлээх ойуулар; кинилэргэ көстөр ааттар, дьыллар уонна ыйынньыктар киэргэтии эрэ буолаллар, туспа устуоруйалаах үлэлэри кытта сибээстэспэттэр.',
      '© 2026 Оттор Мастар.',
    ],
    ru: [
      'Ботанические иллюстрации и фотографии используются в образовательных и культурных целях. Описания растений сочетают общие ботанические сведения и якутскую (саха) народную традицию.',
      'Ботанические иллюстрации представляют собой стилизованные, созданные цифровым способом изображения исключительно для наглядности; приведённые на них подписи, даты и ссылки носят декоративный характер и не отсылают к конкретным историческим изданиям.',
      '© 2026 Оттор Мастар.',
    ],
    en: [
      'Botanical illustrations and photographs are used for educational and cultural purposes. Plant descriptions combine general botanical knowledge with Yakut (Sakha) folk tradition.',
      'The botanical illustrations are stylised, digitally-created plates for visual reference only; any captions, dates, or citations shown on them are decorative and are not references to specific historical works.',
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
    <section className={`rounded-2xl border p-6 ${tone === 'warn' ? 'bg-amber-tint border-amber/25' : 'bg-card border-hairline'}`}>
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
  // The legal / privacy copy is authored in Sakha/Russian/English only and is
  // deliberately NOT machine-translated (sensitive text). Mongolian and Chinese
  // readers get the English version — same policy as the native apps — instead
  // of a blank page from a missing key.
  const rawLang = i18n.language as Language;
  const lang: Language = rawLang === 'mn' || rawLang === 'zh' ? 'en' : rawLang;

  return (
    <div className="min-h-screen bg-bg-surface flex flex-col">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-hairline shadow-soft">
        <div className="flex h-14 items-center px-4 max-w-3xl mx-auto w-full">
          <Link
            to="/about"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg-subtle active:scale-95 transition-all text-ink-light"
            aria-label={t('common.previous')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="ml-2 font-heading text-xl font-semibold text-ink">
            {T.title[lang]}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto pb-safe">
        <div className="p-6 space-y-8 animate-fade-in">
          {/* Intro & Meta */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink-lighter tracking-wide uppercase">
              {T.updated[lang]}
            </p>
            <p className="text-ink text-base leading-relaxed">
              {T.intro[lang]}
            </p>
          </div>

          <div className="h-px bg-hairline w-full" />

          {/* Sections */}
          <div className="space-y-6">
            <Section heading={DISCLAIMER.heading[lang]} paragraphs={DISCLAIMER.body[lang]} tone="warn" />
            <Section heading={PRIVACY.heading[lang]} paragraphs={PRIVACY.body[lang]} />
            <Section heading={CONTENT.heading[lang]} paragraphs={CONTENT.body[lang]} />
          </div>
        </div>
      </main>
    </div>
  );
}
