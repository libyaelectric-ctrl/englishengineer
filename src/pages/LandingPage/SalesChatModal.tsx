import { Building2, MessageSquare, Send, X } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

export function SalesChatModal() {
  const translate = useLocalizationStore((s) => s.translate);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: translate('landing.salesChatWelcome'),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: translate('landing.salesChatThanks'),
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* ITEM 20: Floating Sales Chat Button at Bottom Right */}
      <div className="fixed bottom-16 left-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-2xl hover:scale-105 transition-all cursor-pointer border border-white/20 light-sweep-container"
        >
          <MessageSquare className="h-4 w-4 text-emerald-300 animate-pulse" />
          <span>{translate('landing.salesChatTitle')} 💬</span>
        </button>
      </div>

      {/* Sales Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-28 left-6 z-50 w-80 sm:w-96 rounded-xl border border-primary/30 bg-background/95 backdrop-blur-md p-4 shadow-2xl animate-fadeIn space-y-3">
          <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground leading-tight">
                  {translate('landing.salesChatName')}
                </h4>
                <p className="text-[9px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />{' '}
                  {translate('landing.salesChatStatus')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-copy hover:text-foreground cursor-pointer p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-48 overflow-y-auto space-y-2 text-xs pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground text-right'
                    : 'mr-auto bg-surface border border-border-soft text-foreground'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-border-soft">
            <label htmlFor="sales-chat-input" className="sr-only">
              {translate('landing.salesChatPlaceholder')}
            </label>
            <input
              id="sales-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={translate('landing.salesChatPlaceholder')}
              className="flex-1 rounded border border-border-soft bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              aria-label="Send message"
              className="rounded bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SalesChatModal;
