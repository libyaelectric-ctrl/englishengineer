interface ResultListProps {
  title: string;
  items: string[];
  tone: 'success' | 'danger' | 'warning';
}

export const ResultList = ({ title, items, tone }: ResultListProps) => {
  const toneClass = {
    success: 'border-success/20 bg-success/5 text-success',
    danger: 'border-danger/20 bg-danger/5 text-danger',
    warning: 'border-warning/20 bg-warning/5 text-warning',
  }[tone];

  return (
    <div className={`rounded-[4px] border p-5 shadow-sm ${toneClass}`}>
      <p className="text-[9px] font-mono font-bold uppercase tracking-wider">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-xs text-muted-copy font-medium leading-relaxed"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
