/**
 * Decorators for Exercise 2: Class Information Decorator
 */

export interface ClassInfo {
  name: string;
  createdAt: Date;
}

// TODO: Implement the @classInfo decorator
export function classInfo<T extends new(...args: any[]) => {}>(constructor: T) {
  throw new Error('NOT_IMPLEMENTED');
}