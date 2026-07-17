import { useMemo, useState } from 'react';
import { Heart, Lock, Plus, Search, Trash2, X } from 'lucide-react';
import {
  SITE_DICTIONARY,
  useWorkToolsStore,
  SiteDictionaryTerm,
} from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useBillingStore, canAccessFeature } from '@/features/billing';
import { storage } from '@/shared/storage';

type CustomDictionaryTerm = Omit<SiteDictionaryTerm, 'tags'> & {
  isCustom?: boolean;
  tags?: string[];
};

export const SiteDictionaryTab = () => {
  const { favoritePhraseIds, toggleFavorite, rememberSearch } =
    useWorkToolsStore();

  const subscription = useBillingStore((state) => state.subscription);
  const hasProjectAccess = canAccessFeature(
    subscription,
    'projectWorkspace'
  ).allowed;

  const [query, setQuery] = useState('');
  const [customTerms, setCustomTerms] = useState<CustomDictionaryTerm[]>(() => {
    return storage.get<CustomDictionaryTerm[]>('custom_dictionary') ?? [];
  });

  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newWrongUsage, setNewWrongUsage] = useState('');
  const [newRelated, setNewRelated] = useState('');
  const [termError, setTermError] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allTerms: CustomDictionaryTerm[] = [
      ...customTerms,
      ...SITE_DICTIONARY,
    ];
    return allTerms.filter((item) =>
      `${item.term} ${item.turkishMeaning} ${item.category}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, customTerms]);

  const handleAddTerm = () => {
    setTermError(null);
    if (!newTerm.trim() || !newMeaning.trim() || !newCategory.trim()) {
      setTermError('Please fill in Term, Meaning, and Category.');
      return;
    }
    const termId = `custom_term_${Date.now()}`;
    const newEntry = {
      id: termId,
      term: newTerm.trim(),
      turkishMeaning: newMeaning.trim(),
      category: newCategory.trim(),
      technicalExplanation:
        newExplanation.trim() || 'Custom terminology added to project scope.',
      siteExample: newExample.trim() || 'No example provided.',
      commonWrongUsage: newWrongUsage.trim() || 'None reported.',
      relatedTerms:
        newRelated
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s) || [],
      isCustom: true,
    };
    const updated = [newEntry, ...customTerms];
    setCustomTerms(updated);
    storage.set('custom_dictionary', updated);

    setNewTerm('');
    setNewMeaning('');
    setNewCategory('');
    setNewExplanation('');
    setNewExample('');
    setNewWrongUsage('');
    setNewRelated('');
    setIsAddingTerm(false);
  };

  const handleDeleteTerm = (id: string) => {
    const updated = customTerms.filter((t) => t.id !== id);
    setCustomTerms(updated);
    storage.set('custom_dictionary', updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <label className="flex-1 flex min-h-11 items-center gap-2 rounded-[4px] border border-[#d9d9e3] bg-white px-4 focus-within:border-[#0047bb] shadow-sm">
          <Search className="h-4 w-4 text-muted-copy" />
          <span className="sr-only">Search site dictionary</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => rememberSearch(query)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') rememberSearch(query);
            }}
            placeholder="Search English, Turkish or category"
            className="w-full bg-transparent text-sm outline-none text-foreground"
          />
        </label>
        <Button
          type="button"
          onClick={() => {
            if (!hasProjectAccess) {
              alert(
                'Custom terminology customization requires the Project Plan ($39/mo) or higher. Please upgrade to customize project vocabulary!'
              );
              return;
            }
            setIsAddingTerm(true);
          }}
          className="gap-1.5 h-11 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {!hasProjectAccess && (
            <Lock className="h-3 w-3 text-white/85 shrink-0" />
          )}
          Add Term
        </Button>
      </div>

      {isAddingTerm && (
        <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#0047bb]/20 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0047bb]">
              Add Custom Terminology
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingTerm(false)}
              className="text-muted-copy hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Term (e.g. Grounding grid)"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
            />
            <input
              type="text"
              placeholder="Turkish Meaning (e.g. Topraklama ağı)"
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
            />
            <input
              type="text"
              placeholder="Category (e.g. electrical, civil)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
            />
          </div>

          <div className="space-y-3">
            <textarea
              placeholder="Technical Explanation"
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              rows={2}
              className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
            />
            <input
              type="text"
              placeholder="Site Example (e.g. The grounding grid installation passed inspection.)"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Common Wrong Usage (e.g. ground grid)"
                value={newWrongUsage}
                onChange={(e) => setNewWrongUsage(e.target.value)}
                className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
              />
              <input
                type="text"
                placeholder="Related Terms (comma-separated)"
                value={newRelated}
                onChange={(e) => setNewRelated(e.target.value)}
                className="rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#0047bb] shadow-sm font-medium"
              />
            </div>
          </div>

          {termError && (
            <p className="text-xs font-bold text-error uppercase tracking-wider">
              {termError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingTerm(false)}
              className="h-9 rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddTerm}
              className="h-9 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer"
            >
              Add to Scope
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredTerms.map((item) => {
          const favorite = favoritePhraseIds.includes(item.id);
          return (
            <Card
              key={item.id}
              className="p-5 space-y-4 rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm flex flex-col justify-between"
              hoverEffect={false}
            >
              <div>
                <div className="flex items-start justify-between border-b border-[#d9d9e3] pb-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
                      {item.category}
                    </p>
                    <h2 className="mt-1 text-sm font-bold text-foreground">
                      {item.term}
                    </h2>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {item.turkishMeaning}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.isCustom && (
                      <Button
                        variant="ghost"
                        className="px-2 text-error hover:bg-error/10 h-8 w-8 inline-flex items-center justify-center rounded-[4px]"
                        onClick={() => handleDeleteTerm(item.id)}
                        aria-label="Delete custom term"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="px-2 h-8 w-8 inline-flex items-center justify-center rounded-[4px] hover:bg-[#faf8ff]"
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={
                        favorite ? 'Remove favorite' : 'Save favorite'
                      }
                    >
                      <Heart
                        className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-copy'}`}
                      />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs leading-5 text-muted-copy font-medium">
                    {item.technicalExplanation}
                  </p>
                  <p className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-3 text-xs text-foreground font-medium shadow-sm">
                    <strong className="text-foreground">Site:</strong>{' '}
                    {item.siteExample}
                  </p>
                  <p className="text-xs text-warning font-medium">
                    <strong className="text-foreground font-bold">
                      Common mistake:
                    </strong>{' '}
                    {item.commonWrongUsage}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                Related: {item.relatedTerms.join(', ')}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
