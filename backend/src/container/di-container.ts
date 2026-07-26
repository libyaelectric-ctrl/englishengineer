/**
 * Simple Dependency Injection Container.
 * Manages service lifecycle and dependencies.
 */

type Factory<T> = () => T;
type AsyncFactory<T> = () => Promise<T>;

interface ServiceDefinition<T = unknown> {
  factory: Factory<T> | AsyncFactory<T>;
  singleton: boolean;
  instance?: T;
}

export class DIContainer {
  private services = new Map<string, ServiceDefinition>();
  private resolving = new Set<string>();

  /**
   * Register a singleton service.
   */
  registerSingleton<T>(name: string, factory: Factory<T> | AsyncFactory<T>): void {
    this.services.set(name, { factory, singleton: true });
  }

  /**
   * Register a transient service (new instance each time).
   */
  registerTransient<T>(name: string, factory: Factory<T> | AsyncFactory<T>): void {
    this.services.set(name, { factory, singleton: false });
  }

  /**
   * Register a pre-created instance.
   */
  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, {
      factory: () => instance,
      singleton: true,
      instance,
    });
  }

  /**
   * Resolve a service by name.
   */
  resolve<T>(name: string): T {
    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`Service '${name}' not registered`);
    }

    // Circular dependency detection
    if (this.resolving.has(name)) {
      throw new Error(`Circular dependency detected for '${name}'`);
    }

    // Return cached instance for singletons
    if (definition.singleton && definition.instance !== undefined) {
      return definition.instance as T;
    }

    this.resolving.add(name);
    try {
      const instance = (definition.factory as Factory<T>)();

      if (definition.singleton) {
        definition.instance = instance;
      }

      return instance;
    } finally {
      this.resolving.delete(name);
    }
  }

  /**
   * Resolve a service asynchronously.
   */
  async resolveAsync<T>(name: string): Promise<T> {
    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (this.resolving.has(name)) {
      throw new Error(`Circular dependency detected for '${name}'`);
    }

    if (definition.singleton && definition.instance !== undefined) {
      return definition.instance as T;
    }

    this.resolving.add(name);
    try {
      const instance = await (definition.factory as AsyncFactory<T>)();

      if (definition.singleton) {
        definition.instance = instance;
      }

      return instance;
    } finally {
      this.resolving.delete(name);
    }
  }

  /**
   * Check if a service is registered.
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names.
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all registrations.
   */
  clear(): void {
    this.services.clear();
    this.resolving.clear();
  }
}

// Global container instance
let globalContainer: DIContainer | null = null;

export const getContainer = (): DIContainer => {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
};

export const resetContainer = (): void => {
  globalContainer = null;
};
