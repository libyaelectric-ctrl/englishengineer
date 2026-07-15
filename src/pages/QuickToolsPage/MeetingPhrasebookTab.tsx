import { Clipboard, Heart } from 'lucide-react';
import { MEETING_PHRASES, WorkToolsService, useWorkToolsStore } from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export const MeetingPhrasebookTab = () => {
  const { favoritePhraseIds, toggleFavorite } = useWorkToolsStore();

  const copy = async (text: string) => {
    await WorkToolsService.copy(text);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {MEETING_PHRASES.map((item) => {
        const favorite = favoritePhraseIds.includes(item.id);
        return (
          <Card key={item.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-primary">
                  {item.category}
                </p>
                <h2 className="mt-1 text-lg font-medium text-foreground">
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
              <strong>Türkçe:</strong> {item.turkishMeaning}
            </p>
            <p className="text-sm text-muted-copy">
              <strong>Use:</strong> {item.whenToUse}
            </p>
            <p className="rounded-xl border border-border-soft bg-surface-hover p-3 text-sm italic text-foreground">
              {item.example}
            </p>
            <Button
              variant="secondary"
              onClick={() => copy(item.phrase)}
            >
              <Clipboard className="h-4 w-4" /> Copy
            </Button>
          </Card>
        );
      })}
    </div>
  );
};
