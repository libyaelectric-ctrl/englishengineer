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
  <Card className="space-y-5" hoverEffect={false}>
    <div className="flex items-center gap-3">
      <FileChartColumn className="h-5 w-5 text-primary" />
      <div>
        <h2 className="text-xl font-medium text-foreground">
          7-Day Progress Report
        </h2>
        <p className="text-sm text-muted-copy">
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
          className="rounded-xl border border-border-soft bg-surface-hover p-4"
        >
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-copy">
            {label}
          </dt>
          <dd className="mt-2 text-sm font-medium text-foreground">
            {value}
          </dd>
        </div>
      ))}
    </dl>
    <div>
      <p className="text-sm font-medium text-foreground">Repeated mistakes</p>
      <p className="mt-1 text-sm text-muted-copy">
        {report.repeatedMistakes.length
          ? report.repeatedMistakes.join(', ')
          : 'No repeated pattern identified yet.'}
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
        <p className="text-xs font-medium text-muted-copy">Work Tools</p>
        <p className="mt-1 text-sm text-foreground">
          {report.recommendedWorkTools}
        </p>
      </div>
      <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
        <p className="text-xs font-medium text-muted-copy">Quick AI</p>
        <p className="mt-1 text-sm text-foreground">
          {report.recommendedQuickAIAction}
        </p>
      </div>
      <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
        <p className="text-xs font-medium text-muted-copy">
          Phrase category
        </p>
        <p className="mt-1 text-sm text-foreground">
          {report.recommendedPhraseCategory}
        </p>
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">
        Recommended next tasks
      </p>
      <ul className="mt-2 space-y-2">
        {report.recommendedNextTasks.map((task) => (
          <li
            key={task}
            className="flex items-center gap-2 text-sm text-foreground"
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
    >
      Mark report reviewed
    </Button>
  </Card>
);
