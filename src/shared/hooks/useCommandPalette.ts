import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_RECENT = 'command-palette:recent';
const STORAGE_KEY_FREQ = 'command-palette:frequency';
const MAX_RECENT = 5;

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  category: string;
  keywords?: string[];
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

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

  const recordVisit = useCallback((href: string) => {
    // Update recent
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECENT);
      const recent: string[] = raw ? JSON.parse(raw) : [];
      const updated = [href, ...recent.filter((r) => r !== href)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    } catch { /* ignore */ }

    // Update frequency
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FREQ);
      const freq: Record<string, number> = raw ? JSON.parse(raw) : {};
      freq[href] = (freq[href] || 0) + 1;
      localStorage.setItem(STORAGE_KEY_FREQ, JSON.stringify(freq));
    } catch { /* ignore */ }
  }, []);

  const getRecent = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECENT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const getFrequency = useCallback((): Record<string, number> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FREQ);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  return { isOpen, open, close, toggle, recordVisit, getRecent, getFrequency };
}
