import { useEffect, useState } from 'react';
import type { LocalizedString } from '../types';

/**
 * Community news / changelog. Follows the same over-the-air pattern as the
 * catalog: the app ships a BUNDLED fallback (below) and, on load, fetches the
 * hosted `/news.json` — so you can post an update by editing ONE JSON file
 * (no app-store release needed). If the fetch fails (offline / not deployed),
 * the bundled list shows. Newest first; dates are ISO (YYYY-MM-DD).
 *
 * To post: add an entry to BOTH this array and public/news.json (keep them in
 * sync — the bundled copy is the offline fallback), then deploy. For a native
 * push with no app release, just update the hosted public/news.json.
 */
export interface NewsItem {
  id: string;
  date: string;
  title: LocalizedString;
  body: LocalizedString;
}

export const BUNDLED_NEWS: NewsItem[] = [
  {
    id: '2026-07-mongolia-30',
    date: '2026-07-18',
    title: {
      sah: 'Монголия хомуура 30 үүнээйигэ тэнийдэ',
      ru: 'Коллекция Монголии — теперь 30 растений',
      en: 'The Mongolia collection now has 30 plants',
      mn: 'Монголын түүвэр 30 ургамалд хүрлээ',
      zh: '蒙古植物集已达 30 种',
    },
    body: {
      sah: 'Саҥа көстүүлэр: уот от, мутугур от, үүт от, ыраас луук, сымнаҕас от уонна Сардаана. Элбэх үүнээйи билигин хас да хаартыскалаах — чугастан ырааҕар.',
      ru: 'Добавлены новые виды: иван-чай, бодяк, молочай, дикий лук, смолёвка и сардаана (лилия). У многих растений теперь несколько фотографий — от крупного плана к общему виду.',
      en: 'New species added: fireweed, thistle, spurge, wild onion, catchfly, and the Sardaana lily. Many plants now have photo galleries — from close-up to wide shot.',
      mn: 'Шинэ зүйлүүд нэмэгдлээ: галт цэцэг, азгана, сүүт өвс, зэрлэг сонгино, цацраа болон Сарана цэцэг. Олон ургамал одоо хэд хэдэн зурагтай — ойроос холд.',
      zh: '新增物种：柳兰、蓟、大戟、野葱、蝇子草以及萨兰（百合）。许多植物现在配有多张照片——从特写到全景。',
    },
  },
  {
    id: '2026-07-app-store',
    date: '2026-07-13',
    title: {
      sah: 'Оттор Мастар App Store-га тахсыбыта',
      ru: '«Оттор Мастар» вышел в App Store',
      en: 'Ottor Mastar is on the App Store',
      mn: 'Оттор Мастар App Store дээр гарлаа',
      zh: 'Ottor Mastar 已上架 App Store',
    },
    body: {
      sah: 'Аппликация билигин iPhone уонна iPad аайы баар — босхо, офлайн үлэлиир. Аҕыйах кэмнэн Mac уонна Android эмиэ кэлиэ.',
      ru: 'Приложение доступно для iPhone и iPad — бесплатно и работает офлайн. Скоро выйдут версии для Mac и Android.',
      en: 'The app is available for iPhone and iPad — free and fully offline. Mac and Android versions are coming soon.',
      mn: 'Аппликейшн iPhone, iPad дээр гарлаа — үнэгүй, офлайн ажиллана. Удахгүй Mac, Android хувилбар гарна.',
      zh: '应用现已登陆 iPhone 和 iPad——免费且完全离线。Mac 与 Android 版本即将推出。',
    },
  },
];

interface NewsFeed {
  version?: number;
  items: NewsItem[];
}

/** Bundled news, overridden at runtime by the hosted /news.json when reachable. */
export function useNews(): NewsItem[] {
  const [items, setItems] = useState<NewsItem[]>(BUNDLED_NEWS);
  useEffect(() => {
    let alive = true;
    fetch('/news.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? (r.json() as Promise<NewsFeed>) : null))
      .then((feed) => {
        if (alive && feed?.items?.length) setItems(feed.items);
      })
      .catch(() => {/* offline / not deployed → keep the bundled list */});
    return () => {
      alive = false;
    };
  }, []);
  return items;
}
