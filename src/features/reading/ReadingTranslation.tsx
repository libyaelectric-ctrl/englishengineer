import { useState } from 'react';
import { Languages } from 'lucide-react';

export const ReadingTranslation = ({
  translation,
}: {
  translation: string;
}) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="group mt-2">
      <button
        type="button"
        aria-expanded={revealed}
        onClick={() => setRevealed((value) => !value)}
        className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 underline decoration-dotted underline-offset-4"
      >
        <Languages className="h-3.5 w-3.5" /> Turkish translation
      </button>
      <p
        data-testid="reading-translation"
        aria-hidden={!revealed}
        className={`${revealed ? 'block' : 'hidden'} mt-2 rounded-lg border border-sky-500/20 bg-primary/50/5 p-3 text-xs leading-5 text-muted-copy sm:group-hover:block`}
      >
        {translation}
      </p>
    </div>
  );
};
