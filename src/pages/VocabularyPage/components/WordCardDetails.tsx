import { useState, useEffect } from 'react';
import { ChevronDown, Send } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/Button';
import { AITeacherService, type AITeacherChatMessage } from '@/features/ai';
import {
  repairVocabularyText,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { PronunciationButton } from './PronunciationButton';
import { SentencePanel } from './SentencePanel';

interface WordCardDetailsProps {
  term: VocabularyTerm;
  showDetails: boolean;
  onToggle: () => void;
}

export const WordCardDetails = ({
  term,
  showDetails,
  onToggle,
}: WordCardDetailsProps) => {
  const [messages, setMessages] = useState<AITeacherChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    if (showDetails) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! Let's practice the vocabulary term: **"${term.term}"** (${term.partOfSpeech}).
          
**Turkish Meaning (Anlamı):**
${term.turkishMeaning}

**Software Engineering Context:**
${term.primaryUseCase}

**Example Sentence:**
*"${term.exampleSentence}"*

Would you like to practice? Write a sentence in English using "${term.term}" or try translating this example, and I will review it!`,
        },
      ]);
      setChatInput('');
    }
  }, [term.id, showDetails]);

  const handleSend = async () => {
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
        'vocabulary',
        `Term: "${term.term}" (${term.partOfSpeech}). Definition: "${term.definition}". Turkish: "${term.turkishMeaning}". UseCase: "${term.primaryUseCase}". Example: "${term.exampleSentence}"`,
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

  return (
    <div className="mt-3 rounded-[4px] border border-[#d9d9e3] bg-white/60 p-3 text-xs text-muted-copy shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={showDetails}
        className="flex w-full items-center justify-between font-sans font-bold uppercase tracking-wider text-[10px] text-foreground cursor-pointer"
      >
        Word details
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
        />
      </button>
      {showDetails && (
        <>
          <div className="mt-3 flex items-center gap-3">
            <PronunciationButton word={term.term} />
          </div>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-bold">Part of speech</dt>
              <dd>{term.partOfSpeech}</dd>
            </div>
            <div>
              <dt className="font-bold">Content domain</dt>
              <dd>{term.contentDomain}</dd>
            </div>
            <div>
              <dt className="font-bold">Life context</dt>
              <dd>{term.lifeContext}</dd>
            </div>
            <div>
              <dt className="font-bold">Register</dt>
              <dd>{term.register}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Primary use case</dt>
              <dd>{term.primaryUseCase}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Grammar fits</dt>
              <dd>{term.grammarFits.join(', ') || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Skill use</dt>
              <dd>{term.skillUse.join(', ')}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Common mistakes</dt>
              <dd>{repairVocabularyText(term.commonMistakes)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Related terms</dt>
              <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
            </div>
          </dl>
          <SentencePanel
            word={term.term}
            partOfSpeech={term.partOfSpeech}
            meaning={term.turkishMeaning}
          />

          {/* AI Vocab Tutor Chat */}
          <div className="mt-4 border-t border-[#d9d9e3] pt-4">
            <h4 className="text-xs font-black uppercase tracking-wide text-foreground">
              AI Vocabulary Teacher
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
                    {msg.role === 'assistant' ? 'AI Teacher 🎓' : 'You 💻'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {isTalking && (
                <div className="flex flex-col max-w-[85%] rounded-[4px] p-2.5 text-xs bg-[#0047bb]/5 text-foreground border border-[#0047bb]/10 mr-auto animate-pulse">
                  <p className="font-bold text-[9px] uppercase opacity-60 mb-0.5">
                    AI Teacher 🎓
                  </p>
                  <p>Explaining usage...</p>
                </div>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isTalking}
                placeholder="Type your sentence, translation, or question..."
                className="flex-1 rounded-[4px] border border-[#d9d9e3] bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-[#0047bb]"
              />
              <Button
                onClick={handleSend}
                disabled={!chatInput.trim() || isTalking}
                className="rounded-[4px]"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
