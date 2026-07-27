import { useState } from 'react';
import { CheckCircle2, FileText, Gauge, KeyRound, ListChecks, RefreshCw } from 'lucide-react';
import {
  type ListeningMission,
  type ListeningEvaluationResult,
} from '@/features/listening/listening.types';
import { AudioPlayer } from '@/features/listening/AudioPlayer';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { AnimatedScore } from './AnimatedScore';
import { QuestionField } from './QuestionField';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;

export const WorkspaceView = ({
  currentMission,
  onBack,
  answers,
  setAnswer,
  summary,
  setSummary,
  userKeywords,
  setUserKeywords,
  submitCurrentMission,
  resetCurrentMission,
  evaluationResult,
}: {
  currentMission: ListeningMission;
  onBack: () => void;
  answers: Record<string, string>;
  setAnswer: (id: string, value: string) => void;
  summary: string;
  setSummary: (v: string) => void;
  userKeywords: string;
  setUserKeywords: (v: string) => void;
  submitCurrentMission: () => void;
  resetCurrentMission: () => void;
  evaluationResult: ListeningEvaluationResult | null;
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(true);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="rounded-[4px] cursor-pointer text-xs h-9 border-border-soft hover:bg-primary/5 hover:text-primary"
          onClick={onBack}
        >
          Back to tasks
        </Button>
        <span className="text-sm font-bold text-muted-copy uppercase tracking-wider">
          {currentMission.cefrLevel} · {currentMission.missionType}
        </span>
      </div>

      <AudioPlayer mission={currentMission} />

      <div className="flex items-center gap-3 rounded-[4px] border border-border-soft bg-surface p-3 shadow-sm">
        <Gauge className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          Playback Speed:
        </span>
        <div className="flex gap-1.5">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setPlaybackSpeed(speed)}
              className={`rounded-[4px] px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                playbackSpeed === speed
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface-hover border-border-soft text-muted-copy hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="rounded-[4px] cursor-pointer text-xs h-9 border-border-soft hover:bg-primary/5 hover:text-primary"
        onClick={() => setShowTranscript((prev) => !prev)}
      >
        {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
      </Button>

      {showTranscript && (
        <SectionCard
          title={currentMission.title}
          subtitle="Read the transcript, then complete all three response modes"
          icon={FileText}
        >
          <div className="whitespace-pre-line rounded-[4px] border border-border-soft bg-surface p-5 text-sm leading-[1.7] text-foreground font-normal shadow-sm">
            {currentMission.transcript}
          </div>
        </SectionCard>
      )}

      {!evaluationResult ? (
        <SectionCard
          title="Comprehension Check"
          subtitle="Multiple choice, fill-gap/short response, and key words"
          icon={ListChecks}
        >
          <div className="space-y-5">
            {currentMission.questions.map((question, index) => (
              <QuestionField
                key={question.id}
                question={question}
                index={index}
                answer={answers[question.id] ?? ''}
                onAnswer={setAnswer}
              />
            ))}

            <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Key words you
                identified
              </span>
              <input
                value={userKeywords}
                onChange={(event) => setUserKeywords(event.target.value)}
                placeholder="Separate key words with commas"
                className="mt-2 w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-primary focus:outline-none font-bold placeholder-muted-copy"
              />
            </label>
            <label className="block text-sm font-bold text-foreground uppercase tracking-wider">
              Short transcript summary
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="mt-2 min-h-[160px] w-full resize-y rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-primary focus:outline-none font-bold placeholder-muted-copy leading-relaxed"
              />
            </label>
            <Button
              onClick={() => submitCurrentMission()}
              disabled={!summary.trim()}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-[4px] cursor-pointer border border-primary shadow-sm"
            >
              Submit transcript task
            </Button>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Deterministic Result"
          subtitle="Local scoring only; no AI or speech evaluation"
          icon={CheckCircle2}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                Final score
              </p>
              <p className="text-2xl font-bold text-foreground">
                <AnimatedScore value={evaluationResult.finalScore} />
              </p>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                Comprehension
              </p>
              <p className="text-2xl font-bold text-foreground">
                <AnimatedScore value={evaluationResult.comprehensionScore} />
              </p>
            </div>
            <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-copy uppercase tracking-wider">
                Key words
              </p>
              <p className="text-2xl font-bold text-foreground">
                <AnimatedScore value={evaluationResult.keywordScore} />
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-foreground font-normal">
            {evaluationResult.feedback}
          </p>
          <Button
            className="mt-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold uppercase tracking-wider text-[10px] h-10 px-5 rounded-[4px] cursor-pointer border border-primary shadow-sm animate-in fade-in"
            onClick={resetCurrentMission}
          >
            Try another response
          </Button>
          <Button
            variant="outline"
            className="mt-4 ml-2 rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-primary/5 hover:text-primary shadow-sm"
            onClick={resetCurrentMission}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Replay Audio
          </Button>
        </SectionCard>
      )}
    </div>
  );
};
