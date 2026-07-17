import { useState, useEffect } from 'react';
import { PenTool, AlertTriangle, Volume2, Send } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/Button';
import { AITeacherService, type AITeacherChatMessage } from '@/features/ai';
import { SectionCard } from '@/shared/components/SectionCard';

interface DraftEditorProps {
  title: string;
  description: string;
  discipline: string;
  scenario?: string;
  task?: string;
  expectedStructure?: string[];
  draft: string;
  onDraftChange: (v: string) => void;
  getReadabilityScore: () => number;
  userErrors: Record<string, string>;
}

export const DraftEditor = ({
  title,
  description,
  discipline,
  scenario,
  task,
  expectedStructure,
  draft,
  onDraftChange,
  getReadabilityScore,
  userErrors,
}: DraftEditorProps) => {
  const [messages, setMessages] = useState<AITeacherChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I am your AI Writing Coach for this drafting task: **"${title}"**.
        
I can suggest professional alternatives, check your passive voice usage, or help you outline your draft.
Tell me what you want to write or paste a sentence you want to improve!`,
      },
    ]);
    setChatInput('');
  }, [title]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isTalking) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const nextHistory = [
      ...messages,
      { role: 'user' as const, content: userMsg },
    ];
    setMessages(nextHistory);
    setIsTalking(true);

    try {
      const response = await AITeacherService.chat(
        'writing',
        `Task: "${title}". Description: "${description}". Scenario: "${scenario}". Current draft: "${draft}"`,
        nextHistory,
        userMsg
      );
      setMessages([
        ...nextHistory,
        { role: 'assistant' as const, content: response.message },
      ]);
    } finally {
      setIsTalking(false);
    }
  };

  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SectionCard
      title={title}
      subtitle={description}
      icon={PenTool}
      headerActions={
        <span className="rounded-[4px] border border-[#d9d9e3] bg-[#f3f3fd] px-2.5 py-1 font-mono text-[9px] font-bold text-muted-copy uppercase tracking-wider">
          {discipline}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[4px] border border-[#d9d9e3] bg-[#f3f3fd] p-4 text-sm text-foreground shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
            Scenario
          </p>
          <p className="mt-2 leading-6 font-normal">
            {scenario ?? description}
          </p>
          {task && (
            <p className="mt-3 font-bold text-foreground">Goal: {task}</p>
          )}
          {expectedStructure && (
            <p className="mt-2 text-xs leading-5 text-muted-copy font-bold">
              Required points: {expectedStructure.join(' · ')}
            </p>
          )}
        </div>

        <label className="block">
          <span className="sr-only">Draft your technical writing</span>
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            className="h-64 w-full resize-none rounded-[4px] border border-[#d9d9e3] bg-white p-5 text-sm font-normal leading-[1.7] text-foreground outline-none focus:border-[#0047bb] focus:ring-2 focus:ring-[#0047bb]/10"
            placeholder="Start writing or polishing your technical draft..."
          />
        </label>

        <p
          className={`mt-1 text-right text-xs font-bold ${wordCount > 200 ? 'text-green-500' : wordCount > 100 ? 'text-[#0047bb]' : 'text-muted-copy'}`}
        >
          {wordCount} words
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-copy">
            <span>Goal: {Math.min(wordCount, 200)}/200 words</span>
            <span>{Math.round(Math.min(100, (wordCount / 200) * 100))}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#f3f3fd] border border-[#d9d9e3] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0047bb] to-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (wordCount / 200) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-muted-copy pt-1 font-bold">
          <div className="flex items-center gap-2">
            <span>CHARACTER COUNT: {draft.length}</span>
            {draft.length > 0 && (
              <div className="w-24 h-1.5 rounded-full bg-[#f3f3fd] border border-[#d9d9e3] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${draft.length > 1000 ? 'bg-rose-500' : draft.length > 500 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{
                    width: `${Math.min(100, (draft.length / 1200) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
          <span>READABILITY LEVEL: {getReadabilityScore()}%</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const u = new SpeechSynthesisUtterance(draft);
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          }}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          <Volume2 className="h-3.5 w-3.5" /> Read Aloud
        </button>

        {userErrors.draft && (
          <p className="text-[10px] text-rose-400 font-bold font-mono flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{userErrors.draft}</span>
          </p>
        )}

        {/* AI Writing Coach Chat */}
        <div className="mt-4 border-t border-[#d9d9e3] pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            AI Writing Coach 🎓
          </h4>
          <div className="mt-2 flex max-h-60 min-h-24 flex-col gap-2.5 overflow-y-auto rounded-[4px] border border-[#d9d9e3] bg-background p-2.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col max-w-[85%] rounded-[4px] p-2.5 text-xs leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto'
                    : 'bg-foreground text-background ml-auto'
                )}
              >
                <p className="font-bold text-[9px] uppercase opacity-60 mb-0.5">
                  {msg.role === 'assistant' ? 'AI Coach 🎓' : 'You 💻'}
                </p>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isTalking && (
              <div className="flex flex-col max-w-[85%] rounded-[4px] p-2.5 text-xs bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto animate-pulse">
                <p className="font-bold text-[9px] uppercase opacity-60 mb-0.5">
                  AI Coach 🎓
                </p>
                <p>Analyzing draft and context...</p>
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChat();
              }}
              disabled={isTalking}
              placeholder="Ask for feedback or outline ideas..."
              className="flex-1 rounded-[4px] border border-[#d9d9e3] bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-[#0047bb]"
            />
            <Button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || isTalking}
              className="rounded-[4px] cursor-pointer bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb]"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
