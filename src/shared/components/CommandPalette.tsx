import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Moon, User, LayoutDashboard, Brain, CreditCard, ChevronRight, BookOpen, PenTool } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const commands = [
    { id: 'dashboard', title: 'Dashboard\'a Git', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'vocabulary', title: 'Kelime Çalış (Vocabulary)', icon: BookOpen, action: () => navigate('/vocabulary') },
    { id: 'grammar', title: 'Gramer Kuralları (Grammar)', icon: PenTool, action: () => navigate('/grammar') },
    { id: 'reading', title: 'Okuma Görevleri (Reading)', icon: BookOpen, action: () => navigate('/reading') },
    { id: 'ai', title: 'AI Asistan', icon: Brain, action: () => navigate('/ai') },
    { id: 'profile', title: 'Profil Ayarları', icon: User, action: () => navigate('/profile') },
    { id: 'billing', title: 'Faturalandırma & Takım', icon: CreditCard, action: () => navigate('/profile') },
    { id: 'theme', title: 'Gece/Gündüz Modu', icon: Moon, action: toggleTheme },
  ];

  const filtered = commands.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const executeCommand = (cmd: typeof commands[0]) => {
    cmd.action();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      executeCommand(filtered[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl bg-surface border border-border-soft shadow-2xl"
          >
            <div className="flex items-center border-b border-border-soft px-4">
              <Search className="h-5 w-5 text-muted-copy" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent px-4 py-4 text-sm font-medium outline-none placeholder:text-muted-copy"
                placeholder="Ne yapmak istersin? (Komut yaz veya ara...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="text-[10px] font-bold text-muted-copy border border-border-soft px-1.5 py-0.5 rounded uppercase tracking-wider">
                ESC
              </span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-copy">
                  "{search}" için sonuç bulunamadı
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-muted-copy hover:text-foreground hover:bg-surface-hover/50'
                      }`}
                    >
                      <cmd.icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-copy'}`} />
                      <span className="flex-1">{cmd.title}</span>
                      {isSelected && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
