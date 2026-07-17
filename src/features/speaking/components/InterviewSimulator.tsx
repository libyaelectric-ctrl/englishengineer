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
      let finalTranscript = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i] as unknown as {
          isFinal: boolean;
          length: number;
          item: (index: number) => { transcript: string };
        };
        if (result.isFinal) {
          finalTranscript += result.item(0).transcript;
        }
      }
      if (finalTranscript) {
        setCurrentAnswer((prev) =>
          prev ? `${prev} ${finalTranscript}` : finalTranscript
        );
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
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

  const handleTypeSelect = (type: InterviewType) => {
    startInterview(type);
  };

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
              onClick={() => handleTypeSelect('system-design')}
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
              onClick={() => handleTypeSelect('coding')}
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

  if (state === 'results' && session) {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Interview Results"
          subtitle={`${session.type === 'system-design' ? 'System Design' : 'Coding'} interview completed`}
          icon={Trophy}
          footer={
            <Button onClick={resetInterview}>
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
                      {session.questions[i].question.slice(0, 80)}...
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      score.overall >= 80
                        ? 'bg-success/10 text-success'
                        : score.overall >= 60
                          ? 'bg-warning/10 text-warning'
                          : 'bg-error/10 text-error'
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
                <p className="mt-3 text-xs text-muted-copy">{score.feedback}</p>
                {score.strengths.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold uppercase text-success">
                      Strengths
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {score.strengths.map((s, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-1.5 text-xs text-foreground"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-success" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.improvements.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold uppercase text-warning">
                      Improvements
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {score.improvements.map((s, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-1.5 text-xs text-foreground"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-warning" />
                          {s}
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
  }

  if (state === 'interview' && currentQuestion && session) {
    const progress =
      (session.currentQuestionIndex / session.questions.length) * 100;
    const isTimeUp = timeRemaining === 0;

    return (
      <div className="space-y-6">
        <SectionCard
          title={`${session.type === 'system-design' ? 'System Design' : 'Coding'} Interview`}
          subtitle={`Question ${session.currentQuestionIndex + 1} of ${session.questions.length}`}
          icon={session.type === 'system-design' ? Layers : Code}
          headerActions={
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-muted-copy">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                {InterviewSimulatorService.formatTime(timeRemaining)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetInterview}
                aria-label="Reset interview"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <ProgressBar value={progress} color="primary" showValue />

            <div
              className={`rounded-xl border p-5 ${
                isTimeUp
                  ? 'border-error/40 bg-error/5'
                  : 'border-primary/20 bg-primary/5'
              }`}
            >
              <p className="text-xs font-medium uppercase text-primary">
                {currentQuestion.difficulty.toUpperCase()} ·{' '}
                {currentQuestion.topics.join(', ')}
              </p>
              <p className="mt-2 text-base leading-7 text-foreground">
                {currentQuestion.question}
              </p>
            </div>

            <div>
              <label
                htmlFor="interview-answer"
                className="block text-sm font-medium text-foreground"
              >
                Your Answer
              </label>
              <p className="mt-1 text-xs text-muted-copy">
                Type your answer or use voice recording to speak your response.
              </p>
              <textarea
                id="interview-answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isScoring}
                className="mt-3 min-h-40 w-full resize-y rounded-lg border border-border-soft bg-surface-hover px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                placeholder={
                  isTimeUp
                    ? "Time's up! Submit your answer below."
                    : 'Type your answer here, or click the microphone to speak...'
                }
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={isRecording ? 'danger' : 'secondary'}
                onClick={toggleRecording}
                disabled={isScoring || isTimeUp}
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
                <span className="flex items-center gap-2 text-xs text-error">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
                  Recording in progress...
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-border-soft pt-4">
              <Button
                onClick={submitAnswer}
                disabled={(!currentAnswer.trim() && !isTimeUp) || isScoring}
              >
                {isScoring
                  ? 'Scoring...'
                  : session.currentQuestionIndex + 1 ===
                      session.questions.length
                    ? 'Submit & Finish'
                    : 'Submit & Next'}
              </Button>
              <Button variant="ghost" onClick={resetInterview}>
                <StopCircle className="h-4 w-4" /> End Interview
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return null;
};
