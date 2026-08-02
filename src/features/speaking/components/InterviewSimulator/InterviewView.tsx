import { Clock, Code, Layers, RotateCcw } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';

import {
  type InterviewQuestion,
  type InterviewSession,
  InterviewSimulatorService,
} from '../../simulator/interview-simulator';
import { getInterviewTitle } from '../interview.utils';
import { QuestionCard, RecordingControls, SubmitBar } from './InterviewControls';

export const InterviewView = ({
  session,
  currentQuestion,
  currentAnswer,
  setCurrentAnswer,
  isRecording,
  isScoring,
  timeRemaining,
  toggleRecording,
  submitAnswer,
  resetInterview,
}: {
  session: InterviewSession;
  currentQuestion: InterviewQuestion;
  currentAnswer: string;
  setCurrentAnswer: (v: string) => void;
  isRecording: boolean;
  isScoring: boolean;
  timeRemaining: number;
  toggleRecording: () => void;
  submitAnswer: () => void;
  resetInterview: () => void;
}) => {
  const progress = (session.currentQuestionIndex / session.questions.length) * 100;
  const isTimeUp = timeRemaining === 0;
  const isLastQuestion = session.currentQuestionIndex + 1 === session.questions.length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionCard
        title={`${getInterviewTitle(session.type)} Interview`}
        subtitle={`Question ${session.currentQuestionIndex + 1} of ${session.questions.length}`}
        icon={session.type === 'system-design' ? Layers : Code}
        headerActions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-copy font-bold uppercase">
              <Clock className="mr-1 inline h-3.5 w-3.5 text-primary" />
              {InterviewSimulatorService.formatTime(timeRemaining)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={resetInterview}
              aria-label="Reset interview"
              className="h-8 w-8 rounded-[4px] cursor-pointer border-border-soft hover:bg-primary/5 hover:text-primary"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <ProgressBar value={progress} color="primary" showValue />
          <QuestionCard question={currentQuestion} isTimeUp={isTimeUp} />

          <div>
            <label
              htmlFor="interview-answer"
              className="block text-sm font-bold text-foreground uppercase tracking-wider"
            >
              Your Answer
            </label>
            <p className="mt-1 text-xs text-muted-copy font-medium">
              Type your answer or use voice recording to speak your response.
            </p>
            <textarea
              id="interview-answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={isScoring}
              className="mt-3 min-h-40 w-full resize-y rounded-[4px] border border-border-soft bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 disabled:opacity-50 font-bold placeholder-muted-copy shadow-sm"
              placeholder={
                isTimeUp
                  ? "Time's up! Submit your answer below."
                  : 'Type your answer here, or click the microphone to speak...'
              }
            />
          </div>

          <RecordingControls
            isRecording={isRecording}
            isScoring={isScoring}
            isTimeUp={isTimeUp}
            toggleRecording={toggleRecording}
          />

          <SubmitBar
            isScoring={isScoring}
            isLastQuestion={isLastQuestion}
            submitAnswer={submitAnswer}
            resetInterview={resetInterview}
            canSubmit={Boolean(currentAnswer.trim()) || isTimeUp}
          />
        </div>
      </SectionCard>
    </div>
  );
};
