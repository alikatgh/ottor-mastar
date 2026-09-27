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
  links?: { href: string; label: LocalizedString }[];
}

export const BUNDLED_NEWS: NewsItem[] = [
  {
    "id": "2026-09-android-beta",
    "date": "2026-09-27",
    "title": {
      "sah": "Help test Ottor Mastar on Android",
      "en": "Help test Ottor Mastar on Android",
      "ru": "Помогите протестировать «Оттор Мастар» на Android",
      "mn": "Оттор Мастар-ын Android хувилбарыг хамт туршъя",
      "zh": "一起测试 Ottor Mastar Android 版"
    },
    "body": {
      "sah": "Our Android beta has been submitted to Google Play for review. We are inviting testers before the public launch. This is a closed test with group enrollment, not an unrestricted open test.\n\nExplore the illustrated herbarium of Yakutia and Mongolia, search, favorites and reading settings. The bundled catalog works offline; full-resolution images and external resources need internet. Botanical reference, not medical advice.\n\nJoin the tester group using the Google account on your Android phone. After Google approves the release, opt in on Play and install. If the app is unavailable during review, check back after approval. Please try searching, reading and offline use, then send feedback on our Facebook Page. Stay opted in for at least 14 continuous days: Google requires 12 testers before we can apply for production access. Group membership alone does not count as Play opt-in.\n\nSignup instructions: https://ottormastar.aulenor.com/app",
      "en": "Our Android beta has been submitted to Google Play for review. We are inviting testers before the public launch. This is a closed test with group enrollment, not an unrestricted open test.\n\nExplore the illustrated herbarium of Yakutia and Mongolia, search, favorites and reading settings. The bundled catalog works offline; full-resolution images and external resources need internet. Botanical reference, not medical advice.\n\nJoin the tester group using the Google account on your Android phone. After Google approves the release, opt in on Play and install. If the app is unavailable during review, check back after approval. Please try searching, reading and offline use, then send feedback on our Facebook Page. Stay opted in for at least 14 continuous days: Google requires 12 testers before we can apply for production access. Group membership alone does not count as Play opt-in.\n\nSignup instructions: https://ottormastar.aulenor.com/app",
      "ru": "Android-бета отправлена на проверку в Google Play. Приглашаем тестировщиков перед публичным запуском. Это закрытый тест со вступлением через группу, а не неограниченный открытый тест.\n\nВ бете есть иллюстрированный гербарий Якутии и Монголии, поиск, избранное и настройки чтения. Встроенный каталог работает офлайн; изображения в полном разрешении и внешние материалы требуют интернета. Это ботанический справочник, а не медицинские рекомендации.\n\nВступите в группу с аккаунтом Google, который используете на Android. После одобрения Google присоединитесь к тесту в Play и установите приложение. Если во время проверки оно недоступно, попробуйте снова после одобрения. Проверьте поиск, чтение и работу офлайн, затем поделитесь отзывом на нашей странице Facebook. Оставайтесь участником теста 14 дней подряд: Google требует 12 тестировщиков перед запросом доступа к публичному запуску. Вступление в группу не заменяет участие в тесте через Play.\n\nИнструкция: https://ottormastar.aulenor.com/app",
      "mn": "Android бета хувилбарыг Google Play-д хянуулахаар илгээлээ. Нийтэд гаргахаас өмнө туршигчдыг урьж байна. Энэ нь бүлэгт элсэж оролцох хаалттай туршилт бөгөөд хязгаарлалтгүй нээлттэй туршилт биш юм.\n\nЯкут, Монголын ургамлын зурагт гербарий, хайлт, дуртай ургамлын жагсаалт болон унших тохиргоо. Апп доторх каталог офлайн ажиллана; өндөр нягтралтай зураг болон гадаад материалд интернет хэрэгтэй. Энэ бол ургамлын лавлах, эмчилгээний зөвлөгөө биш.\n\nAndroid утсан дээрээ ашигладаг Google бүртгэлээрээ бүлэгт элсээрэй. Google зөвшөөрсний дараа Play дээр туршилтад нэгдэж, аппыг суулгана. Хяналтын үед апп нээгдэхгүй бол зөвшөөрөл гарсны дараа дахин шалгаарай. Хайлт, унших, офлайн ажиллагааг туршиж, манай Facebook хуудсанд санал хүсэлтээ хуваалцаарай. Туршилтад 14 өдөр дараалан бүртгэлтэй байгаарай: нийтэд гаргах эрх хүсэхийн өмнө Google дор хаяж 12 туршигч шаарддаг. Зөвхөн бүлэгт элсэх нь Play дээрх туршилтад нэгдэхийг орлохгүй.\n\nЗаавар: https://ottormastar.aulenor.com/app",
      "zh": "Android 测试版已提交 Google Play 审核。我们邀请大家在正式发布前参与测试。这是通过群组加入的封闭测试，并非不受限制的公开测试。\n\n测试版包含雅库特和蒙古的植物图鉴、搜索、收藏及阅读设置。内置图鉴可离线使用；高分辨率图片和外部资料需要联网。本应用提供植物知识，不提供医疗建议。\n\n请使用 Android 手机上的同一个 Google 账号加入群组。Google 审核通过后，在 Play 页面加入测试并安装应用。审核期间若显示应用不可用，请在审核通过后重试。欢迎测试搜索、阅读和离线使用，并在我们的 Facebook 页面反馈。请连续保留测试资格至少 14 天：申请正式发布权限前，Google 要求至少 12 名测试者连续参与测试。加入群组不等于在 Play 加入测试。\n\n参与说明：https://ottormastar.aulenor.com/app"
    },
    "links": [
      {
        "href": "https://groups.google.com/g/ottormastar-android-testers",
        "label": {
          "sah": "1. Join the tester group",
          "en": "1. Join the tester group",
          "ru": "1. Вступить в группу",
          "mn": "1. Бүлэгт элсэх",
          "zh": "1. 加入测试群组"
        }
      },
      {
        "href": "https://play.google.com/apps/testing/com.aulenor.ottormastar",
        "label": {
          "sah": "2. Opt in on Play after approval",
          "en": "2. Opt in on Play after approval",
          "ru": "2. Присоединиться в Play после одобрения",
          "mn": "2. Зөвшөөрсний дараа Play-д нэгдэх",
          "zh": "2. 审核通过后在 Play 加入测试"
        }
      }
    ]
  },
  {
    "id": "2026-07-mongolia-30",
    "date": "2026-07-18",
    "title": {
      "sah": "Монголия хомуура 30 үүнээйигэ тэнийдэ",
      "ru": "Коллекция Монголии — теперь 30 растений",
      "en": "The Mongolia collection now has 30 plants",
      "mn": "Монголын түүвэр 30 ургамалд хүрлээ",
      "zh": "蒙古植物集已达 30 种"
    },
    "body": {
      "sah": "Саҥа көстүүлэр: уот от, мутугур от, үүт от, ыраас луук, сымнаҕас от уонна Сардаана. Элбэх үүнээйи билигин хас да хаартыскалаах — чугастан ырааҕар.",
      "ru": "Добавлены новые виды: иван-чай, бодяк, молочай, дикий лук, смолёвка и сардаана (лилия). У многих растений теперь несколько фотографий — от крупного плана к общему виду.",
      "en": "New species added: fireweed, thistle, spurge, wild onion, catchfly, and the Sardaana lily. Many plants now have photo galleries — from close-up to wide shot.",
      "mn": "Шинэ зүйлүүд нэмэгдлээ: галт цэцэг, азгана, сүүт өвс, зэрлэг сонгино, цацраа болон Сарана цэцэг. Олон ургамал одоо хэд хэдэн зурагтай — ойроос холд.",
      "zh": "新增物种：柳兰、蓟、大戟、野葱、蝇子草以及萨兰（百合）。许多植物现在配有多张照片——从特写到全景。"
    }
  },
  {
    "id": "2026-07-app-store",
    "date": "2026-07-13",
    "title": {
      "sah": "Оттор Мастар App Store-га тахсыбыта",
      "ru": "«Оттор Мастар» вышел в App Store",
      "en": "Ottor Mastar is on the App Store",
      "mn": "Оттор Мастар App Store дээр гарлаа",
      "zh": "Ottor Mastar 已上架 App Store"
    },
    "body": {
      "sah": "Аппликация билигин iPhone уонна iPad аайы баар — босхо, офлайн үлэлиир. Аҕыйах кэмнэн Mac уонна Android эмиэ кэлиэ.",
      "ru": "Приложение доступно для iPhone и iPad — бесплатно и работает офлайн. Скоро выйдут версии для Mac и Android.",
      "en": "The app is available for iPhone and iPad — free and fully offline. Mac and Android versions are coming soon.",
      "mn": "Аппликейшн iPhone, iPad дээр гарлаа — үнэгүй, офлайн ажиллана. Удахгүй Mac, Android хувилбар гарна.",
      "zh": "应用现已登陆 iPhone 和 iPad——免费且完全离线。Mac 与 Android 版本即将推出。"
    }
  }
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
