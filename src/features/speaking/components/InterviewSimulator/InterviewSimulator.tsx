import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type InterviewQuestion,
  type InterviewScore,
  type InterviewSession,
  InterviewSimulatorService,
  type InterviewType,
} from '../../simulator/interview-simulator';
import { startSpeechRecognition } from '../interview.utils';
import { InterviewView } from './InterviewView';
import { ResultsView } from './ResultsView';
import { SelectView } from './SelectView';

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

    const score = await InterviewSimulatorService.scoreAnswer(answer, currentQuestion);
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

    if (updatedSession.currentQuestionIndex >= updatedSession.questions.length) {
      updatedSession.completedAt = new Date().toISOString();
      setSession(updatedSession);
      setState('results');
    } else {
      setSession(updatedSession);
      setTimeRemaining(
        updatedSession.questions[updatedSession.currentQuestionIndex].timeLimitSeconds
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
      ? Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length)
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
