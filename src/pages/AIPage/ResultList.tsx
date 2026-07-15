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
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <p className="text-[10px] font-mono uppercase tracking-widest font-medium">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-copy leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
