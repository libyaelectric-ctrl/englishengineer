import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  ShieldAlert,
  Users,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

type DefenseScenarioType =
  | 'client'
  | 'toolbox'
  | 'fidic'
  | 'subcontractor'
  | 'presentation';

interface ScenarioMeta {
  id: DefenseScenarioType;
  title: string;
  subtitle: string;
  badge: string;
  aiPrompt: string;
  icon: React.ElementType;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'client',
    title: '6. 🎙️ Client Defense Simulator',
    subtitle: 'Defend schedule delays & budget overruns to tough client PMs',
    badge: 'Client PM',
    aiPrompt:
      'Why is the HVAC commissioning delayed by 3 weeks, and how will you recover the critical path without extra cost?',
    icon: Briefcase,
  },
  {
    id: 'toolbox',
    title: '7. 🏗️ Toolbox Talk Practice',
    subtitle: 'Deliver a 3-minute oral safety briefing to site workers',
    badge: 'HSE Briefing',
    aiPrompt:
      'Good morning team. Today we are conducting deep excavation near live MV electrical cables. State your 3 safety rules.',
    icon: ShieldAlert,
  },
  {
    id: 'fidic',
    title: '8. ⚖️ FIDIC Arbitration Board',
    subtitle: 'Oral claim presentation under FIDIC Sub-Clause 20.1',
    badge: 'Arbitration',
    aiPrompt:
      'Contractor Counsel, present your formal legal justification for the 45-day extension of time due to late employer drawings.',
    icon: Users,
  },
  {
    id: 'subcontractor',
    title: '9. 🤝 Subcontractor Negotiation',
    subtitle: 'Negotiate price pushbacks and manpower mobilization',
    badge: 'Commercial',
    aiPrompt:
      'Your proposed unit rate for concrete pouring is 15% above market. What technical value justifies this price?',
    icon: Briefcase,
  },
  {
    id: 'presentation',
    title: '10. 📊 Technical Q&A Defense',
    subtitle: 'Defend engineering slide deck to technical directors',
    badge: 'Boardroom',
    aiPrompt:
      'In slide 4, your structural load calculations assume C35/45 concrete. Why not C50/60 for the high-rise core?',
    icon: Sparkles,
  },
];

export const DefenseSimulator: React.FC = () => {
  const [activeScenario, setActiveScenario] =
    useState<DefenseScenarioType>('client');
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    fluency: string;
    vocabulary: string;
    feedback: string;
  } | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === activeScenario)!;

  const handleStartRecording = () => {
    setIsRecording(true);
    setUserSpeechText('');
    setEvaluation(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate AI oral evaluation
    setTimeout(() => {
      setUserSpeechText(
        'Due to unforeseen underground utility clashes, we revised the ductwork routing. We mobilized additional night shift crews to recover 5 days by next Friday.'
      );
      setEvaluation({
        score: 92,
        fluency: 'C1 Fluent',
        vocabulary:
          'Strong (mobilized, underground clashes, critical path recovery)',
        feedback:
          'Excellent technical defense! Your usage of "mobilized additional night shift crews" and "critical path recovery" convinced the client PM.',
      });
    }, 1200);
  };

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
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0047bb] bg-[#0047bb]/5 shadow-md ring-1 ring-[#0047bb]'
                  : 'border-border-soft bg-surface hover:bg-surface-hover hover:border-border-hover'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-[#0047bb] text-white'
                      : 'bg-surface-hover text-muted-copy'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
                  {s.badge}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1 text-xs text-muted-copy leading-relaxed line-clamp-2">
                {s.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI Interviewer Roleplay Stage */}
      <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm space-y-6">
        {/* AI Question Banner */}
        <div className="rounded-xl border border-[#0047bb]/30 bg-[#0047bb]/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0047bb]">
              AI Roleplay Prompt ({scenario.badge})
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <Volume2 className="h-3.5 w-3.5" />
              Live Audio AI Active
            </span>
          </div>
          <p className="text-sm font-bold text-foreground leading-relaxed">
            "{scenario.aiPrompt}"
          </p>
        </div>

        {/* Recording Controls & Live Audio Visualizer */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-soft rounded-xl bg-background/50 space-y-4">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white px-6 py-3 text-xs font-extrabold transition-all shadow-md cursor-pointer"
              >
                <Mic className="h-4 w-4 animate-pulse" />
                <span>Start Audio Defense Answer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 text-xs font-extrabold transition-all cursor-pointer"
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
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  AI Defense Score: {evaluation.score}% ({evaluation.fluency})
                </h4>
              </div>
              <span className="text-[11px] font-bold text-muted-copy">
                {evaluation.vocabulary}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-copy">
                Transcribed Audio Answer:
              </span>
              <p className="text-xs font-mono text-foreground italic bg-background p-2.5 rounded-lg border border-border-soft">
                "{userSpeechText}"
              </p>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefenseSimulator;
