import { useEffect, useRef } from 'react';
import { eventBus, AppEvent, EventSubscriptionToken } from '@/core/events';

export function useEventSubscription<T extends AppEvent['type']>(
  type: T,
  handler: (event: Extract<AppEvent, { type: T }>) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const token: EventSubscriptionToken = eventBus.subscribe(
      type,
      (event) => handlerRef.current(event as Extract<AppEvent, { type: T }>)
    );
    return () => token.unsubscribe();
  }, [type]);
}

export function useEventSubscriptionAll(
  handler: (event: AppEvent) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const token = eventBus.subscribeAll((event) => handlerRef.current(event));
    return () => token.unsubscribe();
  }, []);
}
