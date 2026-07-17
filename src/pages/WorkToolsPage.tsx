import { lazy, useMemo, useState } from 'react';
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
  WandSparkles,
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

const PRReviewCoach = lazy(() =>
  import('@/features/work-tools/components/PRReviewCoach').then((m) => ({
    default: m.PRReviewCoach,
  }))
);

type Tab = 'templates' | 'emails' | 'phrases' | 'review-coach';

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
    <div className="space-y-7 animate-in fade-in duration-300 pt-12 sm:pt-0">
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
              ['review-coach', 'PR Review Coach', WandSparkles],
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
            aria-label="Search work tools"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-copy"
          />
        </label>
      </div>

      {tab === 'templates' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {templates.map((item) => (
            <Card
              key={item.id}
              className="space-y-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between border-b border-border-soft pb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">
                  {item.id.toUpperCase()} // TEMPLATE
                </span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-copy">
                  Workflow Specification
                </p>
                <h2 className="mt-1 text-base font-black tracking-tight text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-copy">
                  {item.context}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-copy">
                    [TECHNICAL CONTEXT]
                  </p>
                  <p className="mt-1.5 text-xs text-foreground font-medium">
                    {item.sampleInput}
                  </p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                    [ORCHESTRATED PRODUCTION PHRASE]
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground font-semibold">
                    {item.professionalOutput}
                  </p>
                </div>
              </div>

              <div className="border-t border-border-soft pt-3">
                <p className="text-xs text-muted-copy leading-5">
                  <strong className="text-foreground font-black">
                    Türkçe Açıklama:
                  </strong>{' '}
                  {item.turkishExplanation}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
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
            <Card
              key={item.id}
              className="space-y-4 border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between border-b border-border-soft pb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-secondary font-bold bg-secondary/5 px-2 py-0.5 rounded">
                  {item.id.toUpperCase()} // EMAIL
                </span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-copy">
                  Communication Spec
                </p>
                <h2 className="mt-1 text-base font-black tracking-tight text-foreground">
                  {item.title}
                </h2>
              </div>

              <div className="space-y-3">
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
                    <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-foreground flex items-center justify-between">
                      <span>[VERSION: {label.toUpperCase()}]</span>
                    </summary>
                    <div className="space-y-3 border-t border-border-soft p-4 bg-background">
                      <p className="whitespace-pre-line text-xs leading-relaxed text-foreground font-medium">
                        {text}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border-soft">
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
              </div>

              <div className="border-t border-border-soft pt-3">
                <p className="text-xs text-muted-copy leading-5">
                  <strong className="text-foreground font-black">
                    Türkçe Açıklama:
                  </strong>{' '}
                  {item.turkishExplanation}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'phrases' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {phrases.map((item) => {
            const favorite = favoritePhraseIds.includes(item.id);
            return (
              <Card
                key={item.id}
                className="space-y-3 border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-all duration-300"
                hoverEffect
              >
                <div className="flex items-center justify-between border-b border-border-soft pb-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-500 font-bold bg-cyan-500/5 px-2 py-0.5 rounded">
                    {item.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="px-2 py-1"
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={
                        favorite ? 'Remove favorite' : 'Save favorite'
                      }
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </Button>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black leading-relaxed text-foreground">
                    {item.phrase}
                  </h2>
                </div>
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-foreground">
                    <strong className="text-foreground font-black">
                      Türkçe:
                    </strong>{' '}
                    {item.turkishMeaning}
                  </p>
                  <p className="text-xs text-muted-copy">
                    <strong className="text-foreground font-black">
                      Target Usage:
                    </strong>{' '}
                    {item.usageContext}
                  </p>
                  <p className="rounded-lg border border-border-soft bg-surface-hover p-3 text-xs italic text-foreground leading-relaxed">
                    {item.example}
                  </p>
                </div>
                <div className="pt-2 border-t border-border-soft">
                  <Button
                    variant="secondary"
                    onClick={() => copy(item.id, item.phrase)}
                  >
                    <Clipboard className="h-4 w-4" /> Copy Phrase
                  </Button>
                </div>
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

      {tab === 'review-coach' && <PRReviewCoach />}
    </div>
  );
};

export default WorkToolsPage;
