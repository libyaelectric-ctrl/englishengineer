import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isTaskCompletedToday } from '@/features/learning-intelligence';
import { BetaService } from '@/features/beta';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

type Task = {
  id: string;
  module: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  route: string;
};

export const TaskGrid = ({
  tasks,
  completedTaskDates,
  toggleTask,
  careerRole,
}: {
  tasks: Task[];
  completedTaskDates: Record<string, string>;
  toggleTask: (taskId: string) => void;
  careerRole: string;
}) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-medium text-foreground">
          Today's Engineering Communication Tasks
        </h2>
        <p className="mt-1 text-sm text-muted-copy">
          A balanced six-skill plan ordered for {careerRole}.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task, index) => {
          const completed = isTaskCompletedToday(
            task.id,
            completedTaskDates
          );
          return (
            <Card key={task.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    Priority {index + 1} · {task.module}
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-foreground">
                    {task.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    toggleTask(task.id);
                    if (!completed) {
                      BetaService.trackEvent(
                        'daily_task_completed',
                        '/progress/next-steps'
                      );
                    }
                  }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${completed ? 'border-success bg-success/10 text-success' : 'border-border-soft bg-surface text-muted-copy hover:border-primary hover:bg-primary/10'}`}
                  aria-label={
                    completed ? 'Mark task incomplete' : 'Mark task complete'
                  }
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
              <p className="flex-1 text-sm leading-6 text-muted-copy">
                {task.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-copy">
                  {task.estimatedMinutes} min
                </span>
                <Button
                  variant="secondary"
                  onClick={() => navigate(task.route)}
                >
                  Open task
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
