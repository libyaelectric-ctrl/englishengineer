import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WatchDevice,
  WatchLearningNotification,
  WatchSettings,
  WatchStoreState,
  WatchSyncStatus,
} from './watch.types';

const generateId = () => `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_SETTINGS: WatchSettings = {
  notificationsEnabled: true,
  vocabularyReminders: true,
  meetingPrepAlerts: true,
  streakAlerts: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  hapticFeedback: true,
  screenBrightness: 80,
  autoSync: true,
  batteryOptimization: true,
};

export const useWatchStore = create<WatchStoreState>()(
  persist(
    (set, get) => ({
      pairedWatches: [],
      activeWatchId: null,
      notifications: [],
      settings: DEFAULT_SETTINGS,
      subscriptionTier: 'free',
      isSyncing: false,
      lastSyncError: null,

      pairWatch: async (watchData) => {
        const newWatch: WatchDevice = {
          ...watchData,
          id: generateId(),
          pairedAt: new Date().toISOString(),
          isActive: false,
        };

        set((state) => {
          const updated = [...state.pairedWatches, newWatch];
          const activeId = state.activeWatchId || newWatch.id;
          return {
            pairedWatches: updated,
            activeWatchId: activeId,
          };
        });

        // Simulate initial sync
        await get().syncNow();
        return newWatch.id;
      },

      unpairWatch: async (watchId) => {
        set((state) => {
          const updated = state.pairedWatches.filter((w) => w.id !== watchId);
          const newActiveId = state.activeWatchId === watchId 
            ? (updated.length > 0 ? updated[0].id : null)
            : state.activeWatchId;
          return {
            pairedWatches: updated,
            activeWatchId: newActiveId,
          };
        });
      },

      setActiveWatch: (watchId) => {
        set((state) => ({
          activeWatchId: watchId,
          pairedWatches: state.pairedWatches.map((w) => ({
            ...w,
            isActive: w.id === watchId,
          })),
        }));
      },

      syncNow: async () => {
        const { activeWatchId } = get();
        if (!activeWatchId) return;

        set({ isSyncing: true, lastSyncError: null });

        try {
          // Simulate sync delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          set((state) => ({
            pairedWatches: state.pairedWatches.map((w) =>
              w.id === activeWatchId
                ? {
                    ...w,
                    syncStatus: 'connected' as WatchSyncStatus,
                    lastSync: new Date().toISOString(),
                  }
                : w
            ),
            isSyncing: false,
          }));
        } catch (error) {
          set({
            isSyncing: false,
            lastSyncError: error instanceof Error ? error.message : 'Sync failed',
          });
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      scheduleNotification: (notification) => {
        const newNotification: WatchLearningNotification = {
          ...notification,
          id: generateId(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification].sort(
            (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
          ),
        }));

        return newNotification.id;
      },

      acknowledgeNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId
              ? { ...n, acknowledged: true, sentAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      updateSubscription: (tier) => {
        set({ subscriptionTier: tier });
      },
    }),
    {
      name: 'engineeros-watch-storage',
    }
  )
);
