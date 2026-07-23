import React, { useState } from 'react';
import { X, Building2, Send, CheckCircle2 } from 'lucide-react';

interface EnterpriseQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseQuoteModal: React.FC<EnterpriseQuoteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [teamSize, setTeamSize] = useState('25');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-copy hover:bg-surface-hover hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h3 className="text-lg font-bold text-foreground">
              Quote Request Sent!
            </h3>
            <p className="text-xs text-muted-copy">
              Our enterprise team will reach out to <strong>{email}</strong>{' '}
              within 2 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border-soft pb-4">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Request Enterprise Custom Plan
                </h3>
                <p className="text-xs text-muted-copy">
                  Custom SAML/SSO, dedicated vocabularies, and volume discounts.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-copy mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cto@company.com"
                className="premium-input w-full px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-copy mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="premium-input w-full px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-copy mb-1">
                Engineering Team Size: {teamSize} Seats
              </label>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <button type="submit" className="public-primary-action w-full mt-2">
              <Send className="h-4 w-4" /> Request Custom Enterprise Quote
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
