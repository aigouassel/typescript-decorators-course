import 'reflect-metadata';
import { log } from './decorators.js';

/**
 * Exercise 1: Simple Log Decorator
 * Create a @log decorator that logs when a method is called
 */

// Test class
export class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }

  @log
  multiply(x: number, y: number): number {
    return x * y;
  }

  // Non-decorated method for comparison
  subtract(a: number, b: number): number {
    return a - b;
  }
}