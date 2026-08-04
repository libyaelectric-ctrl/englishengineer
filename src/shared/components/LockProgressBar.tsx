interface LockProgressBarProps {
  label: string;
  done: number;
  total: number;
}

export const LockProgressBar = ({ label, done, total }: LockProgressBarProps) => {
  const percentage = total > 0 ? Math.min((done / total) * 100, 100) : 0;
  return (
    <>
      <div className="flex justify-between text-muted-copy">
        <span>{label}</span>
        <span className="font-bold text-foreground">
          {done}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </>
  );
};
