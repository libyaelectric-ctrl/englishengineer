import { BookOpenCheck, FileChartColumn } from 'lucide-react';
import { type SevenDayProgressReport } from '@/features/learning-intelligence';
import { BetaService } from '@/features/beta';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export const ProgressReport = ({
  report,
  markReportGenerated,
}: {
  report: SevenDayProgressReport;
  markReportGenerated: () => void;
}) => (
  <Card className="space-y-5 p-5 shadow-sm" hoverEffect={false}>
    <div className="flex items-center gap-3">
      <FileChartColumn className="h-5 w-5 text-[#0047bb]" />
      <div>
        <h2 className="text-xl font-bold text-foreground">
          7-Day Progress Report
        </h2>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-copy">
          Built from existing learning and assessment evidence.
        </p>
      </div>
    </div>
    <dl className="grid gap-3 sm:grid-cols-2">
      {[
        ['Completed tasks', String(report.completedTasks)],
        ['Improved skill', report.improvedSkill],
        ['Weak area', report.weakArea],
        ['Internal progress index', String(report.eloEstimate)],
        ['Engineering CEFR', report.cefrEstimate],
        ['Current learning path', report.currentLevel],
        ['Next week focus', report.nextWeekFocus],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm"
        >
          <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            {label}
          </dt>
          <dd className="mt-2 text-sm font-bold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
        Repeated mistakes
      </p>
      <p className="mt-1 text-sm text-muted-copy font-medium">
        {report.repeatedMistakes.length
          ? report.repeatedMistakes.join(', ')
          : 'No repeated pattern identified yet.'}
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Work Tools
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {report.recommendedWorkTools}
        </p>
      </div>
      <div className="rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Quick AI
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {report.recommendedQuickAIAction}
        </p>
      </div>
      <div className="rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          Phrase category
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {report.recommendedPhraseCategory}
        </p>
      </div>
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
        Recommended next tasks
      </p>
      <ul className="mt-2 space-y-2">
        {report.recommendedNextTasks.map((task) => (
          <li
            key={task}
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <BookOpenCheck className="h-4 w-4 text-success" />
            {task}
          </li>
        ))}
      </ul>
    </div>
    <Button
      variant="secondary"
      onClick={() => {
        markReportGenerated();
        BetaService.trackEvent(
          'seven_day_report_generated',
          '/progress/next-steps'
        );
      }}
      className="w-full h-10 border border-border-soft bg-surface hover:bg-surface-hover text-xs font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-2"
    >
      Mark report reviewed
    </Button>
  </Card>
);
