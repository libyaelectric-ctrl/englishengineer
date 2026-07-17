import { type ComponentType } from 'react';
import {
  type LessonStatus,
  getStatusLabel,
  STATUS_STYLES,
} from './GrammarPageHelpers';

export const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div>
    <h2 className="text-xs font-black uppercase tracking-wide">{title}</h2>
    {subtitle && (
      <p className="mt-0.5 text-[11px] leading-4 text-muted-copy">{subtitle}</p>
    )}
  </div>
);

export const StatusPill = ({
  status,
  compact: isCompact = false,
}: {
  status: LessonStatus;
  compact?: boolean;
}) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-[4px] border font-bold uppercase tracking-wider ${isCompact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} ${STATUS_STYLES[status]}`}
  >
    {getStatusLabel(status, isCompact)}
  </span>
);

export const LessonBlock = ({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) => (
  <div className="min-w-0 rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-[#0047bb]" />
      <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
        {title}
      </h2>
    </div>
    <p className="mt-2 break-words text-xs leading-relaxed text-muted-copy">
      {body}
    </p>
  </div>
);

export const MasteryPill = ({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${complete ? 'border-success/30 bg-success/5 text-success' : 'border-[#d9d9e3] bg-background text-muted-copy'}`}
  >
    {label}
    <span className="font-bold">{value}</span>
  </span>
);
