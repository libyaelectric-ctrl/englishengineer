import { storage } from '@/shared/storage';
import { QuickAIDraft, WorkToolsPreferences } from './work-tools.types';

const STORAGE_KEY = 'work_tools_preferences';
const EMPTY_PREFERENCES: WorkToolsPreferences = {
  favoritePhraseIds: [],
  recentItemIds: [],
  recentSearches: [],
  quickAIDraft: null,
};

const normalizePreferences = (
  preferences: WorkToolsPreferences | null
): WorkToolsPreferences => ({
  favoritePhraseIds: preferences?.favoritePhraseIds ?? [],
  recentItemIds: preferences?.recentItemIds ?? [],
  recentSearches: preferences?.recentSearches ?? [],
  quickAIDraft: preferences?.quickAIDraft ?? null,
});

export const WorkToolsService = {
  load(): WorkToolsPreferences {
    return normalizePreferences(
      storage.get<WorkToolsPreferences>(STORAGE_KEY) ?? EMPTY_PREFERENCES
    );
  },

  save(preferences: WorkToolsPreferences): void {
    storage.set(STORAGE_KEY, preferences);
  },

  async copy(text: string): Promise<boolean> {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  },

  remember(
    itemId: string,
    preferences: WorkToolsPreferences
  ): WorkToolsPreferences {
    const next = {
      ...preferences,
      recentItemIds: [
        itemId,
        ...preferences.recentItemIds.filter((id) => id !== itemId),
      ].slice(0, 12),
    };
    this.save(next);
    return next;
  },

  rememberSearch(
    search: string,
    preferences: WorkToolsPreferences
  ): WorkToolsPreferences {
    const normalized = search.trim();
    if (normalized.length < 2) return preferences;
    const next = {
      ...preferences,
      recentSearches: [
        normalized,
        ...preferences.recentSearches.filter(
          (item) => item.toLowerCase() !== normalized.toLowerCase()
        ),
      ].slice(0, 8),
    };
    this.save(next);
    return next;
  },

  toggleFavorite(
    phraseId: string,
    preferences: WorkToolsPreferences
  ): WorkToolsPreferences {
    const exists = preferences.favoritePhraseIds.includes(phraseId);
    const next = {
      ...preferences,
      favoritePhraseIds: exists
        ? preferences.favoritePhraseIds.filter((id) => id !== phraseId)
        : [...preferences.favoritePhraseIds, phraseId],
    };
    this.save(next);
    return next;
  },

  setQuickAIDraft(
    draft: QuickAIDraft,
    preferences: WorkToolsPreferences
  ): WorkToolsPreferences {
    const next = {
      ...this.remember(draft.sourceId, preferences),
      quickAIDraft: draft,
    };
    this.save(next);
    return next;
  },
};
