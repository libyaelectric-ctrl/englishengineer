import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  Send,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';

type DocType = 'rfi' | 'ncr' | 'rams' | 'eot';

interface DocTemplate {
  id: DocType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
}

const TEMPLATES: DocTemplate[] = [
  {
    id: 'rfi',
    title: 'RFI Generator',
    subtitle: 'Request For Information on drawings or site clashes',
    icon: FileText,
    badge: 'Technical RFI',
  },
  {
    id: 'ncr',
    title: 'NCR Defense Writer',
    subtitle: 'Contest or respond to Non-Conformance Reports',
    icon: AlertTriangle,
    badge: 'QA/QC Dispute',
  },
  {
    id: 'rams',
    title: 'Method Statement (RAMS)',
    subtitle: 'Risk assessment & high-risk activity execution plan',
    icon: ShieldCheck,
    badge: 'Safety & RAMS',
  },
  {
    id: 'eot',
    title: 'EOT & Delay Claim',
    subtitle: 'Extension of Time letter under FIDIC/Contract clauses',
    icon: Clock,
    badge: 'Contract Claim',
  },
];

export const FieldDocAssistant: React.FC = () => {
  const [activeType, setActiveType] = useState<DocType>('rfi');
  const [projectName, setProjectName] = useState('');
  const [clauseRef, setClauseRef] = useState('');
  const [conflictDetails, setConflictDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflictDetails.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      let draftText = '';
      const proj = projectName.trim() || 'PROJECT-ALPHAVOX-2026';
      const ref =
        clauseRef.trim() || 'Specification Section 15400 / FIDIC 20.1';

      if (activeType === 'rfi') {
        draftText = `REQUEST FOR INFORMATION (RFI)\n\nDate: ${new Date().toLocaleDateString()}\nProject: ${proj}\nReference: ${ref}\nSubject: Clarification Required for Technical Site Conflict\n\nDear Resident Engineer,\n\nWe request formal technical clarification regarding the following site condition:\n\n${conflictDetails.trim()}\n\nContractor Evaluation & Proposed Technical Solution:\nBased on applicable engineering standards, we recommend modifying the routing/detail to prevent site stoppage. Kindly confirm if the proposed modification meets the Consultant’s approval.\n\nImpact on Milestone Schedule: Pending Consultant response.\n\nSincerely,\nLead Project Engineer`;
      } else if (activeType === 'ncr') {
        draftText = `RESPONSE & DISPUTE TO NON-CONFORMANCE REPORT (NCR)\n\nDate: ${new Date().toLocaleDateString()}\nProject: ${proj}\nClause / Spec Ref: ${ref}\nSubject: Technical Justification & Rectification Plan for Issued NCR\n\nDear QA/QC Manager,\n\nWe acknowledge receipt of the referenced NCR. Upon detailed engineering inspection, we present the following technical defense:\n\n${conflictDetails.trim()}\n\nCorrective & Preventive Action (CAPA) Plan:\n1. Re-inspection under joint Supervision Engineer presence.\n2. Verification against approved Shop Drawings & Method Statements.\n\nWe request the conditional clearance or complete closure of this NCR based on the above evidence.\n\nSincerely,\nQA/QC Lead Engineer`;
      } else if (activeType === 'rams') {
        draftText = `METHOD STATEMENT & RISK ASSESSMENT (RAMS)\n\nDate: ${new Date().toLocaleDateString()}\nProject: ${proj}\nStandards: ISO 45001 / OSHA Compliance / Spec ${ref}\n\n1. SCOPE OF WORK & DESCRIPTION:\n${conflictDetails.trim()}\n\n2. HAZARD IDENTIFICATION & CONTROL MEASURES:\n- Fall Risk: Full-body safety harnesses, double lanyard, inspected scaffolding.\n- Electrical Risk: LOTO (Lockout/Tagout) protocols and insulated tools.\n- Overhead Hazards: Exclusion zone and certified crane rigging inspection.\n\n3. REQUIRED PERMIT TO WORK (PTW):\nHot Work Permit, Confined Space Entry, Lifting Permit.\n\nApproved By:\nSite HSE Director & Construction Manager`;
      } else {
        draftText = `NOTICE OF DELAY & EXTENSION OF TIME (EOT) CLAIM\n\nDate: ${new Date().toLocaleDateString()}\nProject: ${proj}\nContract Clause: FIDIC Sub-Clause 8.4 / 20.1 (${ref})\n\nDear Employer’s Representative,\n\nIn accordance with Contract conditions, we hereby give formal notice of an event giving rise to delay:\n\n${conflictDetails.trim()}\n\nImpact Analysis:\nThis employer-caused delay directly impacts the critical path of the project baseline schedule. Detailed delay fragnet network analysis will follow within the contractual 28-day window.\n\nWe reserve all rights to claim additional time and cost recovery.\n\nSincerely,\nCommercial & Contracts Manager`;
      }

      setGeneratedLetter(draftText);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Template Selector Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isActive = activeType === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                setActiveType(tmpl.id);
                setGeneratedLetter('');
              }}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0047bb] bg-[#0047bb]/5 shadow-md ring-1 ring-[#0047bb]'
                  : 'border-border-soft bg-surface hover:bg-surface-hover hover:border-border-hover'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-[#0047bb] text-white'
                      : 'bg-surface-hover text-muted-copy'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
                  {tmpl.badge}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {tmpl.title}
              </h3>
              <p className="mt-1 text-xs text-muted-copy leading-relaxed line-clamp-2">
                {tmpl.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Input Form & AI Generator Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 rounded-2xl border border-border-soft bg-surface p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-border-soft pb-3">
            <Sparkles className="h-4 w-4 text-[#0047bb]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Technical Details Input
            </h3>
          </div>

          <div>
            <label
              htmlFor="field-doc-project"
              className="block text-xs font-bold text-muted-copy mb-1"
            >
              Project Name / Site Code
            </label>
            <input
              id="field-doc-project"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Metro Line Extension - Station 4"
              className="w-full rounded-lg border border-border-soft bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#0047bb] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="field-doc-clause"
              className="block text-xs font-bold text-muted-copy mb-1"
            >
              Contract Clause / Spec Reference
            </label>
            <input
              id="field-doc-clause"
              type="text"
              value={clauseRef}
              onChange={(e) => setClauseRef(e.target.value)}
              placeholder="e.g. FIDIC Sub-Clause 20.1 / Spec 15400"
              className="w-full rounded-lg border border-border-soft bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#0047bb] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="field-doc-conflict"
              className="block text-xs font-bold text-muted-copy mb-1"
            >
              Technical Description & Problem
            </label>
            <textarea
              id="field-doc-conflict"
              value={conflictDetails}
              onChange={(e) => setConflictDetails(e.target.value)}
              rows={4}
              placeholder="Describe the clash, site condition, or NCR grounds in plain English..."
              className="w-full rounded-lg border border-border-soft bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#0047bb] focus:outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isGenerating || !conflictDetails.trim()}
            className="w-full flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <span>Drafting Professional Letter...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Generate C1/C2 Field Document</span>
              </>
            )}
          </Button>
        </form>

        {/* Generated Output Preview Box */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border-soft bg-surface p-5 shadow-sm min-h-[360px]">
          <div className="flex items-center justify-between border-b border-border-soft pb-3 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                C1/C2 Engineering Letter Output
              </h3>
            </div>
            {generatedLetter && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-background px-3 py-1 text-xs font-bold text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-copy" />
                    <span>Copy Letter</span>
                  </>
                )}
              </button>
            )}
          </div>

          {generatedLetter ? (
            <pre className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-foreground bg-background p-4 rounded-xl border border-border-soft leading-relaxed">
              {generatedLetter}
            </pre>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border-soft rounded-xl bg-background/50 text-muted-copy space-y-2">
              <FileText className="h-8 w-8 text-muted-copy/60" />
              <p className="text-xs font-semibold">
                Select a document template and enter technical details to draft
                your C1/C2 field letter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldDocAssistant;
