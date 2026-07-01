import { AppEvent } from './event.types';

export class EventStore {
  private readonly events: AppEvent[] = [];
  private readonly maxLimit = 1000;

  public append(event: AppEvent): void {
    if (this.events.length >= this.maxLimit) {
      this.events.shift(); // Evict oldest event to keep memory bounded
    }
    this.events.push(event);
  }

  public getAll(): readonly AppEvent[] {
    return Object.freeze([...this.events]);
  }

  public getByType<T extends AppEvent['type']>(
    type: T
  ): readonly Extract<AppEvent, { type: T }>[] {
    return Object.freeze(
      this.events.filter((e) => e.type === type) as Extract<
        AppEvent,
        { type: T }
      >[]
    );
  }

  public clear(): void {
    this.events.length = 0;
  }
}

export const globalEventStore = new EventStore();
