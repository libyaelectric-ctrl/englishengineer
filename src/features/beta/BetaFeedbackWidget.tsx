import { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';
import { useBetaStore } from './beta.store';
import { BetaFeedbackType } from './beta.types';

export const BetaFeedbackWidget = () => {
  const location = useLocation();
  const submitFeedback = useBetaStore((state) => state.submitFeedback);
  const language = useLocalizationStore((state) => state.language);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<BetaFeedbackType>('bug_report');
  const [context, setContext] = useState('');

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const submit = () => {
    if (!message.trim()) return;
    submitFeedback({
      type,
      message: message.trim(),
      difficultyRating: 3,
      missionRating: 3,
      aiFeedbackRating: 3,
      uxRating: 3,
      context: context.trim() || undefined,
      screen: window.location.pathname,
    });
    setMessage('');
    setContext('');
    close();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start lg:items-end justify-end bg-foreground/20 p-3 pt-16 lg:pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-5 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-[min(92vw,400px)] rounded-[20px] border border-border-soft bg-surface p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p
                id="feedback-title"
                className="text-xs font-black uppercase tracking-[0.16em] text-foreground0"
              >
                {LocalizationService.translate('feedback.title', language)}
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-[10px] p-2 text-foreground0 transition hover:bg-surface-hover hover:text-foreground"
                aria-label="Close feedback form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="sr-only" htmlFor="feedback-type">
                {LocalizationService.translate('feedback.type', language)}
              </label>
              <select
                id="feedback-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as BetaFeedbackType)
                }
                className="w-full rounded-[10px] border border-border-soft px-3 py-2 text-sm font-semibold"
              >
                <option value="bug_report">Bug Report</option>
                <option value="content_issue">Content issue</option>
                <option value="ux_problem">UX problem</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
              <label className="sr-only" htmlFor="feedback-message">
                {LocalizationService.translate('feedback.message', language)}
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Tell us what happened, what felt hard, or what would improve the beta."
                className="w-full rounded-[10px] border border-border-soft px-3 py-2 text-sm"
              />
              <label className="sr-only" htmlFor="feedback-context">
                {LocalizationService.translate('feedback.context', language)}
              </label>
              <input
                id="feedback-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder={LocalizationService.translate(
                  'feedback.context',
                  language
                )}
                className="w-full rounded-[10px] border border-border-soft px-3 py-2 text-sm"
              />
              <p className="text-xs leading-5 text-foreground0">
                Screenshot upload is not enabled yet. Add relevant visual
                details to the message.
              </p>
              <div className="flex gap-2">
                <Button onClick={close} variant="secondary" className="flex-1">
                  {LocalizationService.translate('feedback.cancel', language)}
                </Button>
                <Button
                  onClick={submit}
                  disabled={!message.trim()}
                  className="flex-1"
                >
                  {LocalizationService.translate('feedback.submit', language)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-16 lg:top-auto bottom-auto lg:bottom-5 right-3 lg:right-5 z-40 flex h-10 w-10 items-center justify-center rounded-[12px] border border-primary bg-primary text-white shadow-[0_10px_24px_rgba(59,113,143,0.14)] transition-all hover:-translate-y-px hover:border-primary-hover hover:bg-primary-hover"
          aria-label="Open closed beta feedback"
          title={LocalizationService.translate('feedback.open', language)}
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      )}
    </>
  );
};
