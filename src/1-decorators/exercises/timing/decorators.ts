/**
 * Decorators for Exercise 1: Configurable Timing Decorator
 */

export interface TimingOptions {
  unit?: 'ms' | 'seconds';
  threshold?: number;
  includeArgs?: boolean;
}

// TODO: Implement the @timing decorator factory
export function timing(options: TimingOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    throw new Error('NOT_IMPLEMENTED');
  };
}