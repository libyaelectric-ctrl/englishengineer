import { CheckCircle2, Download, FileText, X } from 'lucide-react';

import { useState } from 'react';

interface InvoiceTaxManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceTaxManagerModal = ({ isOpen, onClose }: InvoiceTaxManagerModalProps) => {
  const [companyName, setCompanyName] = useState('Bechtel International Inc.');
  const [taxId, setTaxId] = useState('VAT-TR-982104921');
  const [billingAddress, setBillingAddress] = useState(
    'Maslak Mah. Büyükdere Cad. No:245, Istanbul, Türkiye'
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Corporate Tax ID & Invoice Manager
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved ? (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center text-xs font-bold text-emerald-600 space-y-2 animate-in fade-in">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
            <div>
              Tax ID & Billing details updated successfully. Automated monthly invoices will include
              this company info.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="company-name"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground block"
              >
                Company Legal Name
              </label>
              <input
                id="company-name"
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 rounded-lg border border-border-soft bg-background px-3 text-xs text-foreground font-bold focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="tax-id"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground block"
              >
                Tax ID / VAT Number
              </label>
              <input
                id="tax-id"
                required
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full h-10 rounded-lg border border-border-soft bg-background px-3 text-xs text-foreground font-bold font-mono focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="billing-address"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground block"
              >
                Official Billing Address
              </label>
              <textarea
                id="billing-address"
                rows={2}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full rounded-lg border border-border-soft bg-background p-2.5 text-xs text-foreground font-medium focus:border-primary outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample Invoice (PDF)</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition cursor-pointer shadow-md"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
