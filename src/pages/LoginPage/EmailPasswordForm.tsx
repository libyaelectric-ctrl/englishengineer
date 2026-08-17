import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/shared/components/Button';

import { useLocalizationStore } from '@/features/localization';

interface EmailPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  isSignUpMode: boolean;
  isLoading: boolean;
  isLocalAuthBlocked: boolean;
  isSupabaseMode: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onShowSsoForm: () => void;
}

export const EmailPasswordForm = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isSignUpMode,
  isLoading,
  isLocalAuthBlocked,
  onSubmit,
  onForgotPassword,
}: EmailPasswordFormProps) => {
  const translate = useLocalizationStore((state) => state.translate);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {translate('login.emailLabel')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            required
            aria-required="true"
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder={translate('login.emailPlaceholder')}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {translate('login.passwordLabel')}
          </label>
          {!isSignUpMode && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary cursor-pointer transition-colors"
            >
              {translate('login.forgotPassword')}
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            required
            aria-required="true"
            minLength={6}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? translate('login.hidePassword') : translate('login.showPassword')
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || isLocalAuthBlocked}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-sm font-semibold text-white dark:text-zinc-900 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-zinc-900 border-t-transparent" />
        ) : (
          <>
            <span>
              {isSignUpMode ? translate('login.signupButton') : translate('login.loginButton')}
            </span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};
