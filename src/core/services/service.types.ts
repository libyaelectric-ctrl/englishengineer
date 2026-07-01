export interface ServiceMetadata {
  readonly serviceName: string;
  readonly status: 'uninitialized' | 'active' | 'suspended';
  readonly initializedAt?: string;
}
