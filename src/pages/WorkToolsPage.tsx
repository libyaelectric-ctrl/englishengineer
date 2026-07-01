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

      <div className="flex flex-col gap-4 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
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
        <label className="flex min-h-11 items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 md:w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Search work tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      {tab === 'templates' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {templates.map((item) => (
            <Card key={item.id} className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                  Engineering workflow
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.context}
                </p>
              </div>
              <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Sample input</p>
                <p className="mt-2 text-sm text-slate-700">
                  {item.sampleInput}
                </p>
              </div>
              <div className="rounded-[12px] border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-xs font-bold text-blue-800">
                  Professional output
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {item.professionalOutput}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">Turkce:</strong>{' '}
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
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
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
                  className="rounded-[12px] border border-slate-200 bg-slate-50 open:bg-white"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-800">
                    {label} version
                  </summary>
                  <div className="space-y-3 border-t border-slate-200 p-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
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
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">Turkce:</strong>{' '}
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
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                      {item.category}
                    </p>
                    <h2 className="mt-1 text-lg font-bold leading-7 text-slate-950">
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
                <p className="text-sm text-slate-700">
                  <strong>Turkce:</strong> {item.turkishMeaning}
                </p>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Use:</strong>{' '}
                  {item.usageContext}
                </p>
                <p className="rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-700">
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
          <Search className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">
            No matching work tool found.
          </p>
        </Card>
      )}
    </div>
  );
};

export default WorkToolsPage;
