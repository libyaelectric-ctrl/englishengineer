import { describe, expect, it, beforeEach } from 'vitest';

import { useMascotStore } from './mascot.store';

// Reset store between tests
beforeEach(() => {
  useMascotStore.setState({
    state: 'idle',
    message: null,
    visible: true,
    minimized: false,
    position: { right: 22, bottom: 22 },
    soundEnabled: true,
    lastInteractionAt: Date.now(),
  });
});

describe('MascotStore', () => {
  it('starts in idle state', () => {
    const { state, message, visible } = useMascotStore.getState();
    expect(state).toBe('idle');
    expect(message).toBeNull();
    expect(visible).toBe(true);
  });

  it('setState changes state and message', () => {
    useMascotStore.getState().setState('celebrate', 'Nice work!');
    const { state, message } = useMascotStore.getState();
    expect(state).toBe('celebrate');
    expect(message).toBe('Nice work!');
  });

  it('say changes message without changing state', () => {
    useMascotStore.getState().setState('thinking');
    useMascotStore.getState().say('Hello world');
    const { state, message } = useMascotStore.getState();
    expect(state).toBe('thinking');
    expect(message).toBe('Hello world');
  });

  it('say can optionally change state', () => {
    useMascotStore.getState().say('Let us celebrate', 'celebrate');
    const { state, message } = useMascotStore.getState();
    expect(state).toBe('celebrate');
    expect(message).toBe('Let us celebrate');
  });

  it('clearMessage removes message', () => {
    useMascotStore.getState().say('Hello');
    useMascotStore.getState().clearMessage();
    expect(useMascotStore.getState().message).toBeNull();
  });

  it('show/hide toggles visibility', () => {
    useMascotStore.getState().hide();
    expect(useMascotStore.getState().visible).toBe(false);
    useMascotStore.getState().show();
    expect(useMascotStore.getState().visible).toBe(true);
  });

  it('toggleMinimized flips minimized', () => {
    expect(useMascotStore.getState().minimized).toBe(false);
    useMascotStore.getState().toggleMinimized();
    expect(useMascotStore.getState().minimized).toBe(true);
    useMascotStore.getState().toggleMinimized();
    expect(useMascotStore.getState().minimized).toBe(false);
  });

  it('setPosition updates position', () => {
    useMascotStore.getState().setPosition({ right: 100, bottom: 50 });
    expect(useMascotStore.getState().position).toEqual({ right: 100, bottom: 50 });
  });

  it('setSoundEnabled toggles sound', () => {
    useMascotStore.getState().setSoundEnabled(false);
    expect(useMascotStore.getState().soundEnabled).toBe(false);
    useMascotStore.getState().setSoundEnabled(true);
    expect(useMascotStore.getState().soundEnabled).toBe(true);
  });

  it('touch updates lastInteractionAt', () => {
    const before = useMascotStore.getState().lastInteractionAt;
    useMascotStore.getState().touch();
    expect(useMascotStore.getState().lastInteractionAt).toBeGreaterThanOrEqual(before);
  });
});
