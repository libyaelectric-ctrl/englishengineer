import { useCallback, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useCommandPalette } from '@/shared/hooks/useCommandPalette';
import { useKeyboardShortcutsPanel } from '@/shared/hooks/useKeyboardShortcutsPanel';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * Global keyboard shortcuts for the application.
 *
 * Shortcuts:
 * - Ctrl+K / Cmd+K: Command Palette
 * - 1-6: Quick navigate to skill pages
 * - Escape: Close modals/overlays
 * - ?: Show shortcut help (future)
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const { toggle } = useCommandPalette();
  const { toggle: toggleShortcuts } = useKeyboardShortcutsPanel();

  const shortcuts: Shortcut[] = [
    // Command Palette
    { key: 'k', ctrl: true, description: 'Command Palette', action: toggle },
    { key: 'k', meta: true, description: 'Command Palette', action: toggle },

    // Shortcuts Panel
    { key: '/', ctrl: true, description: 'Keyboard Shortcuts', action: toggleShortcuts },
    { key: '/', meta: true, description: 'Keyboard Shortcuts', action: toggleShortcuts },

    // Quick navigation (numbers)
    { key: '1', description: 'Dashboard', action: () => navigate('/dashboard') },
    { key: '2', description: 'Vocabulary', action: () => navigate('/vocabulary') },
    { key: '3', description: 'Grammar', action: () => navigate('/grammar') },
    { key: '4', description: 'Reading', action: () => navigate('/reading') },
    { key: '5', description: 'Writing', action: () => navigate('/writing') },
    { key: '6', description: 'Listening', action: () => navigate('/listening') },
    { key: '7', description: 'Speaking', action: () => navigate('/speaking') },
    { key: '8', description: 'Learning Path', action: () => navigate('/learning-path') },
    { key: '9', description: 'Profile', action: () => navigate('/profile/overview') },

    // Escape — close command palette if open
    { key: 'Escape', description: 'Close', action: () => {} },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Allow Escape always, and Ctrl/Cmd shortcuts even in inputs
      if (isInput && e.key !== 'Escape' && !e.ctrlKey && !e.metaKey) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [navigate, toggle, toggleShortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

/**
 * Returns the list of global shortcuts for display in help/tooltip UIs.
 */
export function getShortcutList(): Array<{ key: string; description: string }> {
  return [
    { key: '⌘/Ctrl + K', description: 'Command Palette' },
    { key: '⌘/Ctrl + /', description: 'Keyboard Shortcuts' },
    { key: '1-9', description: 'Quick navigate to pages' },
    { key: 'Esc', description: 'Close modals' },
  ];
}
