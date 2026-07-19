import { describe, it, expect, beforeEach } from 'vitest';
import { eventBus } from './event-bus';
import type { AppEvent } from './event.types';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearAllListeners();
  });

  it('subscribes and receives events', () => {
    const received: AppEvent[] = [];
    eventBus.subscribe('app.started', (event) => {
      received.push(event);
    });

    eventBus.publish({ id: '1', type: 'app.started', timestamp: new Date().toISOString(), payload: {} });
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('app.started');
  });

  it('unsubscribe stops receiving events', () => {
    const received: AppEvent[] = [];
    const token = eventBus.subscribe('app.started', (event) => {
      received.push(event);
    });

    eventBus.publish({ id: '1', type: 'app.started', timestamp: new Date().toISOString(), payload: {} });
    expect(received).toHaveLength(1);

    token.unsubscribe();
    eventBus.publish({ id: '2', type: 'app.started', timestamp: new Date().toISOString(), payload: {} });
    expect(received).toHaveLength(1);
  });

  it('wildcard subscribers receive all events', () => {
    const received: AppEvent[] = [];
    eventBus.subscribeAll((event) => {
      received.push(event);
    });

    eventBus.publish({ id: '1', type: 'app.started', timestamp: new Date().toISOString(), payload: {} });
    eventBus.publish({ id: '2', type: 'user.login', timestamp: new Date().toISOString(), payload: {} });
    expect(received).toHaveLength(2);
  });

  it('clearAllListeners removes all subscribers', () => {
    const received: AppEvent[] = [];
    eventBus.subscribe('app.started', (event) => received.push(event));
    eventBus.subscribeAll((event) => received.push(event));

    eventBus.clearAllListeners();
    eventBus.publish({ id: '1', type: 'app.started', timestamp: new Date().toISOString(), payload: {} });
    expect(received).toHaveLength(0);
  });
});
