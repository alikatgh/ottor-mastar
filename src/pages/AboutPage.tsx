import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Leaf, Heart, Globe, ShieldAlert, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import Footer from '../components/Layout/Footer';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  const features = [
    {
      icon: Leaf,
      color: 'bg-green-50 text-green-600',
      title: {
        sah: '23 үүнээйи',
        ru: '23 растения',
        en: '23 plants',
      },
      desc: {
        sah: 'Саха сирин кыыл үүнээйилэрэ',
        ru: 'Дикорастущие растения Якутии',
        en: 'Wild plants of Yakutia',
      },
    },
    {
      icon: Heart,
      color: 'bg-red-50 text-red-500',
      title: {
        sah: 'Эм оттор',
        ru: 'Лекарственные травы',
        en: 'Medicinal herbs',
      },
      desc: {
        sah: 'Саха народнай эмтиирэтин билиитэ',
        ru: 'Знания якутской народной медицины',
        en: 'Yakut folk medicine knowledge',
      },
    },
    {
      icon: Globe,
      color: 'bg-blue-50 text-blue-500',
      title: {
        sah: '3 тылынан',
        ru: '3 языка',
        en: '3 languages',
      },
      desc: {
        sah: 'Сахалыы, нууччалыы, аҥылычаанныы',
        ru: 'Якутский, русский, английский',
        en: 'Yakut, Russian, English',
      },
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20 sm:pb-6">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="font-heading text-3xl font-bold text-ink mb-4">
            {t('about.title')}
          </h1>

          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-ink">{t('app.title')}</h2>
              <p className="text-sm text-ink-muted">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-6 shadow-card mb-8">
            <p className="text-ink-light text-[15px] leading-relaxed mb-4">
              {t('about.intro')}
            </p>
            <p className="text-ink-light text-[15px] leading-relaxed">
              {t('about.mission')}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map(({ icon: Icon, color, title, desc }, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-0.5">
                    {title[lang]}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {desc[lang]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legal & Privacy entry */}
          <Link
            to="/legal"
            className="flex items-center gap-3 bg-white rounded-2xl p-5 shadow-card no-underline hover:bg-cream-dark/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber/15 text-amber-warm flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-ink">{t('common.legal')}</h3>
              <p className="text-xs text-ink-muted">{t('common.readDisclaimer')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-muted/60 flex-shrink-0" />
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
