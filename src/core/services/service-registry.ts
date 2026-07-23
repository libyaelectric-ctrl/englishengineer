/**
 * Service Registry — enables dependency injection for testability.
 * Services register themselves and can be resolved by name.
 */

type ServiceFactory<T> = () => T;

const factories = new Map<string, ServiceFactory<unknown>>();
const instances = new Map<string, unknown>();

export const ServiceRegistry = {
  /**
   * Register a service factory. Factory is called once on first resolve.
   */
  register<T>(name: string, factory: ServiceFactory<T>): void {
    factories.set(name, factory as ServiceFactory<unknown>);
  },

  /**
   * Resolve a service by name. Returns cached instance if already resolved.
   */
  resolve<T>(name: string): T {
    if (instances.has(name)) {
      return instances.get(name) as T;
    }

    const factory = factories.get(name);
    if (!factory) {
      throw new Error(`Service "${name}" not registered`);
    }

    const instance = factory();
    instances.set(name, instance);
    return instance;
  },

  /**
   * Override a service (useful for testing).
   */
  override<T>(name: string, instance: T): void {
    instances.set(name, instance);
  },

  /**
   * Reset all instances (useful for testing).
   */
  reset(): void {
    instances.clear();
  },
};
