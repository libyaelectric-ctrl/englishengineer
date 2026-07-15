import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';

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
}: SSOFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">
        Company email domain
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
        <input
          required
          type="text"
          value={ssoDomain}
          onChange={(e) => onSsoDomainChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-border-soft bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-border-hover transition-colors"
          placeholder="company.com"
        />
      </div>
      <p className="mt-1.5 text-[10px] leading-4 text-muted-copy">
        Enter your organization's email domain or provider ID to redirect to
        SAML SSO.
      </p>
    </div>

    <Button
      type="submit"
      disabled={ssoLoading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90 transition-opacity"
    >
      {ssoLoading ? 'Connecting to SSO...' : 'Sign in with SSO'}
      {!ssoLoading && <ArrowRight className="h-4 w-4" />}
    </Button>

    <button
      type="button"
      onClick={onBack}
      className="w-full text-center text-xs font-medium text-muted-copy hover:text-foreground transition-colors py-2"
    >
      ← Back to regular login
    </button>
  </form>
);
