import 'reflect-metadata';

/**
 * Exercise: Basic Metadata Operations
 * 
 * Learn fundamental metadata operations using the Reflect API.
 * 
 * Requirements:
 * - Set and get metadata on classes and properties
 * - Check if metadata exists  
 * - Delete metadata
 * - Work with multiple metadata keys
 * - Understand metadata inheritance
 */

// ===== TODO: IMPLEMENT THESE FUNCTIONS =====

/**
 * Set metadata on a target (class or property)
 */
export function setMetadata(key: string, value: any, target: any, propertyKey?: string): void {
  // TODO: Use Reflect.defineMetadata to set metadata
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get metadata from a target
 */
export function getMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // TODO: Use Reflect.getMetadata to retrieve metadata
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Check if metadata exists on a target
 */
export function hasMetadata(key: string, target: any, propertyKey?: string): boolean {
  // TODO: Use Reflect.hasMetadata to check existence
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Delete metadata from a target
 */
export function deleteMetadata(key: string, target: any, propertyKey?: string): boolean {
  // TODO: Use Reflect.deleteMetadata to remove metadata
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get all metadata keys from a target
 */
export function getMetadataKeys(target: any, propertyKey?: string): any[] {
  // TODO: Use Reflect.getMetadataKeys to get all keys
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get metadata with inheritance (checks parent classes too)
 */
export function getInheritedMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // TODO: Use Reflect.getMetadata (includes inheritance by default)
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get own metadata (without inheritance)
 */
export function getOwnMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // TODO: Use Reflect.getOwnMetadata to get only direct metadata
  throw new Error('NOT_IMPLEMENTED');
}

// ===== TEST CLASSES =====

export class BaseEntity {
  id: number = 0;
  createdAt: Date = new Date();
}

export class User extends BaseEntity {
  name: string = '';
  email: string = '';
  age: number = 0;
}

export class Product {
  name: string = '';
  price: number = 0;
  category: string = '';
}
