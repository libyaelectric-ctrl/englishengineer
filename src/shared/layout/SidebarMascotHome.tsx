import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { EngVoxMascot } from '@/shared/components/Mascot';
import { useBetaStore } from '@/features/beta/beta.store';
import { BetaFeedbackType } from '@/features/beta/beta.types';

export const SidebarMascotHome: React.FC = () => {
  const [isMascotExpanded, setIsMascotExpanded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] =
    useState<BetaFeedbackType>('suggestion');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const submitFeedback = useBetaStore((state) => state.submitFeedback);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    submitFeedback({
      type: feedbackType,
      message: feedbackMessage.trim(),
      difficultyRating: 4,
      missionRating: 4,
      aiFeedbackRating: 5,
      uxRating: 5,
      screen: window.location.pathname,
    });

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
    }, 1600);
  };

  return (
    <div className="relative w-full">
      {/* Top Separator Line dividing from navigation above */}
      <div className="my-2 border-t border-border-soft/80" />

      {/* Side-by-side resting home row (Yan yana iki bağımsız eleman) */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        {/* Separate Mascot Element (Click to Expand from left sidebar) */}
        <button
          type="button"
          onClick={() => setIsMascotExpanded(!isMascotExpanded)}
          className="relative group flex items-center gap-2 p-1 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer outline-none border border-transparent hover:border-border-soft min-w-0"
          title="EngVox AI Mascot - Click to expand"
        >
          <div className="shrink-0 scale-90 transition-transform group-hover:scale-100">
            <EngVoxMascot
              size="sm"
              showSpeechBubble={false}
              enableMouseTracking={true}
            />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-foreground leading-none flex items-center gap-1">
              EngVox Bot
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 truncate">
              AI Assistant
            </span>
          </div>
        </button>

        {/* Separate Feedback Button Element (Yan yana bağımsız duran Feedback butonu) */}
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
          title="Submit Feedback"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Feedback</span>
        </button>
      </div>

      {/* Pop-out Mascot Interactive Card (Expands right from the left sidebar location) */}
      {isMascotExpanded && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-2xl border border-emerald-500/40 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl text-zinc-100 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              EngVox Assistant
            </span>
            <button
              type="button"
              onClick={() => setIsMascotExpanded(false)}
              className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <EngVoxMascot
              size="md"
              showSpeechBubble={true}
              speechText="Hi! Ready to practice engineering English?"
              enableMouseTracking={true}
            />
            <p className="text-xs text-zinc-300 text-center leading-relaxed">
              Your AI oral defense and engineering presentation practice coach.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-zinc-900 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Submit Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-base font-bold text-white">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs text-zinc-400">
                  Your feedback helps us continuously improve EngVox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="mascot-feedback-type-modal"
                    className="block text-xs font-bold text-zinc-300 mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="mascot-feedback-type-modal"
                    value={feedbackType}
                    onChange={(e) =>
                      setFeedbackType(e.target.value as BetaFeedbackType)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="suggestion">Suggestion / Feature</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="content_issue">Content / Grammar</option>
                    <option value="ux_problem">UX Improvement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mascot-feedback-message-modal"
                    className="block text-xs font-bold text-zinc-300 mb-1.5"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="mascot-feedback-message-modal"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe your feedback, suggestion, or issue..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!feedbackMessage.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarMascotHome;
