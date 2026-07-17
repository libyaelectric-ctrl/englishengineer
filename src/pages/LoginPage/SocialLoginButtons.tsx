import { SOCIAL_PROVIDERS } from './constants';

interface SocialLoginButtonsProps {
  socialLoading: string | null;
  onSocialLogin: (provider: 'google' | 'linkedin' | 'apple') => void;
  orContinueWith: string;
}

export const SocialLoginButtons = ({
  socialLoading,
  onSocialLogin,
  orContinueWith,
}: SocialLoginButtonsProps) => (
  <div className="space-y-3">
    {SOCIAL_PROVIDERS.map((sp) => {
      const isApple = sp.provider === 'apple';
      return (
        <button
          key={sp.provider}
          type="button"
          onClick={() => onSocialLogin(sp.provider)}
          disabled={socialLoading !== null || isApple}
          className={`flex h-10 w-full items-center justify-center gap-3 rounded-[4px] border text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed cursor-pointer ${
            isApple
              ? 'border-[#d9d9e3] bg-[#faf8ff] text-muted-copy opacity-60'
              : 'border-[#d9d9e3] bg-white text-foreground hover:bg-[#0047bb]/5 hover:border-[#0047bb]/30 disabled:opacity-50'
          }`}
        >
          {socialLoading === sp.provider ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          ) : (
            sp.icon
          )}
          {isApple
            ? `${sp.name} — Coming Soon`
            : socialLoading === sp.provider
              ? 'Connecting...'
              : `Continue with ${sp.name}`}
        </button>
      );
    })}

    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#d9d9e3]" />
      </div>
      <div className="relative flex justify-center text-[10px]">
        <span className="bg-[#faf8ff] px-3 text-muted-copy font-bold uppercase tracking-wider">
          {orContinueWith}
        </span>
      </div>
    </div>
  </div>
);
