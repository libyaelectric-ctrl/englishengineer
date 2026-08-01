import { AppEvent } from './event.types';

export class EventStore {
  private readonly events: AppEvent[] = [];
  private readonly maxLimit = 1000;
  private frozenView: readonly AppEvent[] | null = null;

  public append(event: AppEvent): void {
    if (this.events.length >= this.maxLimit) {
      this.events.shift();
    }
    this.events.push(event);
    this.frozenView = null;
  }

  public getAll(): readonly AppEvent[] {
    if (!this.frozenView) {
      this.frozenView = Object.freeze([...this.events]);
    }
    return this.frozenView;
  }

  public getByType<T extends AppEvent['type']>(type: T): readonly Extract<AppEvent, { type: T }>[] {
    return Object.freeze(
      this.events.filter((e) => e.type === type) as Extract<AppEvent, { type: T }>[]
    );
  }

  public clear(): void {
    this.events.length = 0;
    this.frozenView = null;
  }
}

export const globalEventStore = new EventStore();
