export const WritingModelAnswer = ({
  hasSubmitted,
  modelAnswer,
  suggestions = [],
}: {
  hasSubmitted: boolean;
  modelAnswer?: string;
  suggestions?: string[];
}) => {
  if (!hasSubmitted) return null;
  return (
    <section aria-label="Model answer" className="space-y-3">
      <div className="rounded-xl border border-sky-500/20 bg-primary/50/5 p-5">
        <h3 className="text-sm font-black text-sky-300">Model answer</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-copy">
          {modelAnswer || 'No model answer is available for this task.'}
        </p>
      </div>
      {suggestions.length > 0 && (
        <div className="rounded-[16px] border border-border-soft bg-surface-hover p-5">
          <h3 className="text-sm font-black text-foreground">
            Improvement suggestions
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-copy">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
