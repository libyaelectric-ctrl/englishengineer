import { logger } from '@/shared/logger';
import {
  AppEvent,
  AppEventHandler,
  EventSubscriptionToken,
} from './event.types';
import { globalEventStore } from './event-store';

class EventBus {
  private readonly listeners = new Map<string, Set<AppEventHandler>>();
  private readonly wildcardListeners = new Set<AppEventHandler>();

  /**
   * Publishes an event to all interested subscribers and records it in the EventStore.
   */
  public publish<T extends AppEvent>(event: T): void {
    // Save to global in-memory EventStore
    globalEventStore.append(event);

    // Notify specific type listeners
    const specificSet = this.listeners.get(event.type);
    if (specificSet) {
      specificSet.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          logger.e(
            `[EventBus] Error executing subscriber for event type "${event.type}":`,
            error
          );
        }
      });
    }

    // Notify wildcard listeners
    this.wildcardListeners.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        logger.e(
          `[EventBus] Error executing wildcard subscriber for event type "${event.type}":`,
          error
        );
      }
    });
  }

  /**
   * Subscribes to a specific event type. Returns a token with an unsubscribe method.
   */
  public subscribe<T extends AppEvent['type']>(
    type: T,
    handler: AppEventHandler<Extract<AppEvent, { type: T }>>
  ): EventSubscriptionToken {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    const set = this.listeners.get(type)!;
    // Cast handler to generic AppEventHandler for storage
    const genericHandler = handler as AppEventHandler;
    set.add(genericHandler);

    return {
      unsubscribe: () => {
        const currentSet = this.listeners.get(type);
        if (currentSet) {
          currentSet.delete(genericHandler);
          if (currentSet.size === 0) {
            this.listeners.delete(type);
          }
        }
      },
    };
  }

  /**
   * Subscribes to all events published through the EventBus.
   */
  public subscribeAll(handler: AppEventHandler): EventSubscriptionToken {
    this.wildcardListeners.add(handler);

    return {
      unsubscribe: () => {
        this.wildcardListeners.delete(handler);
      },
    };
  }

  /**
   * Clears all subscribers for maintenance and testing purposes.
   */
  public clearAllListeners(): void {
    this.listeners.clear();
    this.wildcardListeners.clear();
  }
}

export const eventBus = new EventBus();
export { globalEventStore };
export type { AppEvent, AppEventHandler, EventSubscriptionToken };
