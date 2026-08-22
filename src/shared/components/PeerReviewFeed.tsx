interface PeerReviewItem {
  userId: string;
  answer: string;
  accuracy: number;
  timestamp: string;
}

export function PeerReviewFeed({ items }: { items: PeerReviewItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm text-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-muted-copy">Anonim {item.userId.slice(0, 4)}</span>
            <span
              className={`font-bold ${item.accuracy >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}
            >
              {item.accuracy}%
            </span>
          </div>
          <p className="text-foreground">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
