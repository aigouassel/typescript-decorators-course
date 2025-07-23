import 'reflect-metadata';
import { notEmpty } from './decorators.js';

/**
 * Exercise 5: Simple Validation
 * Create a @notEmpty property decorator that validates string properties are not empty
 */

// Test class
export class User {
  @notEmpty
  name!: string;

  @notEmpty
  email!: string;

  // Non-validated property for comparison
  description: string = '';
}