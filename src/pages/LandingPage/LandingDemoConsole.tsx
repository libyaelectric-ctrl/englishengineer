import { useState } from 'react';
import {
  Mic,
  FileCheck2,
  Brain,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_VOCAB_QUESTIONS = [
  {
    term: 'Transverse Load',
    discipline: 'Civil & Structural',
    question:
      'Which structural element is primarily designed to resist transverse loads perpendicular to its axis?',
    options: ['Beam', 'Tie Rod', 'Column', 'Pile Foundation'],
    correctIndex: 0,
    explanation:
      'A beam carries loads transversely (perpendicular to its longitudinal axis), inducing bending moments and shear forces.',
  },
  {
    term: 'De-energize & Tagout',
    discipline: 'Electrical & MEP',
    question:
      'What is the mandatory site protocol before inspecting high-voltage switchgear busbars?',
    options: [
      'Visual check only',
      'Isolation, De-energization & Lockout/Tagout (LOTO)',
      'Wear cotton gloves',
      'Inform the client via email',
    ],
    correctIndex: 1,
    explanation:
      'LOTO (Lockout/Tagout) ensures physical electrical isolation and prevents accidental re-energization during maintenance.',
  },
  {
    term: 'Non-Conformance Report (NCR)',
    discipline: 'QA/QC & Inspection',
    question:
      'When concrete core test results fall below specified 28-day characteristic strength, what is issued?',
    options: [
      'Payment Certificate',
      'Non-Conformance Report (NCR)',
      'Site Instruction',
      'Variation Order',
    ],
    correctIndex: 1,
    explanation:
      'An NCR documents work or materials failing to meet project specifications, requiring formal disposition & re-testing.',
  },
];

const TAB_BUTTON_STYLES = {
  active: 'bg-primary text-primary-foreground shadow-sm',
  inactive: 'text-muted-copy hover:text-foreground',
} as const;

type TabKey = 'voice' | 'writing' | 'vocab';

const TABS: { key: TabKey; icon: typeof Mic; label: string }[] = [
  { key: 'voice', icon: Mic, label: 'AI Voice Coach' },
  { key: 'writing', icon: FileCheck2, label: 'Engineering Writing' },
  { key: 'vocab', icon: Brain, label: 'Vocab Quiz' },
];

const VoiceTab = ({
  isPlayingAudio,
  toggleAudio,
}: {
  isPlayingAudio: boolean;
  toggleAudio: () => void;
}) => (
  <div className="mt-5 space-y-4 animate-in fade-in duration-300">
    <div className="rounded-xl border border-border-soft bg-background p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-copy">
        <span>Site Briefing Scenario: MEP Substation Commissioning</span>
        <span className="rounded bg-surface px-2 py-0.5 text-primary text-[10px]">
          CEFR C1 Level
        </span>
      </div>
      <p className="text-sm font-medium text-foreground italic leading-relaxed">
        &quot;The 11kV transformer isolation test was completed in accordance
        with NFPA 70E standards prior to energization.&quot;
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={toggleAudio}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover transition cursor-pointer shadow-sm"
        >
          <Play
            className={`h-3.5 w-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`}
          />
          {isPlayingAudio ? 'Synthesizing Audio...' : 'Test Voice Synthesis'}
        </button>
        {isPlayingAudio && (
          <div className="flex items-center gap-1">
            <span className="h-4 w-1 bg-primary animate-pulse" />
            <span className="h-6 w-1 bg-primary animate-pulse delay-75" />
            <span className="h-3 w-1 bg-primary animate-pulse delay-150" />
            <span className="h-5 w-1 bg-primary animate-pulse delay-100" />
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
        <div className="text-lg font-black text-foreground">96%</div>
        <div className="text-[10px] font-bold text-muted-copy uppercase">
          Phonetic Clarity
        </div>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
        <div className="text-lg font-black text-success">C1 Advanced</div>
        <div className="text-[10px] font-bold text-muted-copy uppercase">
          CEFR Rank
        </div>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface p-3 text-center">
        <div className="text-lg font-black text-primary">0 Error</div>
        <div className="text-[10px] font-bold text-muted-copy uppercase">
          Jargon Score
        </div>
      </div>
    </div>
  </div>
);

const WritingTab = () => (
  <div className="mt-5 space-y-4 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border-soft bg-background p-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-warning uppercase">
          <span>Raw Site Draft</span>
          <span>Uncorrected</span>
        </div>
        <p className="text-xs text-muted-copy font-mono leading-relaxed bg-surface p-2.5 rounded-lg border border-border-soft">
          &quot;We noticed bad concrete quality on column C4. Contractor must
          fix it very fast before next slab pouring.&quot;
        </p>
      </div>

      <div className="rounded-xl border border-border-soft bg-primary/5 p-4 space-y-2 border-l-4 border-l-primary">
        <div className="flex items-center justify-between text-[11px] font-bold text-primary uppercase">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Technical Correction
          </span>
          <span>Professional Tone</span>
        </div>
        <p className="text-xs text-foreground font-mono leading-relaxed bg-surface p-2.5 rounded-lg border border-border-soft">
          &quot;Core testing revealed non-conforming compressive strength on
          column C4. A formal NCR has been issued requiring structural remedial
          disposition prior to slab casting.&quot;
        </p>
      </div>
    </div>
  </div>
);

const getVocabBtnStyle = (
  showAnswer: boolean,
  isCorrect: boolean,
  isSelected: boolean
): string => {
  if (!showAnswer) {
    return isSelected
      ? 'border-[#0047bb] bg-[#0047bb] text-white'
      : 'border-border-soft bg-surface text-foreground hover:border-border-hover';
  }
  if (isCorrect) return 'border-success bg-success/10 text-success font-bold';
  if (isSelected)
    return 'border-destructive bg-destructive/10 text-destructive';
  return 'border-border-soft bg-surface text-foreground opacity-60';
};

const VocabTab = ({
  currentVocab,
  selectedOption,
  showAnswer,
  handleSelectOption,
  nextVocabQuestion,
}: {
  currentVocab: (typeof DEMO_VOCAB_QUESTIONS)[number];
  selectedOption: number | null;
  showAnswer: boolean;
  handleSelectOption: (idx: number) => void;
  nextVocabQuestion: () => void;
}) => (
  <div className="mt-5 space-y-4 animate-in fade-in duration-300">
    <div className="rounded-xl border border-border-soft bg-background p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-primary">
          {currentVocab.discipline}
        </span>
        <span className="text-[11px] text-muted-copy">
          Term: {currentVocab.term}
        </span>
      </div>
      <p className="text-sm font-bold text-foreground">
        {currentVocab.question}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {currentVocab.options.map((option, idx) => {
          const isCorrect = idx === currentVocab.correctIndex;
          const isSelected = selectedOption === idx;
          const btnStyle = getVocabBtnStyle(showAnswer, isCorrect, isSelected);

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(idx)}
              className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showAnswer && isCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-xs text-foreground animate-in fade-in">
          <p className="font-bold text-success">Explanation:</p>
          <p className="mt-1 text-muted-copy leading-relaxed">
            {currentVocab.explanation}
          </p>
        </div>
      )}

      {showAnswer && (
        <button
          type="button"
          onClick={nextVocabQuestion}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline pt-1 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Next Term
        </button>
      )}
    </div>
  </div>
);

const TAB_CONTENT: Record<
  TabKey,
  React.FC<{
    isPlayingAudio: boolean;
    toggleAudio: () => void;
    currentVocab: (typeof DEMO_VOCAB_QUESTIONS)[number];
    selectedOption: number | null;
    showAnswer: boolean;
    handleSelectOption: (idx: number) => void;
    nextVocabQuestion: () => void;
  }>
> = {
  voice: VoiceTab,
  writing: WritingTab,
  vocab: VocabTab,
};

export function LandingDemoConsole() {
  const [activeTab, setActiveTab] = useState<TabKey>('voice');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentVocab = DEMO_VOCAB_QUESTIONS[vocabIndex];

  const toggleAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 3500);
  };

  const handleSelectOption = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
  };

  const nextVocabQuestion = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    setVocabIndex((prev) => (prev + 1) % DEMO_VOCAB_QUESTIONS.length);
  };

  const ActiveTabContent = TAB_CONTENT[activeTab];

  return (
    <div className="rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:border-border-hover">
      <div className="flex items-center justify-between border-b border-border-soft pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-border-soft bg-background p-1 text-xs">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                activeTab === key
                  ? TAB_BUTTON_STYLES.active
                  : TAB_BUTTON_STYLES.inactive
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Interactive Live Console
        </span>
      </div>

      <ActiveTabContent
        isPlayingAudio={isPlayingAudio}
        toggleAudio={toggleAudio}
        currentVocab={currentVocab}
        selectedOption={selectedOption}
        showAnswer={showAnswer}
        handleSelectOption={handleSelectOption}
        nextVocabQuestion={nextVocabQuestion}
      />

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border-soft">
        <p className="text-xs text-muted-copy">
          Ready to experience the full AI English Operating System?
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>Start Free Training</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
