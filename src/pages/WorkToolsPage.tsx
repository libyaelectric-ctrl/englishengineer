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

const TemplateCard = ({
  item,
  copiedId,
  copy,
  openQuickAI,
}: {
  item: (typeof ENGINEERING_TEMPLATES)[number];
  copiedId: string | null;
  copy: (id: string, text: string) => void;
  openQuickAI: (
    sourceId: string,
    sourceKind: 'engineering-template' | 'email-template',
    title: string,
    text: string
  ) => void;
}) => (
  <Card className="p-5 space-y-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between border-b border-border-soft pb-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">
        {item.id.toUpperCase()}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-muted-copy">
        Workflow Specification
      </p>
      <h2 className="text-base font-black tracking-tight text-foreground">
        {item.title}
      </h2>
      <p className="text-xs leading-relaxed text-muted-copy">{item.context}</p>
    </div>

    <div className="space-y-3 font-sans">
      <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-3 shadow-sm">
        <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-copy">
          [TECHNICAL CONTEXT]
        </p>
        <p className="mt-1 text-xs text-foreground font-medium">
          {item.sampleInput}
        </p>
      </div>

      <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-3 shadow-sm">
        <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
          [ORCHESTRATED PRODUCTION PHRASE]
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground font-semibold">
          {item.professionalOutput}
        </p>
      </div>
    </div>

    <div className="border-t border-border-soft pt-3">
      <p className="text-xs text-muted-copy leading-5">
        <strong className="text-foreground font-black">Türkçe Açıklama:</strong>{' '}
        {item.turkishExplanation}
      </p>
    </div>
    <div className="flex flex-wrap gap-2 pt-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => copy(item.id, item.professionalOutput)}
      >
        {copiedId === item.id ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Clipboard className="h-3.5 w-3.5" />
        )}
        {copiedId === item.id ? 'Copied' : 'Copy'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          openQuickAI(
            item.id,
            'engineering-template',
            item.title,
            item.professionalOutput
          )
        }
      >
        <Bot className="h-3.5 w-3.5" /> Send to Quick AI
      </Button>
    </div>
  </Card>
);

const EmailCard = ({
  item,
  copy,
  openQuickAI,
}: {
  item: (typeof EMAIL_TEMPLATES)[number];
  copy: (id: string, text: string) => void;
  openQuickAI: (
    sourceId: string,
    sourceKind: 'engineering-template' | 'email-template',
    title: string,
    text: string
  ) => void;
}) => (
  <Card className="p-5 space-y-4 border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between border-b border-border-soft pb-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-secondary font-bold bg-secondary/5 px-2 py-0.5 rounded">
        {item.id.toUpperCase()}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-muted-copy">
        Communication Spec
      </p>
      <h2 className="text-base font-black tracking-tight text-foreground">
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
          className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] open:bg-white shadow-sm"
        >
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-foreground flex items-center justify-between">
            <span>[VERSION: {label.toUpperCase()}]</span>
          </summary>
          <div className="space-y-3 border-t border-[#d9d9e3] p-4 bg-[#faf8ff]">
            <p className="whitespace-pre-line text-xs leading-relaxed text-foreground font-semibold">
              {text}
            </p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#d9d9e3]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copy(`${item.id}-${label}`, text)}
              >
                <Clipboard className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openQuickAI(
                    item.id,
                    'email-template',
                    `${item.title} - ${label}`,
                    text
                  )
                }
              >
                <Bot className="h-3.5 w-3.5" /> Send to Quick AI
              </Button>
            </div>
          </div>
        </details>
      ))}
    </div>

    <div className="border-t border-border-soft pt-3">
      <p className="text-xs text-muted-copy leading-5">
        <strong className="text-foreground font-black">Türkçe Açıklama:</strong>{' '}
        {item.turkishExplanation}
      </p>
    </div>
  </Card>
);

const PhraseCard = ({
  item,
  favorite,
  toggleFavorite,
  copy,
}: {
  item: (typeof PHRASE_LIBRARY)[number];
  favorite: boolean;
  toggleFavorite: (id: string) => void;
  copy: (id: string, text: string) => void;
}) => (
  <Card
    className="p-5 space-y-3 border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-all duration-300"
    hoverEffect
  >
    <div className="flex items-center justify-between border-b border-border-soft pb-2">
      <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-500 font-bold bg-cyan-500/5 px-2 py-0.5 rounded">
        {item.category.toUpperCase()}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-1 min-h-0"
          onClick={() => toggleFavorite(item.id)}
          aria-label={favorite ? 'Remove favorite' : 'Save favorite'}
        >
          <Heart
            className={`h-3.5 w-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </Button>
      </div>
    </div>
    <div>
      <h2 className="text-sm font-black leading-relaxed text-foreground">
        {item.phrase}
      </h2>
    </div>
    <div className="space-y-2 pt-1">
      <p className="text-xs text-foreground">
        <strong className="text-foreground font-black">Türkçe:</strong>{' '}
        {item.turkishMeaning}
      </p>
      <p className="text-xs text-muted-copy">
        <strong className="text-foreground font-black">Target Usage:</strong>{' '}
        {item.usageContext}
      </p>
      <p className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-3 text-xs italic text-foreground leading-relaxed shadow-sm font-medium">
        {item.example}
      </p>
    </div>
    <div className="pt-2 border-t border-border-soft">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => copy(item.id, item.phrase)}
      >
        <Clipboard className="h-3.5 w-3.5" /> Copy Phrase
      </Button>
    </div>
  </Card>
);

const TAB_ITEMS = [
  ['templates', 'Engineering Templates', FileText],
  ['emails', 'Email Templates', Mail],
  ['phrases', 'Phrase Library', BookOpenText],
  ['review-coach', 'PR Review Coach', WandSparkles],
] as const;

const EMPTY_MESSAGES: Record<string, boolean> = {
  templates: true,
  emails: true,
  phrases: true,
};

const hasEmptyResults = (tab: Tab, counts: Record<string, number>) =>
  EMPTY_MESSAGES[tab] && counts[tab] === 0;

const TabContent = ({
  tab,
  templates,
  emails,
  phrases,
  copiedId,
  copy,
  openQuickAI,
  favoritePhraseIds,
  toggleFavorite,
}: {
  tab: Tab;
  templates: typeof ENGINEERING_TEMPLATES;
  emails: typeof EMAIL_TEMPLATES;
  phrases: typeof PHRASE_LIBRARY;
  copiedId: string | null;
  copy: (id: string, text: string) => void;
  openQuickAI: (
    sourceId: string,
    sourceKind: 'engineering-template' | 'email-template',
    title: string,
    text: string
  ) => void;
  favoritePhraseIds: string[];
  toggleFavorite: (id: string) => void;
}) => {
  if (tab === 'templates') {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        {templates.map((item) => (
          <TemplateCard
            key={item.id}
            item={item}
            copiedId={copiedId}
            copy={copy}
            openQuickAI={openQuickAI}
          />
        ))}
      </div>
    );
  }
  if (tab === 'emails') {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        {emails.map((item) => (
          <EmailCard
            key={item.id}
            item={item}
            copy={copy}
            openQuickAI={openQuickAI}
          />
        ))}
      </div>
    );
  }
  if (tab === 'phrases') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {phrases.map((item) => (
          <PhraseCard
            key={item.id}
            item={item}
            favorite={favoritePhraseIds.includes(item.id)}
            toggleFavorite={toggleFavorite}
            copy={copy}
          />
        ))}
      </div>
    );
  }
  return <PRReviewCoach />;
};

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

  const counts = {
    templates: templates.length,
    emails: emails.length,
    phrases: phrases.length,
  };
  const showEmpty = hasEmptyResults(tab, counts);

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

      <div className="flex flex-col gap-4 rounded-[4px] border border-[#d9d9e3] bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Work tool type"
        >
          {TAB_ITEMS.map(([id, label, Icon]) => (
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
        <label className="flex min-h-11 items-center gap-2 rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] px-3 focus-within:border-[#0047bb] md:w-72 shadow-sm font-sans">
          <Search className="h-4 w-4 text-muted-copy" />
          <span className="sr-only">Search work tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools"
            aria-label="Search work tools"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-copy font-semibold"
          />
        </label>
      </div>

      <TabContent
        tab={tab}
        templates={templates}
        emails={emails}
        phrases={phrases}
        copiedId={copiedId}
        copy={copy}
        openQuickAI={openQuickAI}
        favoritePhraseIds={favoritePhraseIds}
        toggleFavorite={toggleFavorite}
      />

      {showEmpty && (
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
