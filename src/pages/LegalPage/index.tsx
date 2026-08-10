import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { PageMetadata } from '@/shared/components/PageMetadata';

export type LegalDocument = 'terms' | 'privacy' | 'cookies' | 'refund';

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
      'How EngVox collects, processes, stores, and protects your personal and engineering data in full compliance with EU GDPR (2016/679), CCPA/CPRA, Turkish KVKK, and SOC-2 Type II security guidelines.',
    badge: 'GDPR / CCPA / KVKK / SOC-2 Compliant',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. Data Controller & International Contact',
        'EngVox Operating Systems Inc. ("EngVox", "we", "us", or "our") acts as the Data Controller responsible for your personal information. For all data privacy inquiries, exercising data subject rights, or contacting our Data Protection Officer (DPO), please email dpo@englishengineer.vercel.app or privacy@englishengineer.vercel.app.',
      ],
      [
        '2. Local-First Architecture & Data Collection',
        'Engineered with a privacy-by-design, local-first architecture, core technical vocabulary drills, grammar progress, and offline practice logs remain stored directly on your device via browser IndexedDB. We collect: (a) Account Information: Email address, encrypted authentication credentials, and display preferences; (b) Technical Telemetry: Anonymized browser type, OS metrics, and request timestamps; (c) Optional Voice & Audio Data: Real-time audio streams processed strictly in-memory during active speech coaching sessions with zero permanent audio retention.',
      ],
      [
        '3. Legal Bases for Data Processing (GDPR Art. 6 / KVKK Art. 5)',
        'We process personal data strictly under lawful legal grounds: (a) Contract Performance (Art. 6(1)(b)): To deliver interactive CEFR coaching, workspace syncing, and subscription access; (b) Legitimate Interests (Art. 6(1)(f)): To maintain platform security, detect unauthorized access, and optimize application performance; (c) Explicit Consent (Art. 6(1)(a)): For voluntary participation in voice speech analysis and optional telemetry analytics.',
      ],
      [
        '4. AI Privacy Guarantee & Zero Model Training Pledge',
        'We strictly enforce enterprise AI privacy standards under ISO/IEC 27001 guidelines. Your technical document uploads, FIDIC contract drafts, engineering scenarios, and oral defense transcripts are processed via private API endpoints and are NEVER utilized by EngVox or any third-party AI providers to train, fine-tune, or improve public AI or Machine Learning models.',
      ],
      [
        '5. Data Storage, Encryption & Security Standards',
        'All cloud data in transit is encrypted using Industry-standard TLS 1.3 protocols. Data at rest is encrypted with AES-256 bit encryption within SOC-2 Type II certified database infrastructure (Supabase PostgreSQL with strict Row Level Security policies). Access is governed by RBAC (Role-Based Access Control) and multi-factor authentication.',
      ],
      [
        '6. Data Retention & Permanent Account Erasure',
        'Account credentials and workspace state are retained only while your account remains active. Anonymized performance metrics are pruned after 90 days. Users may trigger instant, automated account deletion and workspace purge from their Profile settings or by emailing privacy@englishengineer.vercel.app.',
      ],
      [
        '7. International Data Transfers & Safeguards',
        'EngVox operates globally. Where personal data is transferred outside the European Economic Area (EEA) or Turkey, we ensure equivalent protection through standard contractual clauses (SCCs) approved by the European Commission and compliant data processing addendums with our cloud sub-processors (Supabase, Stripe).',
      ],
      [
        '8. Your Global Privacy Rights (GDPR / CCPA / KVKK)',
        'Under applicable international regulations, you possess the right to: (a) Access & Rectification: Request copies of your data and correct inaccuracies; (b) Erasure ("Right to be Forgotten"): Request permanent deletion of personal data; (c) Data Portability: Export your progress data in structured JSON format; (d) Object & Restrict: Opt-out of analytics or object to processing; (e) Non-Discrimination: We do not sell personal data or discriminate against users exercising privacy rights.',
      ],
      [
        '9. Cookies & Local Storage Management',
        'We use strictly essential cookies for authentication session state and load-balancer routing. Non-essential analytics cookies are loaded only upon explicit user opt-in consent. For comprehensive details, review our Cookie Policy.',
      ],
      [
        '10. Supervisory Authority Rights & Dispute Resolution',
        'If you believe your data rights have been infringed, you retain the right to lodge a complaint with your local Data Protection Authority (e.g., EU National DPAs, the UK ICO, or the Turkish Kişisel Verileri Koruma Kurumu - KVKK).',
      ],
    ],
  },
  terms: {
    title: 'Terms of Service & SaaS Agreement',
    summary:
      'International terms, conditions, and SLA standards governing access to and usage of the EngVox engineering communication operating system.',
    badge: 'International SaaS & SLA Standard',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. Acceptance of Terms & International Scope',
        'By creating an account, accessing, or utilizing EngVox ("the Service", "Platform", or "EngVox Operating Systems Inc."), you enter into a legally binding agreement under international SaaS standards (including EU Consumer Rights Directive 2011/83/EU and US E-SIGN Act). If you are agreeing on behalf of an engineering organization, firm, or entity, you represent that you hold full legal authority to bind that entity.',
      ],
      [
        '2. Service Description & Engineering Scope',
        'EngVox provides AI-driven technical English training, CEFR skill evaluations (A1-C2), FIDIC contract writing assistance, technical presentation panels, and 14,199+ domain-specific vocabulary modules across all 10 key engineering disciplines: Architecture, Chemical, Civil, Software Engineering, Electrical, Electronics, HSE, Industrial, Mechanical, and Mechatronics/Robotics.',
      ],
      [
        '3. Account Governance & Security Standards',
        'You are responsible for maintaining the confidentiality of your authentication credentials and for all activities conducted under your account. Single-user licenses are restricted to individual natural persons. Shared, pooled, or resold credentials are strictly prohibited and subject to immediate account termination without refund.',
      ],
      [
        '4. Subscription Billing, Upgrades & Stripe PCI-DSS Compliance',
        'Paid subscriptions (Junior, Senior, Specialist, Master, Team) are processed via Stripe in compliance with PCI-DSS Level 1 security. Subscriptions auto-renew monthly. You may cancel auto-renewal at any time via your Billing settings with zero cancellation fees. Access remains active until the expiration of the current prepaid billing period.',
      ],
      [
        '5. Fair Usage Policy & API Rate Controls',
        'To preserve system reliability and low-latency response times across our infrastructure, EngVox enforces automated rate-limiting tiers. Users shall not deploy automated scrapers, bots, or script wrappers to exploit API endpoints, bypass subscription caps, or tamper with security headers.',
      ],
      [
        '6. AI Educational Disclaimer & Non-Consultancy Notice',
        'AI Coach evaluations, grammar corrections, FIDIC contract suggestion drafts, and oral defense feedback serve strictly as educational communication training aids. They do NOT constitute licensed professional engineering advice, legal counsel, or certified structural safety audits.',
      ],
      [
        '7. Intellectual Property & User Content Ownership',
        'You retain 100% full ownership rights, title, and intellectual property over your submitted text, engineering documents, project notes, and workspace files. EngVox retains exclusive ownership of the underlying application software, UI components, AI prompts, curriculum structures, and branding marks.',
      ],
      [
        '8. Privacy, Data Protection & Zero AI Model Training Guarantee',
        'Your usage of the Service is governed by our Privacy Policy. In accordance with ISO/IEC 27001 and SOC-2 guidelines, EngVox guarantees that your user-submitted text, documents, and voice recordings are NEVER used to train public LLM models.',
      ],
      [
        '9. Limitation of Liability & Warranty Disclaimer',
        'EngVox is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied. To the maximum extent permitted by applicable international law, EngVox shall not be liable for any indirect, incidental, special, or consequential damages resulting from platform usage.',
      ],
      [
        '10. Governing Law, Dispute Resolution & Severability',
        'These Terms shall be governed by and construed in accordance with the laws of Turkey and applicable international trade laws. Any legal disputes shall be subject to the exclusive jurisdiction of the Courts of Istanbul. If any provision is deemed unenforceable, remaining provisions remain in full force.',
      ],
    ],
  },
  cookies: {
    title: 'Cookie & Tracking Policy',
    summary: 'Detailed disclosures regarding cookies, local storage, and tracking technologies.',
    badge: 'Cookie Disclosure Policy',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. Essential Cookies',
        'Required for secure user authentication (Supabase tokens), session integrity, and load balancer affinity. Essential cookies cannot be disabled.',
      ],
      [
        '2. Local Storage & IndexedDB',
        'We utilize browser IndexedDB for offline-first vocabulary caching and local progress tracking to ensure fast, offline application response times.',
      ],
      [
        '3. Analytics & Telemetry',
        'Anonymized page view telemetry is gathered to evaluate feature usage. Users may toggle analytics preferences at any time from Profile settings.',
      ],
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    summary: 'Standard 14-day refund policy and cancellation terms for EngVox subscriptions.',
    badge: '14-Day Money-Back Guarantee',
    lastUpdated: 'July 31, 2026',
    sections: [
      [
        '1. 14-Day Money-Back Guarantee',
        'New subscribers may request a full refund within 14 days of initial purchase if they are unsatisfied with any paid plan (Junior, Senior, Specialist, Master, or Team).',
      ],
      [
        '2. Cancellation Process',
        'You can cancel your subscription at any time with one click from your Billing Settings. Access remains active until the end of your prepaid billing period.',
      ],
      [
        '3. Refund Processing',
        'Approved refunds are credited directly to your original payment method via Stripe within 5-10 business days.',
      ],
    ],
  },
};

const LegalPage = ({ document = 'privacy' }: { document?: LegalDocument }) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocument>(document);
  const content = documents[activeDoc] || documents.privacy;

  return (
    <main className="bg-background min-h-screen py-10 px-4 sm:px-6 md:px-12 text-foreground">
      <PageMetadata title={content.title} description={content.summary} />
      <article className="mx-auto max-w-4xl">
        {/* Navigation Tab Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight text-foreground">
              EngVox Trust Center
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-card)] bg-surface border border-border-soft p-1">
            {(['privacy', 'terms', 'cookies', 'refund'] as LegalDocument[]).map((docId) => (
              <button
                key={docId}
                onClick={() => setActiveDoc(docId)}
                className={`rounded-[var(--radius-card)] px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeDoc === docId
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-copy hover:text-foreground hover:bg-background/50'
                }`}
              >
                {docId === 'privacy'
                  ? 'Privacy'
                  : docId === 'terms'
                    ? 'Terms'
                    : docId === 'cookies'
                      ? 'Cookies'
                      : 'Refund'}
              </button>
            ))}
          </div>
        </div>

        {/* Document Header */}
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft border border-border-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Lock className="h-3 w-3" />
              {content.badge}
            </span>
            <span className="text-xs text-muted-copy font-medium">
              Last Updated: {content.lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {content.title}
          </h1>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-copy max-w-3xl">
            {content.summary}
          </p>

          <div className="mt-4 pt-4 border-t border-border-soft/60 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-copy">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> International SaaS Standard
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Stripe PCI-DSS Level 1
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> User Data Ownership (100%)
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Zero AI Model Training
            </span>
          </div>
        </div>

        {/* Document Sections */}
        <div className="mt-8 space-y-4">
          {content.sections.map(([title, text]) => (
            <section
              key={title}
              className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 sm:p-6 shadow-sm hover:border-primary/30 transition-all"
            >
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {title}
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-copy">{text}</p>
            </section>
          ))}
        </div>

        {/* Footer Link Back to Home */}
        <div className="mt-10 pt-6 border-t border-border-soft flex items-center justify-between text-xs text-muted-copy">
          <span>EngVox Engineering Operating System © 2026</span>
          <Link to="/" className="font-bold text-primary hover:underline">
            Back to Home ➔
          </Link>
        </div>
      </article>
    </main>
  );
};

export default LegalPage;
