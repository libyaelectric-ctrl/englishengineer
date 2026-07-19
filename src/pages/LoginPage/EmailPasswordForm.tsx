import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';

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
  onShowSsoForm: () => void;
  copy: {
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    signupButton: string;
    forgotPassword: string;
  };
}

export const EmailPasswordForm = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isSignUpMode,
  isLoading,
  isLocalAuthBlocked,
  isSupabaseMode,
  onSubmit,
  onShowSsoForm,
  copy,
}: EmailPasswordFormProps) => (
  <>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground dark:text-[#E2E4E7]">
          {copy.emailLabel}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy dark:text-[#949BA4]" />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-10 w-full rounded-[4px] border border-[#d9d9e3] bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/10 transition-colors font-bold shadow-sm dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#E2E4E7] dark:focus:border-[#3b82f6] dark:focus:ring-[#3b82f6]/10"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground dark:text-[#E2E4E7]">
            {copy.passwordLabel}
          </label>
          {!isSignUpMode && (
            <button
              type="button"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-[#0047bb] cursor-pointer transition-colors dark:text-[#949BA4] dark:hover:text-[#3b82f6]"
            >
              {copy.forgotPassword}
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy dark:text-[#949BA4]" />
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-10 w-full rounded-[4px] border border-[#d9d9e3] bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/10 transition-colors font-bold shadow-sm dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#E2E4E7] dark:focus:border-[#3b82f6] dark:focus:ring-[#3b82f6]/10"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || isLocalAuthBlocked}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer dark:bg-[#3b82f6] dark:hover:bg-[#3b82f6]/90 dark:border-[#3b82f6]"
      >
        {isLoading
          ? 'Loading...'
          : isSignUpMode
            ? copy.signupButton
            : copy.loginButton}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>

    {isSupabaseMode && !isSignUpMode && (
      <button
        type="button"
        onClick={onShowSsoForm}
        className="w-full text-center text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-[#0047bb] cursor-pointer transition-colors pt-2 dark:text-[#949BA4] dark:hover:text-[#3b82f6]"
      >
        Sign in with Single Sign-On (SSO)
      </button>
    )}
  </>
);
