import 'reflect-metadata';
import { classInfo, type ClassInfo } from './decorators.js';

/**
 * Exercise 2: Class Information Decorator
 * Create a @classInfo decorator that adds a static property with class information
 */

export type { ClassInfo };

// Test classes
@classInfo
export class User {
  name: string = '';
  email: string = '';
}

@classInfo
export class Product {
  title: string = '';
  price: number = 0;
}

// Non-decorated class for comparison
export class PlainClass {
  value: string = '';
}