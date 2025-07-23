import 'reflect-metadata';
import { timing, type TimingOptions } from './decorators.js';

/**
 * Exercise 1: Configurable Timing Decorator
 * Create a @timing decorator factory that measures method execution time with configurable options
 */

export type { TimingOptions };

// Test class
export class DataProcessor {
  @timing({ unit: 'ms', threshold: 0, includeArgs: true })
  processData(data: number[]): number {
    // Simulate processing
    return data.reduce((sum, num) => sum + num, 0);
  }

  @timing({ unit: 'seconds', threshold: 0 })
  async asyncOperation(delay: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Completed after ${delay}ms`;
  }

  @timing({ threshold: 100 }) // Only log if > 100ms
  heavyComputation(iterations: number): number {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.random();
    }
    return result;
  }

  // Non-timed method for comparison
  simpleMethod(): string {
    return 'simple result';
  }
}