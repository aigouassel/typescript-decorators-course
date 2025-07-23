import 'reflect-metadata';
import { track } from './decorators.js';

/**
 * Exercise 3: Property Logger
 * Create a @track property decorator that logs when a property is set or accessed
 */

// Test class
export class UserProfile {
  @track
  name: string = '';

  @track
  email: string = '';

  // Non-tracked property for comparison
  age: number = 0;
}