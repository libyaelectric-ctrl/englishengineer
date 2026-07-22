import { Clipboard, Heart } from 'lucide-react';
import {
  MEETING_PHRASES,
  WorkToolsService,
  useWorkToolsStore,
} from '@/features/work-tools';
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
          <Card
            key={item.id}
            className="p-5 space-y-4 rounded-xl border border-[#0047bb]/25 bg-surface/80 shadow-sm hover:border-[#0047bb]/50 transition-all flex flex-col justify-between"
            hoverEffect={false}
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-border-soft pb-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#0047bb]">
                    {item.category}
                  </p>
                  <h2 className="mt-1 text-sm font-bold text-foreground">
                    {item.phrase}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  className="px-2 h-8 w-8 inline-flex items-center justify-center rounded-[4px] hover:bg-surface-hover"
                  onClick={() => toggleFavorite(item.id)}
                  aria-label={favorite ? 'Remove favorite' : 'Save favorite'}
                >
                  <Heart
                    className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-copy'}`}
                  />
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-foreground font-medium">
                  <strong className="text-foreground">Türkçe:</strong>{' '}
                  {item.turkishMeaning}
                </p>
                <p className="text-xs text-muted-copy font-medium">
                  <strong className="text-foreground font-bold">Use:</strong>{' '}
                  {item.whenToUse}
                </p>
                <p className="rounded-[4px] border border-border-soft bg-surface-hover p-3 text-xs italic text-foreground font-medium shadow-sm">
                  {item.example}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => copy(item.phrase)}
              className="mt-4 h-9 rounded-[4px] border border-border-soft bg-surface hover:bg-surface-hover text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm gap-1.5"
            >
              <Clipboard className="h-4 w-4 text-muted-copy" /> Copy
            </Button>
          </Card>
        );
      })}
    </div>
  );
};
