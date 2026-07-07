import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenText,
  Bot,
  Check,
  Clipboard,
  FileText,
  Heart,
  Mail,
  Search,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  EMAIL_TEMPLATES,
  ENGINEERING_TEMPLATES,
  PHRASE_LIBRARY,
  WorkToolsService,
  useWorkToolsStore,
} from '@/features/work-tools';
import { BetaService } from '@/features/beta';

type Tab = 'templates' | 'emails' | 'phrases';

const WorkToolsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('templates');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { favoritePhraseIds, toggleFavorite, remember, sendToQuickAI } =
    useWorkToolsStore();

  const normalizedQuery = query.trim().toLowerCase();
  const templates = useMemo(
    () =>
      ENGINEERING_TEMPLATES.filter((item) =>
        `${item.title} ${item.context}`.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );
  const emails = useMemo(
    () =>
      EMAIL_TEMPLATES.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );
  const phrases = useMemo(
    () =>
      PHRASE_LIBRARY.filter((item) =>
        `${item.category} ${item.phrase} ${item.turkishMeaning}`
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery]
  );

  const copy = async (id: string, text: string) => {
    const didCopy = await WorkToolsService.copy(text);
    if (!didCopy) return;
    remember(id);
    BetaService.trackEvent('template_used', '/work-tools');
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const openQuickAI = (
    sourceId: string,
    sourceKind: 'engineering-template' | 'email-template',
    title: string,
    text: string
  ) => {
    sendToQuickAI({ sourceId, sourceKind, title, text });
    navigate('/tools?tab=quick');
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {!embedded && (
        <PageHeader
          title="Work Tools"
          description="Ready-to-use engineering communication for reports, replies, emails and site conversations."
          badgeText="Offline available"
          badgeColor="cyan"
        />
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Work tool type"
        >
          {(
            [
              ['templates', 'Engineering Templates', FileText],
              ['emails', 'Email Templates', Mail],
              ['phrases', 'Phrase Library', BookOpenText],
            ] as const
          ).map(([id, label, Icon]) => (
            <Button
              key={id}
              role="tab"
              aria-selected={tab === id}
              variant={tab === id ? 'primary' : 'ghost'}
              onClick={() => setTab(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border-soft bg-surface-hover px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 md:w-72">
          <Search className="h-4 w-4 text-muted-copy" />
          <span className="sr-only">Search work tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-copy"
          />
        </label>
      </div>

      {tab === 'templates' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {templates.map((item) => (
            <Card key={item.id} className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-primary">
                  Engineering workflow
                </p>
                <h2 className="mt-1 text-xl font-medium text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-copy">
                  {item.context}
                </p>
              </div>
              <div className="rounded-lg border border-border-soft bg-surface-hover p-4">
                <p className="text-xs font-medium text-muted-copy">Sample input</p>
                <p className="mt-2 text-sm text-foreground">
                  {item.sampleInput}
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary">
                  Professional output
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {item.professionalOutput}
                </p>
              </div>
              <p className="text-sm text-muted-copy">
                <strong className="text-foreground">Turkce:</strong>{' '}
                {item.turkishExplanation}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => copy(item.id, item.professionalOutput)}
                >
                  {copiedId === item.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {copiedId === item.id ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    openQuickAI(
                      item.id,
                      'engineering-template',
                      item.title,
                      item.professionalOutput
                    )
                  }
                >
                  <Bot className="h-4 w-4" /> Send to Quick AI
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'emails' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {emails.map((item) => (
            <Card key={item.id} className="space-y-4">
              <h2 className="text-xl font-medium text-foreground">{item.title}</h2>
              {(
                [
                  ['Short', item.shortVersion],
                  ['Professional', item.professionalVersion],
                  ['Polite', item.politeVersion],
                  ['Technical', item.technicalVersion],
                ] as const
              ).map(([label, text]) => (
                <details
                  key={label}
                  className="rounded-lg border border-border-soft bg-surface-hover open:bg-surface"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground">
                    {label} version
                  </summary>
                  <div className="space-y-3 border-t border-border-soft p-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-foreground">
                      {text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => copy(`${item.id}-${label}`, text)}
                      >
                        <Clipboard className="h-4 w-4" /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          openQuickAI(
                            item.id,
                            'email-template',
                            `${item.title} - ${label}`,
                            text
                          )
                        }
                      >
                        <Bot className="h-4 w-4" /> Send to Quick AI
                      </Button>
                    </div>
                  </div>
                </details>
              ))}
              <p className="text-sm text-muted-copy">
                <strong className="text-foreground">Turkce:</strong>{' '}
                {item.turkishExplanation}
              </p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'phrases' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {phrases.map((item) => {
            const favorite = favoritePhraseIds.includes(item.id);
            return (
              <Card key={item.id} className="space-y-3" hoverEffect>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-primary">
                      {item.category}
                    </p>
                    <h2 className="mt-1 text-lg font-medium leading-7 text-foreground">
                      {item.phrase}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    className="px-3"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={favorite ? 'Remove favorite' : 'Save favorite'}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </Button>
                </div>
                <p className="text-sm text-foreground">
                  <strong>Turkce:</strong> {item.turkishMeaning}
                </p>
                <p className="text-sm text-muted-copy">
                  <strong className="text-foreground">Use:</strong>{' '}
                  {item.usageContext}
                </p>
                <p className="rounded-lg border border-border-soft bg-surface-hover p-3 text-sm italic text-foreground">
                  {item.example}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => copy(item.id, item.phrase)}
                >
                  <Clipboard className="h-4 w-4" /> Copy phrase
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {((tab === 'templates' && templates.length === 0) ||
        (tab === 'emails' && emails.length === 0) ||
        (tab === 'phrases' && phrases.length === 0)) && (
        <Card className="py-12 text-center" hoverEffect={false}>
          <Search className="mx-auto h-7 w-7 text-muted-copy" />
          <p className="mt-3 font-medium text-foreground">
            No matching work tool found.
          </p>
        </Card>
      )}
    </div>
  );
};

export default WorkToolsPage;