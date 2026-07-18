import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Trophy,
  Clock,
  Code,
  Layers,
  ChevronRight,
  StopCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import {
  InterviewSimulatorService,
  type InterviewSession,
  type InterviewType,
  type InterviewQuestion,
  type InterviewScore,
} from '../interview-simulator';

type InterviewState = 'select' | 'interview' | 'results';

const SelectView = ({
  onSelect,
}: {
  onSelect: (type: InterviewType) => void;
}) => (
  <div className="space-y-6 animate-in fade-in">
    <SectionCard
      title="Technical Interview Simulator"
      subtitle="Practice System Design and Coding interviews with AI scoring and voice recording"
      icon={Trophy}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('system-design')}
          className="group rounded-[4px] border border-[#d9d9e3] bg-white p-6 text-left transition-all hover:border-[#0047bb]/40 hover:bg-[#0047bb]/5 shadow-sm cursor-pointer"
        >
          <Layers className="h-8 w-8 text-[#0047bb]" />
          <h3 className="mt-3 text-lg font-bold text-foreground tracking-tight">
            System Design
          </h3>
          <p className="mt-2 text-sm text-muted-copy font-normal">
            Practice designing scalable systems. Cover architecture, trade-offs,
            and technical decisions.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0047bb] uppercase tracking-wider">
            Start practice
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('coding')}
          className="group rounded-[4px] border border-[#d9d9e3] bg-white p-6 text-left transition-all hover:border-[#0047bb]/40 hover:bg-[#0047bb]/5 shadow-sm cursor-pointer"
        >
          <Code className="h-8 w-8 text-[#0047bb]" />
          <h3 className="mt-3 text-lg font-bold text-foreground tracking-tight">
            Coding Interview
          </h3>
          <p className="mt-2 text-sm text-muted-copy font-normal">
            Solve coding problems aloud. Practice explaining your approach,
            complexity, and edge cases.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0047bb] uppercase tracking-wider">
            Start practice
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </SectionCard>
  </div>
);

const ResultsView = ({
  session,
  scores,
  overallScore,
  onReset,
}: {
  session: InterviewSession;
  scores: InterviewScore[];
  overallScore: number;
  onReset: () => void;
}) => (
  <div className="space-y-6 animate-in fade-in">
    <SectionCard
      title="Interview Results"
      subtitle={`${session.type === 'system-design' ? 'System Design' : 'Coding'} interview completed`}
      icon={Trophy}
      footer={
        <Button
          onClick={onReset}
          className="rounded-[4px] cursor-pointer bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 shadow-sm flex items-center gap-1.5"
        >
          <RotateCcw className="h-4 w-4" /> New Interview
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-6 text-center shadow-sm">
          <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-wider">
            Overall Score
          </p>
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
            className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-copy tracking-wider">
                  Question {i + 1}
                </p>
                <p className="mt-1 text-sm text-foreground font-medium leading-relaxed">
                  {session.questions[i].question.slice(0, 80)}...
                </p>
              </div>
              <span
                className={`rounded-[4px] px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  score.overall >= 80
                    ? 'bg-success/10 text-success border border-success/20'
                    : score.overall >= 60
                      ? 'bg-warning/10 text-warning border border-warning/20'
                      : 'bg-error/10 text-error border border-error/20'
                }`}
              >
                {score.overall}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-[#d9d9e3] pt-3">
              {[
                ['Technical', score.technicalAccuracy],
                ['Clarity', score.clarity],
                ['Depth', score.depth],
                ['Communication', score.communication],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="text-center bg-[#f3f3fd] p-2 rounded-[4px] border border-[#d9d9e3]"
                >
                  <p className="text-[9px] uppercase text-muted-copy font-bold tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {value}%
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-copy font-medium leading-relaxed italic">
              &quot;{score.feedback}&quot;
            </p>
            {score.strengths.length > 0 && (
              <div className="mt-3 border-t border-[#d9d9e3] pt-3">
                <p className="text-[10px] font-bold uppercase text-success tracking-wider">
                  Strengths
                </p>
                <ul className="mt-1 space-y-1">
                  {score.strengths.map((s, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-1.5 text-xs text-foreground font-medium"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {score.improvements.length > 0 && (
              <div className="mt-3 border-t border-[#d9d9e3] pt-3">
                <p className="text-[10px] font-bold uppercase text-warning tracking-wider">
                  Improvements
                </p>
                <ul className="mt-1 space-y-1">
                  {score.improvements.map((s, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-1.5 text-xs text-foreground font-medium"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  </div>
);

const startSpeechRecognition = (
  w: Record<string, unknown>,
  setCurrentAnswer: React.Dispatch<React.SetStateAction<string>>,
  recognitionRef: React.MutableRefObject<unknown>,
  setIsRecording: (v: boolean) => void
) => {
  const SpeechRecognitionConstructor = (w.SpeechRecognition ||
    w.webkitSpeechRecognition) as new () => {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: unknown) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    stop: () => void;
    start: () => void;
  };
  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: unknown) => {
    const e = event as { results: SpeechRecognitionResultList };
    const finalTranscript = Array.from({ length: e.results.length }, (_, i) => {
      const result = e.results[i] as unknown as {
        isFinal: boolean;
        item: (index: number) => { transcript: string };
      };
      return result.isFinal ? result.item(0).transcript : '';
    }).join('');
    if (finalTranscript) {
      setCurrentAnswer((prev) =>
        prev ? `${prev} ${finalTranscript}` : finalTranscript
      );
    }
  };

  recognition.onerror = () => setIsRecording(false);
  recognition.onend = () => setIsRecording(false);

  recognitionRef.current = recognition;
  recognition.start();
  setIsRecording(true);
};

const getInterviewTitle = (type: InterviewType) =>
  type === 'system-design' ? 'System Design' : 'Coding';

const RecordingControls = ({
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
      className={`rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border shadow-sm ${isRecording ? 'bg-rose-600 text-white border-rose-600' : 'border-[#d9d9e3] text-muted-copy hover:bg-[#0047bb]/5 hover:text-[#0047bb]'}`}
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

const QuestionCard = ({
  question,
  isTimeUp,
}: {
  question: InterviewQuestion;
  isTimeUp: boolean;
}) => (
  <div
    className={`rounded-[4px] border p-5 shadow-sm ${
      isTimeUp
        ? 'border-rose-500/30 bg-rose-500/5'
        : 'border-[#0047bb]/25 bg-[#0047bb]/5'
    }`}
  >
    <p className="text-xs font-bold uppercase text-[#0047bb] tracking-wider">
      {question.difficulty.toUpperCase()} · {question.topics.join(', ')}
    </p>
    <p className="mt-2 text-base leading-7 text-foreground font-normal">
      {question.question}
    </p>
  </div>
);

const SubmitBar = ({
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
  <div className="flex items-center gap-3 border-t border-[#d9d9e3] pt-4">
    <Button
      onClick={submitAnswer}
      disabled={!canSubmit || isScoring}
      className="bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-[4px] cursor-pointer border border-[#0047bb] shadow-sm"
    >
      {isScoring
        ? 'Scoring...'
        : isLastQuestion
          ? 'Submit & Finish'
          : 'Submit & Next'}
    </Button>
    <Button
      variant="outline"
      onClick={resetInterview}
      className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-[#d9d9e3] hover:bg-[#0047bb]/5 hover:text-[#0047bb] shadow-sm flex items-center gap-1.5"
    >
      <StopCircle className="h-4 w-4" /> End Interview
    </Button>
  </div>
);

const InterviewView = ({
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
  const progress =
    (session.currentQuestionIndex / session.questions.length) * 100;
  const isTimeUp = timeRemaining === 0;
  const isLastQuestion =
    session.currentQuestionIndex + 1 === session.questions.length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionCard
        title={`${getInterviewTitle(session.type)} Interview`}
        subtitle={`Question ${session.currentQuestionIndex + 1} of ${session.questions.length}`}
        icon={session.type === 'system-design' ? Layers : Code}
        headerActions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-copy font-bold uppercase">
              <Clock className="mr-1 inline h-3.5 w-3.5 text-[#0047bb]" />
              {InterviewSimulatorService.formatTime(timeRemaining)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={resetInterview}
              aria-label="Reset interview"
              className="h-8 w-8 rounded-[4px] cursor-pointer border-[#d9d9e3] hover:bg-[#0047bb]/5 hover:text-[#0047bb]"
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
              className="mt-3 min-h-40 w-full resize-y rounded-[4px] border border-[#d9d9e3] bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-[#0047bb] focus:bg-white focus:ring-2 focus:ring-[#0047bb]/10 disabled:opacity-50 font-bold placeholder-muted-copy shadow-sm"
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

export const InterviewSimulator = () => {
  const [state, setState] = useState<InterviewState>('select');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [scores, setScores] = useState<InterviewScore[]>([]);
  const [isScoring, setIsScoring] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<unknown>(null);

  const currentQuestion: InterviewQuestion | null = session
    ? InterviewSimulatorService.getCurrentQuestion(session)
    : null;

  const startInterview = useCallback((type: InterviewType) => {
    const newSession = InterviewSimulatorService.createSession(type);
    setSession(newSession);
    setTimeRemaining(newSession.questions[0].timeLimitSeconds);
    setCurrentAnswer('');
    setScores([]);
    setState('interview');
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state !== 'interview' || !currentQuestion) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return stopTimer;
  }, [state, currentQuestion, stopTimer]);

  const toggleRecording = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    if (!('webkitSpeechRecognition' in w) && !('SpeechRecognition' in w)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      const rec = recognitionRef.current as { stop: () => void } | null;
      if (rec) rec.stop();
      setIsRecording(false);
      return;
    }

    startSpeechRecognition(w, setCurrentAnswer, recognitionRef, setIsRecording);
  }, [isRecording]);

  const submitAnswer = useCallback(async () => {
    if (!session || !currentQuestion) return;
    stopTimer();
    setIsScoring(true);

    const answer = {
      questionId: currentQuestion.id,
      transcript: currentAnswer,
      timeSpentSeconds: currentQuestion.timeLimitSeconds - timeRemaining,
      recordingSeconds: currentQuestion.timeLimitSeconds - timeRemaining,
    };

    const score = await InterviewSimulatorService.scoreAnswer(
      answer,
      currentQuestion
    );
    const updatedSession: InterviewSession = {
      ...session,
      answers: [...session.answers, answer],
      scores: [...session.scores, score],
      currentQuestionIndex: session.currentQuestionIndex + 1,
    };

    setScores((prev) => [...prev, score]);
    setCurrentAnswer('');
    setTimeRemaining(0);
    setIsScoring(false);

    if (
      updatedSession.currentQuestionIndex >= updatedSession.questions.length
    ) {
      updatedSession.completedAt = new Date().toISOString();
      setSession(updatedSession);
      setState('results');
    } else {
      setSession(updatedSession);
      setTimeRemaining(
        updatedSession.questions[updatedSession.currentQuestionIndex]
          .timeLimitSeconds
      );
    }
  }, [session, currentQuestion, currentAnswer, timeRemaining, stopTimer]);

  const resetInterview = useCallback(() => {
    stopTimer();
    const rec = recognitionRef.current as { abort: () => void } | null;
    if (rec) rec.abort();
    setSession(null);
    setCurrentAnswer('');
    setIsRecording(false);
    setTimeRemaining(0);
    setScores([]);
    setState('select');
  }, [stopTimer]);

  const overallScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
        )
      : 0;

  if (state === 'select') {
    return <SelectView onSelect={startInterview} />;
  }

  if (state === 'results' && session) {
    return (
      <ResultsView
        session={session}
        scores={scores}
        overallScore={overallScore}
        onReset={resetInterview}
      />
    );
  }

  if (state === 'interview' && currentQuestion && session) {
    return (
      <InterviewView
        session={session}
        currentQuestion={currentQuestion}
        currentAnswer={currentAnswer}
        setCurrentAnswer={setCurrentAnswer}
        isRecording={isRecording}
        isScoring={isScoring}
        timeRemaining={timeRemaining}
        toggleRecording={toggleRecording}
        submitAnswer={submitAnswer}
        resetInterview={resetInterview}
      />
    );
  }

  return null;
};
