import { OfflineCapability, OfflineCapabilityStatus } from './offline.types';

export const canUseCapability = (
  capability: OfflineCapability,
  isOnline: boolean
): boolean => isOnline || capability.status !== 'internet-required';

export const getCapabilityLabel = (status: OfflineCapabilityStatus): string => {
  if (status === 'available') return 'Offline available';
  if (status === 'limited') return 'Limited offline';
  return 'Requires internet';
};

export const getOfflineSummary = (capabilities: OfflineCapability[]) => ({
  available: capabilities.filter((item) => item.status === 'available').length,
  limited: capabilities.filter((item) => item.status === 'limited').length,
  internetRequired: capabilities.filter(
    (item) => item.status === 'internet-required'
  ).length,
});
