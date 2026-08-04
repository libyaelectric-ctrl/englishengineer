import { ArrowRight, Mail } from 'lucide-react';

import { Button } from '@/shared/components/Button';

import { useLocalizationStore } from '@/features/localization';

interface SSOFormProps {
  ssoDomain: string;
  onSsoDomainChange: (value: string) => void;
  ssoLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const SSOForm = ({
  ssoDomain,
  onSsoDomainChange,
  ssoLoading,
  onSubmit,
  onBack,
}: SSOFormProps) => {
  const { translate } = useLocalizationStore();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="company-sso-domain"
          className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground"
        >
          {translate('login.ssoDomain')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
          <input
            id="company-sso-domain"
            required
            type="text"
            value={ssoDomain}
            onChange={(e) => onSsoDomainChange(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-colors font-bold shadow-sm"
            placeholder="company.com"
          />
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-muted-copy font-medium">
          {translate('login.ssoDesc')}
        </p>
      </div>

      <Button
        type="submit"
        disabled={ssoLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-primary hover:bg-primary-hover border border-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm cursor-pointer"
      >
        {ssoLoading ? translate('login.ssoConnecting') : translate('login.ssoSignIn')}
        {!ssoLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-primary cursor-pointer py-2"
      >
        {translate('login.ssoBack')}
      </button>
    </form>
  );
};
