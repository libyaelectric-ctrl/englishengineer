import { Mic, MicOff, StopCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { InterviewQuestion } from '../../interview-simulator';

export const RecordingControls = ({
  isRecording,
  isScoring,
  isTimeUp,
  toggleRecording,
}: {
  isRecording: boolean;
  isScoring: boolean;
  isTimeUp: boolean;
  toggleRecording: () => void;
}) => (
  <div className="flex flex-wrap gap-3">
    <Button
      variant={isRecording ? 'danger' : 'secondary'}
      onClick={toggleRecording}
      disabled={isScoring || isTimeUp}
      className={`rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border shadow-sm ${isRecording ? 'bg-rose-600 text-white border-rose-600' : 'border-border-soft text-muted-copy hover:bg-primary/5 hover:text-primary'}`}
    >
      {isRecording ? (
        <>
          <MicOff className="h-4 w-4" /> Stop Recording
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" /> Record Answer
        </>
      )}
    </Button>

    {isRecording && (
      <span className="flex items-center gap-2 text-xs text-rose-600 font-bold uppercase tracking-wider animate-pulse">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shrink-0" />
        Recording in progress...
      </span>
    )}
  </div>
);

export const QuestionCard = ({
  question,
  isTimeUp,
}: {
  question: InterviewQuestion;
  isTimeUp: boolean;
}) => (
  <div
    className={`rounded-[4px] border p-5 shadow-sm ${
      isTimeUp ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/25 bg-primary/5'
    }`}
  >
    <p className="text-xs font-bold uppercase text-primary tracking-wider">
      {question.difficulty.toUpperCase()} · {question.topics.join(', ')}
    </p>
    <p className="mt-2 text-base leading-7 text-foreground font-normal">{question.question}</p>
  </div>
);

export const SubmitBar = ({
  isScoring,
  isLastQuestion,
  submitAnswer,
  resetInterview,
  canSubmit,
}: {
  isScoring: boolean;
  isLastQuestion: boolean;
  submitAnswer: () => void;
  resetInterview: () => void;
  canSubmit: boolean;
}) => (
  <div className="flex items-center gap-3 border-t border-border-soft pt-4">
    <Button
      onClick={submitAnswer}
      disabled={!canSubmit || isScoring}
      className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-[4px] cursor-pointer border border-primary shadow-sm"
    >
      {isScoring ? 'Scoring...' : isLastQuestion ? 'Submit & Finish' : 'Submit & Next'}
    </Button>
    <Button
      variant="outline"
      onClick={resetInterview}
      className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-primary/5 hover:text-primary shadow-sm flex items-center gap-1.5"
    >
      <StopCircle className="h-4 w-4" /> End Interview
    </Button>
  </div>
);
