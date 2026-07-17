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
      <label
        htmlFor="company-sso-domain"
        className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-foreground"
      >
        Company email domain
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
        <input
          id="company-sso-domain"
          required
          type="text"
          value={ssoDomain}
          onChange={(e) => onSsoDomainChange(e.target.value)}
          className="h-10 w-full rounded-[4px] border border-[#d9d9e3] bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-copy/50 outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/10 transition-colors font-bold shadow-sm"
          placeholder="company.com"
        />
      </div>
      <p className="mt-1.5 text-[10px] leading-4 text-muted-copy font-medium">
        Enter your organization's email domain or provider ID to redirect to
        SAML SSO.
      </p>
    </div>

    <Button
      type="submit"
      disabled={ssoLoading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer"
    >
      {ssoLoading ? 'Connecting to SSO...' : 'Sign in with SSO'}
      {!ssoLoading && <ArrowRight className="h-4 w-4" />}
    </Button>

    <button
      type="button"
      onClick={onBack}
      className="w-full text-center text-xs font-bold uppercase tracking-wider text-muted-copy hover:text-[#0047bb] cursor-pointer py-2"
    >
      ← Back to regular login
    </button>
  </form>
);
