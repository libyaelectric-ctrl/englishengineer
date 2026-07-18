import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Trophy,
  Layers,
  Code,
  ChevronRight,
  Clock,
  Mic,
  RotateCcw,
  StopCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';

const meta: Meta = {
  title: 'Features/Speaking/InterviewSimulator',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type InterviewState = 'select' | 'interview' | 'results';

const InterviewSimulatorDemo = ({
  initialState,
}: {
  initialState?: InterviewState;
}) => {
  const [state, setState] = useState<InterviewState>(initialState ?? 'select');
  const [selectedType, setSelectedType] = useState<'system-design' | 'coding'>(
    'system-design'
  );

  if (state === 'select') {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Technical Interview Simulator"
          subtitle="Practice System Design and Coding interviews with AI scoring and voice recording"
          icon={Trophy}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setSelectedType('system-design');
                setState('interview');
              }}
              className="group rounded-xl border border-border-soft bg-surface-hover p-6 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Layers className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                System Design
              </h3>
              <p className="mt-2 text-sm text-muted-copy">
                Practice designing scalable systems. Cover architecture,
                trade-offs, and technical decisions.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                Start practice
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('coding');
                setState('interview');
              }}
              className="group rounded-xl border border-border-soft bg-surface-hover p-6 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Code className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                Coding Interview
              </h3>
              <p className="mt-2 text-sm text-muted-copy">
                Solve coding problems aloud. Practice explaining your approach,
                complexity, and edge cases.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                Start practice
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (state === 'results') {
    const scores = [
      {
        overall: 85,
        technicalAccuracy: 90,
        clarity: 80,
        depth: 85,
        communication: 85,
      },
      {
        overall: 72,
        technicalAccuracy: 75,
        clarity: 70,
        depth: 65,
        communication: 78,
      },
    ];
    const overallScore = Math.round(
      scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
    );

    return (
      <div className="space-y-6">
        <SectionCard
          title="Interview Results"
          subtitle={`${selectedType === 'system-design' ? 'System Design' : 'Coding'} interview completed`}
          icon={Trophy}
          footer={
            <Button onClick={() => setState('select')}>
              <RotateCcw className="h-4 w-4" /> New Interview
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-sm font-medium text-primary">Overall Score</p>
              <p className="mt-2 text-4xl font-bold text-foreground">
                {overallScore}
                <span className="text-lg text-muted-copy">/100</span>
              </p>
              <div className="mt-3">
                <ProgressBar value={overallScore} color="primary" />
              </div>
            </div>

            {scores.map((score, i) => (
              <div
                key={i}
                className="rounded-lg border border-border-soft bg-surface-hover p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-copy">
                      Question {i + 1}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {i === 0
                        ? 'Design a URL shortener like bit.ly...'
                        : 'Implement a function to merge two sorted arrays...'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      score.overall >= 80
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {score.overall}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ['Technical', score.technicalAccuracy],
                    ['Clarity', score.clarity],
                    ['Depth', score.depth],
                    ['Communication', score.communication],
                  ].map(([label, value]) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] uppercase text-muted-copy">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  // Interview state
  return (
    <div className="space-y-6">
      <SectionCard
        title={`${selectedType === 'system-design' ? 'System Design' : 'Coding'} Interview`}
        subtitle="Question 1 of 3"
        icon={selectedType === 'system-design' ? Layers : Code}
        headerActions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-copy">
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              04:30
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setState('select')}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <ProgressBar value={33} color="primary" showValue />

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-medium uppercase text-primary">
              MEDIUM · scalability, api-design
            </p>
            <p className="mt-2 text-base leading-7 text-foreground">
              Design a URL shortener like bit.ly. Discuss the API design,
              database schema, and how you would handle high traffic.
            </p>
          </div>

          <div>
            <label htmlFor="answer-textarea" className="block text-sm font-medium text-foreground">
              Your Answer
            </label>
            <p className="mt-1 text-xs text-muted-copy">
              Type your answer or use voice recording to speak your response.
            </p>
            <textarea
              id="answer-textarea"
              className="mt-3 min-h-40 w-full resize-y rounded-lg border border-border-soft bg-surface-hover px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10"
              placeholder="Type your answer here, or click the microphone to speak..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">
              <Mic className="h-4 w-4" /> Record Answer
            </Button>
          </div>

          <div className="flex items-center gap-3 border-t border-border-soft pt-4">
            <Button>Submit & Next</Button>
            <Button variant="ghost" onClick={() => setState('select')}>
              <StopCircle className="h-4 w-4" /> End Interview
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const SelectType: Story = {
  render: () => <InterviewSimulatorDemo initialState="select" />,
};

export const ActiveInterview: Story = {
  render: () => <InterviewSimulatorDemo initialState="interview" />,
};

export const Results: Story = {
  render: () => <InterviewSimulatorDemo initialState="results" />,
};
