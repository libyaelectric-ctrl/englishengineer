export type OfflineCapabilityStatus =
  | 'available'
  | 'limited'
  | 'internet-required';

export interface OfflineCapability {
  id: string;
  name: string;
  description: string;
  status: OfflineCapabilityStatus;
}
