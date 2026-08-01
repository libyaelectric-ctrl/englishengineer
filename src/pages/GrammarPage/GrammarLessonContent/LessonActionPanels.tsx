import { Send } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import type { ChatMessage } from '@/features/grammar';

import { SectionHeading } from '../GrammarPageComponents';

export const ChatPanel = ({
  messages,
  chatInput,
  isTalking,
  setChatInput,
  handleSend,
}: {
  messages: ChatMessage[];
  chatInput: string;
  isTalking: boolean;
  setChatInput: (v: string) => void;
  handleSend: () => void;
}) => (
  <div className="rounded-[4px] border border-primary/25 bg-surface p-4 shadow-sm">
    <SectionHeading
      title="AI Grammar Teacher"
      subtitle="Practice, translate, and chat with your bilingual engineering English tutor"
    />
    <div className="mt-3 flex max-h-80 min-h-40 flex-col gap-2.5 overflow-y-auto rounded-[4px] border border-border-soft bg-background p-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs leading-relaxed',
            msg.role === 'assistant'
              ? 'bg-primary/5 text-foreground border border-primary/10 mr-auto'
              : 'bg-foreground text-background ml-auto'
          )}
        >
          <p className="font-bold text-[10px] uppercase opacity-60 mb-1">
            {msg.role === 'assistant' ? 'AI Teacher 🎓' : 'You 💻'}
          </p>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
      {isTalking && (
        <div className="flex flex-col max-w-[85%] rounded-[4px] p-3 text-xs bg-primary/5 text-foreground border border-primary/10 mr-auto animate-pulse">
          <p className="font-bold text-[10px] uppercase opacity-60 mb-1">AI Teacher 🎓</p>
          <p>Thinking and explaining...</p>
        </div>
      )}
    </div>
    <div className="mt-3 flex gap-2">
      <label className="flex-1">
        <span className="sr-only">Chat with AI Grammar Teacher</span>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isTalking}
          placeholder="Type your reply, translation effort, or question..."
          className="w-full rounded-[4px] border border-border-soft bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
        />
      </label>
      <Button
        onClick={handleSend}
        disabled={!chatInput.trim() || isTalking}
        aria-label="Send message"
        className="rounded-[4px]"
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

type QuizItem = {
  question: string;
  choices: string[];
  correct: number;
};

export const QuizPanel = ({
  quizItems,
  quizAnswers,
  setQuizAnswers,
}: {
  quizItems: QuizItem[];
  quizAnswers: Record<number, string>;
  setQuizAnswers: (fn: (prev: Record<number, string>) => Record<number, string>) => void;
}) => (
  <div className="mt-3 space-y-3 rounded-[4px] border border-primary/25 bg-primary/5 p-3">
    {quizItems.map((item, qi) => (
      <div key={item.question}>
        <p className="text-xs font-bold">
          {qi + 1}. {item.question}
        </p>
        <div className="mt-1.5 grid gap-1.5">
          {item.choices.map((choice, ci) => {
            const letter = String.fromCharCode(65 + ci);
            const selected = quizAnswers[qi] === letter;
            const revealed = Object.keys(quizAnswers).length === 3;
            const correct = ci === item.correct;
            return (
              <button
                key={`${item.question}-${choice}`}
                type="button"
                disabled={revealed}
                onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: letter }))}
                className={`break-words rounded-[4px] border p-2 text-left text-[11px] font-semibold transition-colors cursor-pointer ${revealed ? (correct ? 'border-success bg-success/10 text-success' : selected ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-border-soft bg-surface opacity-60') : selected ? 'border-primary bg-primary text-white' : 'border-border-soft bg-surface text-foreground hover:border-primary/30 hover:bg-primary/5'}`}
              >
                <span className="mr-1.5 font-black">{letter}.</span>
                {choice}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
