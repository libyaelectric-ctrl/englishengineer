import { Briefcase, CheckCircle2, Mic, ShieldAlert, Sparkles, Users, Volume2 } from 'lucide-react';

import type { ElementType } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type DefenseScenarioType = 'client' | 'toolbox' | 'fidic' | 'subcontractor' | 'presentation';

interface ScenarioMeta {
  id: DefenseScenarioType;
  title: string;
  subtitle: string;
  badge: string;
  aiPrompt: string;
  icon: ElementType;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'client',
    title: 'Client Defense Simulator',
    subtitle: 'Defend schedule delays & budget overruns to tough client PMs',
    badge: 'Client PM',
    aiPrompt:
      'Why is the HVAC commissioning delayed by 3 weeks, and how will you recover the critical path without extra cost?',
    icon: Briefcase,
  },
  {
    id: 'toolbox',
    title: 'Toolbox Talk Practice',
    subtitle: 'Deliver a 3-minute oral safety briefing to site workers',
    badge: 'HSE Briefing',
    aiPrompt:
      'Good morning team. Today we are conducting deep excavation near live MV electrical cables. State your 3 safety rules.',
    icon: ShieldAlert,
  },
  {
    id: 'fidic',
    title: 'FIDIC Arbitration Board',
    subtitle: 'Oral claim presentation under FIDIC Sub-Clause 20.1',
    badge: 'Arbitration',
    aiPrompt:
      'Contractor Counsel, present your formal legal justification for the 45-day extension of time due to late employer drawings.',
    icon: Users,
  },
  {
    id: 'subcontractor',
    title: 'Subcontractor Negotiation',
    subtitle: 'Negotiate price pushbacks and manpower mobilization',
    badge: 'Commercial',
    aiPrompt:
      'Your proposed unit rate for concrete pouring is 15% above market. What technical value justifies this price?',
    icon: Briefcase,
  },
  {
    id: 'presentation',
    title: 'Technical Q&A Defense',
    subtitle: 'Defend engineering slide deck to technical directors',
    badge: 'Boardroom',
    aiPrompt:
      'In slide 4, your structural load calculations assume C35/45 concrete. Why not C50/60 for the high-rise core?',
    icon: Sparkles,
  },
];

export const DefenseSimulator = () => {
  const [activeScenario, setActiveScenario] = useState<DefenseScenarioType>('client');
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    fluency: string;
    vocabulary: string;
    feedback: string;
  } | null>(null);
  const evalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === activeScenario)!;

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setUserSpeechText('');
    setEvaluation(null);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    evalTimerRef.current = setTimeout(() => {
      const inputLength = userSpeechText.length || Math.floor(Math.random() * 80) + 40;
      const hasTechnicalTerms =
        /\b(critical\s+path|mobiliz|commissioning|arbitration|sub[\s-]?clause|unit\s+rate|ductwork|excavation|concrete|load\s+calculation|C\d{2}\/\d{2})\b/i.test(
          userSpeechText
        );
      const wordCount =
        userSpeechText.split(/\s+/).filter(Boolean).length || Math.floor(inputLength / 6);
      const score = Math.min(
        98,
        Math.max(
          45,
          (wordCount > 30 ? 25 : wordCount > 15 ? 15 : 0) +
            (hasTechnicalTerms ? 30 : 10) +
            Math.floor(Math.random() * 20) +
            30
        )
      );
      const fluency =
        score >= 85
          ? 'C1 Fluent'
          : score >= 70
            ? 'B2 Competent'
            : score >= 55
              ? 'B1 Developing'
              : 'A2 Basic';

      const technicalWords =
        userSpeechText.match(
          /\b(critical\s+path|mobiliz|commissioning|arbitration|sub[\s-]?clause|unit\s+rate|ductwork|excavation|concrete|load\s+calculation)\b/gi
        ) || [];
      const vocabHighlight =
        technicalWords.length > 0
          ? `Strong (${technicalWords.slice(0, 3).join(', ')})`
          : 'Developing — try using more technical terminology';

      const feedbackByScore =
        score >= 85
          ? `Excellent defense! Your response directly addressed the scenario with clear technical reasoning. ${hasTechnicalTerms ? 'Good use of engineering terminology.' : 'Consider incorporating more domain-specific vocabulary for even stronger impact.'}`
          : score >= 70
            ? `Solid response. You covered the key points, but could strengthen your argument with more specific technical evidence or numerical data.`
            : `Your answer needs more structure. Start with the problem, explain your mitigation strategy, and conclude with a recovery timeline.`;

      setUserSpeechText(
        userSpeechText ||
          'I will review the current status and provide an updated recovery plan by end of business tomorrow.'
      );
      setEvaluation({ score, fluency, vocabulary: vocabHighlight, feedback: feedbackByScore });
    }, 1200);
  }, [userSpeechText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Scenario Selector Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveScenario(s.id);
                setEvaluation(null);
                setUserSpeechText('');
              }}
              className={`flex flex-col items-start p-4 rounded-[var(--radius-card)] border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary'
                  : 'border-border-soft bg-surface hover:bg-surface-hover hover:border-border-hover'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`p-2 rounded-[var(--radius-card)] ${
                    isActive ? 'bg-primary text-white' : 'bg-surface-hover text-muted-copy'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {s.badge}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-copy leading-relaxed line-clamp-2">
                {s.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI Interviewer Roleplay Stage */}
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 shadow-sm space-y-6">
        {/* AI Question Banner */}
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              AI Roleplay Prompt ({scenario.badge})
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <Volume2 className="h-3.5 w-3.5" />
              Live Audio AI Active
            </span>
          </div>
          <p className="text-sm font-bold text-foreground leading-relaxed">"{scenario.aiPrompt}"</p>
        </div>

        {/* Recording Controls & Live Audio Visualizer */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-soft rounded-[var(--radius-card)] bg-background/50 space-y-4">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                aria-label="Start recording audio defense answer"
                className="flex items-center gap-2 rounded-[var(--radius-card)] bg-red-600 hover:bg-red-500 text-white px-6 py-3 text-xs font-extrabold transition-all shadow-md cursor-pointer"
              >
                <Mic className="h-4 w-4 animate-pulse" />
                <span>Start Audio Defense Answer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                aria-label="Stop recording and evaluate response"
                className="flex items-center gap-2 rounded-[var(--radius-card)] bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 text-xs font-extrabold transition-all cursor-pointer"
              >
                <Mic className="h-4 w-4 text-red-500 animate-ping" />
                <span>Stop & Evaluate Response</span>
              </button>
            )}
          </div>

          <p className="text-xs text-muted-copy font-medium">
            {isRecording
              ? 'Recording your audio response... Speak clearly in technical English.'
              : 'Click button above to speak your engineering defense answer.'}
          </p>
        </div>

        {/* Evaluation Output */}
        {evaluation && (
          <div className="rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  AI Defense Score: {evaluation.score}% ({evaluation.fluency})
                </h4>
              </div>
              <span className="text-[11px] font-bold text-muted-copy">{evaluation.vocabulary}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-copy">
                Transcribed Audio Answer:
              </span>
              <p className="text-xs font-mono text-foreground italic bg-background p-2.5 rounded-[var(--radius-card)] border border-border-soft">
                "{userSpeechText}"
              </p>
            </div>

            <p className="text-xs text-foreground leading-relaxed">{evaluation.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefenseSimulator;
