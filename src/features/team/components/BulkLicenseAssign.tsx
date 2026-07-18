import { useState, type FC, type FormEvent } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailPlus,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import type { OrganizationRole } from '../team.types';
import type { BulkInviteResult } from '../team.store';
import { useTeamStore } from '../team.store';

interface BulkLicenseAssignProps {
  onResult?: (result: BulkInviteResult) => void;
}

export const BulkLicenseAssign: FC<BulkLicenseAssignProps> = ({ onResult }) => {
  const bulkInviteMembers = useTeamStore((s) => s.bulkInviteMembers);
  const [emailText, setEmailText] = useState('');
  const [role, setRole] =
    useState<Exclude<OrganizationRole, 'admin'>>('learner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BulkInviteResult | null>(null);

  const parsedEmails = emailText
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes('@'));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (parsedEmails.length === 0) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const inviteResult = await bulkInviteMembers(parsedEmails, role);
      setResult(inviteResult);
      onResult?.(inviteResult);
      if (inviteResult.failed.length === 0) {
        setEmailText('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionCard
      title="Bulk License Assignment"
      subtitle="Invite multiple team members at once"
      icon={MailPlus}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bulk-emails" className="block text-sm font-medium text-foreground">
            Email Addresses
          </label>
          <p className="mt-1 text-xs text-muted-copy">
            Enter one email per line, or separate with commas/semicolons.
          </p>
          <textarea
            id="bulk-emails"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows={5}
            placeholder={
              'engineer1@company.com\nengineer2@company.com\nmanager@company.com'
            }
            className="premium-input mt-2 w-full resize-none rounded-lg px-3 py-3 text-sm"
            disabled={isSubmitting}
          />
          {parsedEmails.length > 0 && (
            <p className="mt-1 text-xs text-muted-copy">
              {parsedEmails.length} email{parsedEmails.length !== 1 ? 's' : ''}{' '}
              detected
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bulk-role" className="block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="bulk-role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as Exclude<OrganizationRole, 'admin'>)
              }
              className="premium-input mt-2 w-full rounded-lg px-3 py-3 text-sm"
              disabled={isSubmitting}
            >
              <option value="learner">Learner</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              disabled={parsedEmails.length === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Assign{' '}
                  {parsedEmails.length > 0 ? `${parsedEmails.length} ` : ''}
                  Licenses
                </>
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-2 rounded-lg border border-border-soft p-4">
            {result.succeeded.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {result.succeeded.length} invitation
                  {result.succeeded.length !== 1 ? 's' : ''} created
                  successfully.
                </span>
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="space-y-1">
                {result.failed.map((f) => (
                  <div
                    key={f.email}
                    className="flex items-start gap-2 text-sm text-error"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      <strong>{f.email}</strong>: {f.reason}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </SectionCard>
  );
};
