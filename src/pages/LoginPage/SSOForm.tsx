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
        className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#1c1d22] dark:text-[#E2E4E7]"
      >
        Company email domain
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b5d72] dark:text-[#949BA4]" />
        <input
          id="company-sso-domain"
          required
          type="text"
          value={ssoDomain}
          onChange={(e) => onSsoDomainChange(e.target.value)}
          className="h-12 w-full rounded-[4px] border border-[#E9ECEF] bg-white pl-10 pr-4 text-sm text-[#1c1d22] placeholder:text-[#5b5d72]/50 outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/10 transition-colors font-bold shadow-sm dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#E2E4E7] dark:focus:border-[#3b82f6] dark:focus:ring-[#3b82f6]/10"
          placeholder="company.com"
        />
      </div>
      <p className="mt-1.5 text-[10px] leading-4 text-[#5b5d72] font-medium dark:text-[#949BA4]">
        Enter your organization's email domain or provider ID to redirect to
        SAML SSO.
      </p>
    </div>

    <Button
      type="submit"
      disabled={ssoLoading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer dark:bg-[#3b82f6] dark:hover:bg-[#3b82f6]/90 dark:border-[#3b82f6]"
    >
      {ssoLoading ? 'Connecting to SSO...' : 'Sign in with SSO'}
      {!ssoLoading && <ArrowRight className="h-4 w-4" />}
    </Button>

    <button
      type="button"
      onClick={onBack}
      className="w-full text-center text-xs font-bold uppercase tracking-wider text-[#5b5d72] hover:text-[#0047bb] cursor-pointer py-2 dark:text-[#949BA4] dark:hover:text-[#3b82f6]"
    >
      ← Back to regular login
    </button>
  </form>
);
