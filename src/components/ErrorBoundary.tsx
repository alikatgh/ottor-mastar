import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level crash guard (WEB-L10). Wraps <App/> in main.tsx, so it sits ABOVE
 * the i18n provider and the Router — a render crash anywhere in the tree lands
 * here instead of a blank white page.
 *
 * Because it renders outside i18n (which may itself be the thing that crashed)
 * and outside react-router, it cannot use useTranslation() or <Link>. Instead
 * it reads the active language straight off <html lang> (App.tsx keeps this in
 * sync; index.html defaults it to 'sah') and carries inline trilingual copy, so
 * the fallback never depends on the runtime that just failed. The recovery
 * action is a plain full-page reload for the same reason.
 *
 * Styling mirrors NotFoundPage: cream canvas, overline label, serif heading,
 * one forest accent, hairline-free, no shadows.
 */

type Copy = { overline: string; title: string; body: string; reload: string };

const COPY: Record<'sah' | 'ru' | 'en', Copy> = {
  sah: {
    overline: 'Алҕас',
    title: 'Туох эрэ алҕаска барда',
    body: 'Аппликация сыыһа туттунна. Сыаһаны хат аһан көрүөххэ сөп.',
    reload: 'Хат тиэрдэр',
  },
  ru: {
    overline: 'Ошибка',
    title: 'Что-то пошло не так',
    body: 'Приложение неожиданно прервалось. Попробуйте перезагрузить страницу.',
    reload: 'Перезагрузить',
  },
  en: {
    overline: 'Error',
    title: 'Something went wrong',
    body: 'The app hit an unexpected error. Reloading the page usually fixes it.',
    reload: 'Reload',
  },
};

function resolveCopy(): Copy {
  const lang = (typeof document !== 'undefined'
    ? document.documentElement.lang
    : 'sah'
  ).slice(0, 2);
  if (lang === 'ru') return COPY.ru;
  if (lang === 'en') return COPY.en;
  return COPY.sah;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the crash in the console for diagnosis; there is no telemetry
    // backend to report to in this offline-first field guide.
    console.error('Uncaught render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const copy = resolveCopy();

    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="max-w-md w-full px-6 py-12 text-center" role="alert">
          <p className="overline-label mb-4">{copy.overline}</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink leading-tight mb-4">
            {copy.title}
          </h1>
          <p className="text-ink-light text-base leading-relaxed mb-9">
            {copy.body}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="
              inline-flex items-center gap-2
              bg-forest hover:bg-forest-dark text-white
              text-sm font-medium px-5 py-2.5 rounded-[10px]
              transition-colors
            "
          >
            {copy.reload}
          </button>
        </div>
      </div>
    );
  }
}
