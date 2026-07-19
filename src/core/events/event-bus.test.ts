import { describe, it, expect, beforeEach } from 'vitest';
import { eventBus } from './event-bus';
import type {
  AppEvent,
  AppStartedEvent,
  LearningStartedEvent,
} from './event.types';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearAllListeners();
  });

  it('subscribes and receives events', () => {
    const received: AppEvent[] = [];
    eventBus.subscribe('app.started', (event) => {
      received.push(event);
    });

    const event: AppStartedEvent = {
      id: '1',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'test',
        timestamp: Date.now(),
      },
    };
    eventBus.publish(event);
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('app.started');
  });

  it('unsubscribe stops receiving events', () => {
    const received: AppEvent[] = [];
    const token = eventBus.subscribe('app.started', (event) => {
      received.push(event);
    });

    const event: AppStartedEvent = {
      id: '1',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'test',
        timestamp: Date.now(),
      },
    };
    eventBus.publish(event);
    expect(received).toHaveLength(1);

    token.unsubscribe();
    eventBus.publish({ ...event, id: '2' });
    expect(received).toHaveLength(1);
  });

  it('wildcard subscribers receive all events', () => {
    const received: AppEvent[] = [];
    eventBus.subscribeAll((event) => {
      received.push(event);
    });

    const event1: AppStartedEvent = {
      id: '1',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'test',
        timestamp: Date.now(),
      },
    };
    const event2: LearningStartedEvent = {
      id: '2',
      type: 'learning.started',
      timestamp: new Date().toISOString(),
      payload: { module: 'vocabulary', topicId: 'A1' },
    };
    eventBus.publish(event1);
    eventBus.publish(event2);
    expect(received).toHaveLength(2);
  });

  it('clearAllListeners removes all subscribers', () => {
    const received: AppEvent[] = [];
    eventBus.subscribe('app.started', (event) => received.push(event));
    eventBus.subscribeAll((event) => received.push(event));

    eventBus.clearAllListeners();
    const event: AppStartedEvent = {
      id: '1',
      type: 'app.started',
      timestamp: new Date().toISOString(),
      payload: {
        environment: 'test',
        userAgent: 'test',
        timestamp: Date.now(),
      },
    };
    eventBus.publish(event);
    expect(received).toHaveLength(0);
  });
});
