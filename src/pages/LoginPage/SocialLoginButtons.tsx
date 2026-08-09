import { useLocalizationStore } from '@/features/localization';

import { SOCIAL_PROVIDERS } from './constants';

interface SocialLoginButtonsProps {
  socialLoading: string | null;
  onSocialLogin: (provider: 'google' | 'linkedin' | 'apple') => void;
}

export const SocialLoginButtons = ({ socialLoading, onSocialLogin }: SocialLoginButtonsProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  return (
    <div className="space-y-2">
      {SOCIAL_PROVIDERS.map((sp) => {
        const isLoading = socialLoading === sp.provider;
        return (
          <button
            key={sp.provider}
            type="button"
            onClick={() => onSocialLogin(sp.provider)}
            disabled={socialLoading !== null}
            className="flex h-10 w-full items-center justify-center gap-2.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground transition-all hover:bg-surface-hover hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              sp.icon
            )}
            <span>
              {isLoading
                ? translate('login.connecting')
                : translate('login.continueWith').replace('{name}', sp.name)}
            </span>
          </button>
        );
      })}

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-soft" />
        </div>
        <div className="relative flex justify-center text-[9px]">
          <span className="bg-background px-3 text-muted-copy font-bold uppercase tracking-wider">
            {translate('login.orContinueWith')}
          </span>
        </div>
      </div>
    </div>
  );
};
