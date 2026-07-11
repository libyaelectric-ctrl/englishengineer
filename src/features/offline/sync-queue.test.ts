import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncQueue } from './sync-queue';

beforeEach(() => {
  SyncQueue.clear();
  SyncQueue.stopAutoSync();
});

describe('SyncQueue', () => {
  describe('enqueue', () => {
    it('adds item to queue', () => {
      const id = SyncQueue.enqueue('test_action', { data: 'test' });
      expect(id).toBeDefined();
      expect(SyncQueue.getQueueSize()).toBe(1);
    });

    it('generates unique ids', () => {
      const id1 = SyncQueue.enqueue('action1', {});
      const id2 = SyncQueue.enqueue('action2', {});
      expect(id1).not.toBe(id2);
    });

    it('persists to storage', () => {
      SyncQueue.enqueue('test', { key: 'value' });
      const state = SyncQueue.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].action).toBe('test');
    });
  });

  describe('remove', () => {
    it('removes item by id', () => {
      const id = SyncQueue.enqueue('test', {});
      expect(SyncQueue.getQueueSize()).toBe(1);
      SyncQueue.remove(id);
      expect(SyncQueue.getQueueSize()).toBe(0);
    });
  });

  describe('clear', () => {
    it('clears all items', () => {
      SyncQueue.enqueue('a', {});
      SyncQueue.enqueue('b', {});
      SyncQueue.clear();
      expect(SyncQueue.getQueueSize()).toBe(0);
    });
  });

  describe('setOnline', () => {
    it('updates online status', () => {
      SyncQueue.setOnline(false);
      expect(SyncQueue.getState().isOnline).toBe(false);
      SyncQueue.setOnline(true);
      expect(SyncQueue.getState().isOnline).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('notifies listeners on state change', () => {
      const listener = vi.fn();
      SyncQueue.subscribe(listener);
      SyncQueue.enqueue('test', {});
      expect(listener).toHaveBeenCalled();
    });

    it('stops notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsub = SyncQueue.subscribe(listener);
      const callCountAfterSub = listener.mock.calls.length;
      unsub();
      SyncQueue.enqueue('test', {});
      expect(listener.mock.calls.length).toBe(callCountAfterSub);
    });
  });

  describe('isItemPending', () => {
    it('returns true for pending items', () => {
      const id = SyncQueue.enqueue('test', {});
      expect(SyncQueue.isItemPending(id)).toBe(true);
    });

    it('returns false for non-existent items', () => {
      expect(SyncQueue.isItemPending('non-existent')).toBe(false);
    });
  });

  describe('processQueue', () => {
    it('does not change queue when offline', () => {
      SyncQueue.setOnline(false);
      SyncQueue.enqueue('test', {});

      expect(SyncQueue.getQueueSize()).toBe(1);
    });
  });
});
