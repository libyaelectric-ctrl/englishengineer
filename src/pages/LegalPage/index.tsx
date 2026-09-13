import { PRODUCT_VERSION } from '@/config/product.config';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

import { useState } from 'react';

import { PageMetadata } from '@/shared/components/PageMetadata';

import { Footer } from '@/pages/LandingPage/Footer';
import { Navbar } from '@/pages/LandingPage/Navbar';

export type LegalDocument = 'terms' | 'privacy';

interface DocumentContent {
  title: string;
  summary: string;
  badge: string;
  lastUpdated: string;
  sections: Array<[string, string]>;
}

const documents: Record<LegalDocument, DocumentContent> = {
  privacy: {
    title: 'Privacy Policy & Data Protection Standard',
    summary:
      'How EngVox collects, processes, stores, and protects your personal and engineering data with privacy-first security practices.',
    badge: 'GDPR / CCPA / KVKK Compliant',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. Data Controller & Contact',
        'EngVox is responsible for protecting your account, learning progress, and optional practice data. For privacy requests, contact privacy@engvox.com.',
      ],
      [
        '2. Local-First Learning Data',
        'Core practice progress is designed to stay local where possible. Account and subscription data are stored only when needed to provide the service.',
      ],
      [
        '3. AI Privacy Guarantee',
        'Your technical writing, scenarios, documents, and speech practice are not used to train public AI models.',
      ],
      [
        '4. Security Standards',
        'Data in transit uses encrypted connections. Cloud data uses access controls and database security policies.',
      ],
      [
        '5. Retention & Deletion',
        'You can request account deletion and data export. We retain data only as long as needed for service, safety, billing, and legal requirements.',
      ],
    ],
  },
  terms: {
    title: 'Terms of Service & SaaS Agreement',
    summary:
      'The terms that govern access to EngVox, subscriptions, acceptable usage, and educational AI assistance.',
    badge: 'International SaaS Standard',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. Acceptance of Terms',
        'By using EngVox, you agree to these terms and confirm that you are allowed to use the service.',
      ],
      [
        '2. Service Scope',
        'EngVox provides AI-supported technical English practice for engineers across reading, writing, speaking, listening, vocabulary, and grammar.',
      ],
      [
        '3. Accounts & Security',
        'You are responsible for your account credentials and activity. Shared or resold accounts are not allowed.',
      ],
      [
        '4. Billing & Subscriptions',
        'Paid plans renew according to the billing cycle shown at checkout. You can cancel renewal from billing settings where available.',
      ],
      [
        '5. Educational Disclaimer',
        'AI feedback is for language learning and communication practice. It is not engineering, legal, or safety advice.',
      ],
    ],
  },
};

const LegalPage = ({ document = 'privacy' }: { document?: LegalDocument }) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocument>(document);
  const content = documents[activeDoc] || documents.privacy;

  return (
    <main className="min-h-screen bg-background pb-24 pt-28 text-foreground">
      <PageMetadata title={content.title} description={content.summary} />
      <Navbar />
      <article className="relative mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">EngVox Trust Center</span>
            <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-px text-[9px] font-bold text-primary">
              v{PRODUCT_VERSION}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border-soft bg-surface-hover p-1">
            {(['privacy', 'terms'] as LegalDocument[]).map((docId) => (
              <button
                key={docId}
                onClick={() => setActiveDoc(docId)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${activeDoc === docId ? 'bg-primary text-white shadow-sm' : 'text-muted-copy hover:text-foreground'}`}
              >
                {docId === 'privacy' ? 'Gizlilik' : 'Şartlar'}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Lock className="h-3 w-3" />
              {content.badge}
            </span>
            <span className="text-xs font-medium text-muted-copy">
              Last Updated: {content.lastUpdated}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-copy">
            {content.summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border-soft pt-4 text-xs font-medium text-muted-copy">
            {['Secure by design', 'User data ownership', 'Zero AI model training'].map((x) => (
              <span key={x} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {x}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {content.sections.map(([title, text]) => (
            <section
              key={title}
              className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-all hover:border-primary/40"
            >
              <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-copy">{text}</p>
            </section>
          ))}
        </div>
      </article>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default LegalPage;
