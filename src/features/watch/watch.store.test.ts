import { beforeEach, describe, expect, it } from 'vitest';
import { useWatchStore } from './watch.store';

const mockWatchData = {
  model: 'EngineerOS-Pro' as const,
  serialNumber: 'SN-001',
  firmwareVersion: '1.0.0',
  lastSync: null,
  syncStatus: 'disconnected' as const,
  batteryLevel: 100,
  batteryStatus: 'full' as const,
  isCharging: false,
};

describe('useWatchStore', () => {
  beforeEach(() => {
    useWatchStore.setState({
      pairedWatches: [],
      activeWatchId: null,
      notifications: [],
      settings: {
        notificationsEnabled: true,
        vocabularyReminders: true,
        meetingPrepAlerts: true,
        streakAlerts: true,
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        hapticFeedback: true,
        screenBrightness: 80,
        autoSync: true,
        batteryOptimization: true,
      },
      subscriptionTier: 'free',
      isSyncing: false,
      lastSyncError: null,
    });
  });

  it('starts with empty state', () => {
    const state = useWatchStore.getState();
    expect(state.pairedWatches).toEqual([]);
    expect(state.activeWatchId).toBeNull();
    expect(state.notifications).toEqual([]);
    expect(state.subscriptionTier).toBe('free');
  });

  it('pairs a new watch', async () => {
    const store = useWatchStore.getState();
    const watchId = await store.pairWatch(mockWatchData);

    const state = useWatchStore.getState();
    expect(state.pairedWatches.length).toBe(1);
    expect(state.pairedWatches[0].model).toBe('EngineerOS-Pro');
    expect(state.activeWatchId).toBe(watchId);
  });

  it('unpairs a watch', async () => {
    const store = useWatchStore.getState();
    const watchId = await store.pairWatch(mockWatchData);

    await useWatchStore.getState().unpairWatch(watchId);

    const state = useWatchStore.getState();
    expect(state.pairedWatches.length).toBe(0);
    expect(state.activeWatchId).toBeNull();
  });

  it('sets active watch', async () => {
    const store = useWatchStore.getState();
    await store.pairWatch(mockWatchData);
    const id2 = await useWatchStore.getState().pairWatch({
      ...mockWatchData,
      serialNumber: 'SN-002',
    });

    useWatchStore.getState().setActiveWatch(id2);

    const state = useWatchStore.getState();
    expect(state.activeWatchId).toBe(id2);
  });

  it('updates settings', () => {
    useWatchStore.getState().updateSettings({ screenBrightness: 50 });

    const state = useWatchStore.getState();
    expect(state.settings.screenBrightness).toBe(50);
    expect(state.settings.notificationsEnabled).toBe(true);
  });

  it('schedules a notification', () => {
    const notificationId = useWatchStore.getState().scheduleNotification({
      type: 'vocabulary',
      title: 'Test',
      message: 'Test message',
      priority: 'medium',
      scheduledFor: new Date().toISOString(),
    });

    const state = useWatchStore.getState();
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].id).toBe(notificationId);
    expect(state.notifications[0].acknowledged).toBeFalsy();
  });

  it('acknowledges a notification', () => {
    const id = useWatchStore.getState().scheduleNotification({
      type: 'streak',
      title: 'Streak',
      message: 'Keep going',
      priority: 'low',
      scheduledFor: new Date().toISOString(),
    });

    useWatchStore.getState().acknowledgeNotification(id);

    const state = useWatchStore.getState();
    expect(state.notifications[0].acknowledged).toBe(true);
    expect(state.notifications[0].sentAt).toBeDefined();
  });

  it('clears all notifications', () => {
    useWatchStore.getState().scheduleNotification({
      type: 'meeting',
      title: 'Meeting',
      message: 'msg',
      priority: 'high',
      scheduledFor: new Date().toISOString(),
    });

    useWatchStore.getState().clearNotifications();

    const state = useWatchStore.getState();
    expect(state.notifications).toEqual([]);
  });

  it('updates subscription tier', () => {
    useWatchStore.getState().updateSubscription('pro');

    const state = useWatchStore.getState();
    expect(state.subscriptionTier).toBe('pro');
  });
});
