import { useState } from 'react';
import {
  Watch,
  Smartphone,
  BatteryCharging,
  Battery,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Crown,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useWatchStore, WATCH_SUBSCRIPTION_TIERS } from './';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { cn } from '@/shared/utils/cn';

const WatchPage = () => {
  const {
    pairedWatches,
    activeWatchId,
    notifications,
    settings,
    subscriptionTier,
    isSyncing,
    lastSyncError,
    pairWatch,
    unpairWatch,
    syncNow,
    updateSettings,
    acknowledgeNotification,
    clearNotifications,
    updateSubscription,
  } = useWatchStore();

  const activeWatch = pairedWatches.find((w) => w.id === activeWatchId);
  const currentTier = WATCH_SUBSCRIPTION_TIERS[subscriptionTier];

  const [showPairModal, setShowPairModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handlePairDemoWatch = async () => {
    await pairWatch({
      model: 'EngineerOS-Pro',
      serialNumber: `EO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      firmwareVersion: '2.1.0',
      lastSync: null,
      syncStatus: 'connecting',
      batteryLevel: 85,
      batteryStatus: 'high',
      isCharging: false,
    });
    setShowPairModal(false);
  };

  const getBatteryIcon = (level: number, isCharging: boolean) => {
    if (isCharging) return <BatteryCharging className="h-4 w-4" />;
    if (level > 75) return <Battery className="h-4 w-4" />;
    if (level > 25) return <Battery className="h-4 w-4" />;
    return <Battery className="h-4 w-4 text-amber-500" />;
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-emerald-500';
      case 'syncing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="premium-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label="EngineerOS Watch" tone="info" />
              <StatusBadge label="Premium Hardware" tone="success" />
            </div>
            <h1 className="mt-5 text-xs font-bold text-primary uppercase tracking-wider">
              EngineerOS Smart Watch
            </h1>
            <p className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Your learning companion on your wrist.
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-copy">
              Track progress, get vocabulary reminders, meeting prep alerts, and maintain your streak — all from your EngineerOS smart watch.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-10 px-5 text-xs"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <Crown className="h-3.5 w-3.5 mr-2" />
              Upgrade Plan
            </Button>
            {pairedWatches.length === 0 && (
              <Button
                type="button"
                className="min-h-10 px-5 text-xs"
                onClick={() => setShowPairModal(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Pair Watch
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Watch Section */}
      {activeWatch ? (
        <SectionCard
          title="Active Watch"
          subtitle={activeWatch.model}
          icon={Watch}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Watch Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-card border border-border-soft bg-surface p-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                    Model
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {activeWatch.model}
                  </p>
                </div>
                <StatusBadge
                  label={activeWatch.isActive ? 'Active' : 'Inactive'}
                  tone={activeWatch.isActive ? 'success' : 'neutral'}
                />
              </div>

              <div className="flex items-center justify-between rounded-card border border-border-soft bg-surface p-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                    Serial Number
                  </p>
                  <p className="mt-1 text-sm font-mono text-foreground">
                    {activeWatch.serialNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-card border border-border-soft bg-surface p-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                    Firmware
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {activeWatch.firmwareVersion}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="rounded-card border border-border-soft bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                      Battery
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {activeWatch.batteryLevel}%
                    </p>
                  </div>
                  <div className={cn('text-primary', getBatteryIcon(activeWatch.batteryLevel, activeWatch.isCharging))}>
                    {getBatteryIcon(activeWatch.batteryLevel, activeWatch.isCharging)}
                  </div>
                </div>
                <ProgressBar value={activeWatch.batteryLevel} className="mt-3" />
              </div>

              <div className="flex items-center justify-between rounded-card border border-border-soft bg-surface p-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                    Sync Status
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground capitalize">
                    {activeWatch.syncStatus}
                  </p>
                </div>
                <div className={cn(getSyncStatusColor(activeWatch.syncStatus))}>
                  {activeWatch.syncStatus === 'connected' ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-card border border-border-soft bg-surface p-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
                    Last Sync
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {activeWatch.lastSync
                      ? new Date(activeWatch.lastSync).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-8 px-3 text-[10px]"
                  onClick={syncNow}
                  disabled={isSyncing}
                >
                  <RefreshCw className={cn('h-3 w-3 mr-1', isSyncing && 'animate-spin')} />
                  Sync Now
                </Button>
              </div>

              {lastSyncError && (
                <div className="rounded-card border border-red-200 bg-red-50 p-4">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    Sync Error
                  </p>
                  <p className="mt-1 text-xs text-red-700">{lastSyncError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-10 px-5 text-xs"
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            >
              <Bell className="h-3.5 w-3.5 mr-2" />
              {settings.notificationsEnabled ? 'Disable' : 'Enable'} Notifications
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 px-5 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => activeWatch && unpairWatch(activeWatch.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Unpair Watch
            </Button>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="No Watch Paired"
          subtitle="Pair your EngineerOS smart watch to get started"
          icon={Watch}
        >
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="rounded-full border-2 border-dashed border-border-soft bg-surface p-8">
              <Watch className="h-16 w-16 text-muted-copy" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">
                Connect your EngineerOS watch
              </p>
              <p className="mt-2 text-xs text-muted-copy">
                Pair your watch to sync learning progress, receive notifications, and track your streak on your wrist.
              </p>
            </div>
            <Button
              type="button"
              className="min-h-10 px-5 text-xs"
              onClick={() => setShowPairModal(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Pair New Watch
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Subscription Tier */}
      <SectionCard
        title="Current Plan"
        subtitle={currentTier.tier.charAt(0).toUpperCase() + currentTier.tier.slice(1)}
        icon={Crown}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border border-border-soft bg-surface p-4">
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              Monthly Price
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              ${currentTier.monthlyPrice}
            </p>
          </div>
          <div className="rounded-card border border-border-soft bg-surface p-4">
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              AI Requests/Day
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {currentTier.aiRequestsPerDay === -1 ? 'Unlimited' : currentTier.aiRequestsPerDay}
            </p>
          </div>
          <div className="rounded-card border border-border-soft bg-surface p-4">
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              Storage
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {currentTier.storageLimit === -1 ? 'Unlimited' : `${currentTier.storageLimit}MB`}
            </p>
          </div>
          <div className="rounded-card border border-border-soft bg-surface p-4">
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              Priority Support
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {currentTier.prioritySupport ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 inline" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-400 inline" />
              )}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider mb-3">
            Features
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {currentTier.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      {notifications.length > 0 && (
        <SectionCard
          title="Recent Notifications"
          subtitle={`${notifications.length} pending`}
          icon={Bell}
        >
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between gap-4 rounded-card border border-border-soft bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={notification.priority}
                      tone={
                        notification.priority === 'urgent'
                          ? 'danger'
                          : notification.priority === 'high'
                          ? 'warning'
                          : 'info'
                      }
                    />
                    <p className="text-xs font-bold text-foreground">
                      {notification.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-copy">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-copy">
                    {new Date(notification.scheduledFor).toLocaleString()}
                  </p>
                </div>
                {!notification.acknowledged && (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-8 px-3 text-[10px]"
                    onClick={() => acknowledgeNotification(notification.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-10 text-xs"
              onClick={clearNotifications}
            >
              Clear All Notifications
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Pair Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-card border border-border-soft bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Pair EngineerOS Watch</h2>
            <p className="mt-2 text-xs text-muted-copy">
              Connect your watch via Bluetooth or enter your serial number manually.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                className="w-full min-h-10 text-xs"
                onClick={handlePairDemoWatch}
              >
                <Smartphone className="h-3.5 w-3.5 mr-2" />
                Demo Pair (Simulated)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-10 text-xs"
                onClick={() => setShowPairModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-card border border-border-soft bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Upgrade Your Plan</h2>
            <p className="mt-2 text-xs text-muted-copy">
              Choose the plan that fits your engineering communication needs.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.values(WATCH_SUBSCRIPTION_TIERS).map((tier) => (
                <div
                  key={tier.tier}
                  className={cn(
                    'rounded-card border p-4 cursor-pointer transition-all',
                    subscriptionTier === tier.tier
                      ? 'border-primary bg-primary/5'
                      : 'border-border-soft bg-surface hover:border-border-hover'
                  )}
                  onClick={() => {
                    updateSubscription(tier.tier);
                    setShowSubscriptionModal(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground capitalize">{tier.tier}</p>
                    {subscriptionTier === tier.tier && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    ${tier.monthlyPrice}
                    <span className="text-xs font-normal text-muted-copy">/month</span>
                  </p>
                  <p className="mt-2 text-[10px] text-muted-copy">{tier.watchModel}</p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full min-h-10 text-xs"
              onClick={() => setShowSubscriptionModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;
