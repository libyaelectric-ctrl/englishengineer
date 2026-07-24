import { describe, it, expect, vi } from 'vitest';
import { eventBus } from './event-bus';

describe('EventBus', () => {
  it('publishes and subscribes to events', () => {
    const handler = vi.fn();
    const token = eventBus.subscribe('app.started', handler);

    eventBus.publish({
      id: 'test-1',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'vitest',
        timestamp: 1234567890,
      },
    });

    expect(handler).toHaveBeenCalledOnce();
    token.unsubscribe();
  });

  it('unsubscribes correctly', () => {
    const handler = vi.fn();
    const token = eventBus.subscribe('app.started', handler);

    token.unsubscribe();

    eventBus.publish({
      id: 'test-2',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'vitest',
        timestamp: 1234567890,
      },
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const token1 = eventBus.subscribe('app.started', handler1);
    const token2 = eventBus.subscribe('app.started', handler2);

    eventBus.publish({
      id: 'test-3',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'vitest',
        timestamp: 1234567890,
      },
    });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();

    token1.unsubscribe();
    token2.unsubscribe();
  });

  it('supports wildcard subscribers', () => {
    const handler = vi.fn();
    const token = eventBus.subscribeAll(handler);

    eventBus.publish({
      id: 'test-4',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'vitest',
        timestamp: 1234567890,
      },
    });

    expect(handler).toHaveBeenCalledOnce();
    token.unsubscribe();
  });

  it('clears all listeners', () => {
    const handler = vi.fn();
    eventBus.subscribe('app.started', handler);
    eventBus.subscribeAll(handler);

    eventBus.clearAllListeners();

    eventBus.publish({
      id: 'test-5',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'vitest',
        timestamp: 1234567890,
      },
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
