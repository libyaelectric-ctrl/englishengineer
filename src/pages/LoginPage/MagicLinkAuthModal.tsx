import { ArrowRight, CheckCircle2, Mail, Sparkles, X } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

interface MagicLinkAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const MagicLinkAuthModal = ({
  isOpen,
  onClose,
  initialEmail = '',
}: MagicLinkAuthModalProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { translate } = useLocalizationStore();

  if (!isOpen) return null;

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              {translate('login.magicLinkTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSent ? (
          <div className="text-center py-4 space-y-3 animate-in fade-in">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                {translate('login.magicLinkSent')}
              </h4>
              <p className="text-xs text-muted-copy">
                {translate('login.magicLinkNoPass').replace('{email}', '')}
                <span className="font-bold text-primary font-mono">{email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-[var(--radius-card)] bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
            >
              {translate('login.magicLinkDone')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendLink} className="space-y-4">
            <p className="text-xs text-muted-copy leading-relaxed">
              {translate('login.magicLinkDesc')}
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="magic-email"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground block"
              >
                {translate('login.magicLinkEmail')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
                <input
                  id="magic-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-[var(--radius-card)] border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary font-bold shadow-sm"
                  placeholder="engineer@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-primary hover:bg-primary-hover text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading ? translate('login.magicLinkSending') : translate('login.magicLinkSend')}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
