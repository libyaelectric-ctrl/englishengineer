import { useLocalizationStore } from '@/features/localization';

import { SOCIAL_PROVIDERS } from './constants';

interface SocialLoginButtonsProps {
  socialLoading: string | null;
  onSocialLogin: (provider: 'google' | 'linkedin' | 'apple') => void;
}

export const SocialLoginButtons = ({ socialLoading, onSocialLogin }: SocialLoginButtonsProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  return (
    <div className="space-y-2.5">
      {SOCIAL_PROVIDERS.map((sp) => {
        const isLoading = socialLoading === sp.provider;
        return (
          <button
            key={sp.provider}
            type="button"
            onClick={() => onSocialLogin(sp.provider)}
            disabled={socialLoading !== null}
            className="flex h-10 w-full items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <span className="h-4 w-4 shrink-0 flex items-center justify-center">{sp.icon}</span>
            )}
            <span className="flex-1 text-center">
              {isLoading
                ? translate('login.connecting')
                : translate('login.continueWith').replace('{name}', sp.name)}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="relative pt-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">
            or
          </span>
        </div>
      </div>
    </div>
  );
};
