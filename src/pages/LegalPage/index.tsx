import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

import { useState } from 'react';

import { PRODUCT_VERSION } from '@/config/product.config';
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
    summary: 'How EngVox collects, processes, stores, and protects your personal and engineering data with privacy-first security practices.',
    badge: 'GDPR / CCPA / KVKK Compliant',
    lastUpdated: 'July 31, 2026',
    sections: [
      ['1. Data Controller & Contact', 'EngVox is responsible for protecting your account, learning progress, and optional practice data. For privacy requests, contact privacy@engvox.com.'],
      ['2. Local-First Learning Data', 'Core practice progress is designed to stay local where possible. Account and subscription data are stored only when needed to provide the service.'],
      ['3. AI Privacy Guarantee', 'Your technical writing, scenarios, documents, and speech practice are not used to train public AI models.'],
      ['4. Security Standards', 'Data in transit uses encrypted connections. Cloud data uses access controls and database security policies.'],
      ['5. Retention & Deletion', 'You can request account deletion and data export. We retain data only as long as needed for service, safety, billing, and legal requirements.'],
    ],
  },
  terms: {
    title: 'Terms of Service & SaaS Agreement',
    summary: 'The terms that govern access to EngVox, subscriptions, acceptable usage, and educational AI assistance.',
    badge: 'International SaaS Standard',
    lastUpdated: 'July 31, 2026',
    sections: [
      ['1. Acceptance of Terms', 'By using EngVox, you agree to these terms and confirm that you are allowed to use the service.'],
      ['2. Service Scope', 'EngVox provides AI-supported technical English practice for engineers across reading, writing, speaking, listening, vocabulary, and grammar.'],
      ['3. Accounts & Security', 'You are responsible for your account credentials and activity. Shared or resold accounts are not allowed.'],
      ['4. Billing & Subscriptions', 'Paid plans renew according to the billing cycle shown at checkout. You can cancel renewal from billing settings where available.'],
      ['5. Educational Disclaimer', 'AI feedback is for language learning and communication practice. It is not engineering, legal, or safety advice.'],
    ],
  },
};

const LegalPage = ({ document = 'privacy' }: { document?: LegalDocument }) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocument>(document);
  const content = documents[activeDoc] || documents.privacy;

  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-24 pt-28 text-slate-950 dark:bg-[#040611] dark:text-white">
      <PageMetadata title={content.title} description={content.summary} />
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_52%,#eef4f8_100%)] dark:bg-[linear-gradient(180deg,#040611_0%,#070b18_54%,#040611_100%)]" />
      <article className="relative mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-200" /><span className="text-sm font-black">EngVox Trust Center</span><span className="rounded-md border border-cyan-200 bg-cyan-50 px-1.5 py-px text-[9px] font-black text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">v{PRODUCT_VERSION}</span></div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-black/20">{(['privacy', 'terms'] as LegalDocument[]).map((docId) => (<button key={docId} onClick={() => setActiveDoc(docId)} className={`rounded-xl px-3 py-1.5 text-xs font-black capitalize transition-all cursor-pointer ${activeDoc === docId ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:text-slate-950 dark:text-white/65 dark:hover:text-white'}`}>{docId === 'privacy' ? 'Gizlilik' : 'Şartlar'}</button>))}</div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] sm:p-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100"><Lock className="h-3 w-3" />{content.badge}</span><span className="text-xs font-bold text-slate-500 dark:text-white/50">Last Updated: {content.lastUpdated}</span></div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200">{content.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">{['Secure by design', 'User data ownership', 'Zero AI model training'].map((x) => (<span key={x} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-200" />{x}</span>))}</div>
        </div>
        <div className="mt-5 space-y-3">{content.sections.map(([title, text]) => (<section key={title} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-2xl transition-all hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.06]"><h2 className="text-base font-black tracking-tight text-slate-950 dark:text-white">{title}</h2><p className="mt-2 text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200">{text}</p></section>))}</div>
      </article>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </main>
  );
};

export default LegalPage;
