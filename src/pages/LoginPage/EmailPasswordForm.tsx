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
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground">
          {copy.emailLabel}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-colors font-bold shadow-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground">
            {copy.passwordLabel}
          </label>
          {!isSignUpMode && (
            <button
              type="button"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-primary cursor-pointer transition-colors"
            >
              {copy.forgotPassword}
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-colors font-bold shadow-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || isLocalAuthBlocked}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-primary hover:bg-primary-hover border border-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm cursor-pointer"
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
        className="w-full text-center text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-primary cursor-pointer transition-colors pt-2"
      >
        Sign in with Single Sign-On (SSO)
      </button>
    )}
  </>
);
