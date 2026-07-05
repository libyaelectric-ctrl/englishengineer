import { PageMetadata } from '@/shared/components/PageMetadata';
import { ShieldAlert } from 'lucide-react';

export type LegalDocument = 'terms' | 'privacy' | 'cookies' | 'refund';

const documents: Record<
  LegalDocument,
  { title: string; summary: string; sections: Array<[string, string]> }
> = {
  terms: {
    title: 'Terms of Service',
    summary: 'Template terms for using the EngineerOS learning platform.',
    sections: [
      [
        'Service scope',
        'EngineerOS provides engineering communication learning tools, local demo workflows and optional backend integrations.',
      ],
      [
        'Accounts and access',
        'Users are responsible for maintaining account security and using the service lawfully.',
      ],
      [
        'Service availability',
        'Mock, local and unavailable service states are shown honestly and do not guarantee production availability.',
      ],
    ],
  },
  privacy: {
    title: 'Privacy Notice',
    summary:
      'Template explanation of local data, account data and optional service integrations.',
    sections: [
      [
        'Local data',
        'Local-first progress may be stored in the browser and can be removed with browser storage controls.',
      ],
      [
        'Cloud and AI',
        'Cloud synchronization and AI requests occur only when the related backend services are configured.',
      ],
      [
        'Analytics',
        'Product analytics accepts controlled event names and excludes raw writing or speaking content.',
      ],
    ],
  },
  cookies: {
    title: 'Cookie Notice',
    summary:
      'Template notice for essential storage and future consent requirements.',
    sections: [
      [
        'Essential storage',
        'EngineerOS uses browser storage for authentication state, learning progress and interface preferences.',
      ],
      [
        'Optional analytics',
        'Analytics can be disabled by configuration and should be connected to consent controls before public deployment.',
      ],
      [
        'Third parties',
        'Configured authentication, billing and AI services may set or process their own technical identifiers.',
      ],
    ],
  },
  refund: {
    title: 'Refund Policy',
    summary: 'Template refund guidance for future paid EngineerOS plans.',
    sections: [
      [
        'Current status',
        'Live customer billing is not allowed until Kademe 8 Stripe verification passes.',
      ],
      [
        'Future requests',
        'Refund eligibility, time limits and regional rights must be finalized before accepting payments.',
      ],
      [
        'Contact',
        'A verified support and billing contact must be published before commercial launch.',
      ],
    ],
  },
};

const LegalPage = ({ document }: { document: LegalDocument }) => {
  const content = documents[document];
  return (
    <main className="bg-surface py-14">
      <PageMetadata title={content.title} description={content.summary} />
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="public-eyebrow">Product template</p>
        <h1 className="mt-3 text-4xl font-medium text-foreground">
          {content.title}
        </h1>
        <p className="mt-4 leading-7 text-muted-copy">{content.summary}</p>
        <div
          className="mt-8 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm font-medium leading-6 text-foreground"
          role="note"
          aria-label="Legal review required"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>
            This page is a product template and must be reviewed by legal
            counsel before production launch.
          </span>
        </div>
        <div className="mt-8 space-y-8">
          {content.sections.map(([title, text]) => (
            <section key={title} className="border-t border-border-soft pt-6">
              <h2 className="text-xl font-medium text-foreground">{title}</h2>
              <p className="mt-3 leading-7 text-muted-copy">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
};

export default LegalPage;
