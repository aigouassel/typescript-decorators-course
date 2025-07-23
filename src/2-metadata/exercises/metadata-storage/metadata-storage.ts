/**
 * Exercise: Class vs Instance Metadata
 * 
 * Understand the difference between class-level and instance-level metadata.
 * 
 * Requirements:
 * - Store metadata on class constructors
 * - Store metadata on individual instances
 * - Demonstrate inheritance behavior
 * - Show when to use each approach
 * - Build metadata storage utilities
 */

import 'reflect-metadata';

// ===== METADATA STORAGE PATTERNS =====

// Simple key-value metadata store
class MetadataStore {
  // TODO: Implement static methods for metadata operations
  static set(key: string, value: any, target: any, propertyKey?: string): void {
    // Store metadata using Reflect.defineMetadata
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static get<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
    // Retrieve metadata using Reflect.getMetadata
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static has(key: string, target: any, propertyKey?: string): boolean {
    // Check if metadata exists using Reflect.hasMetadata
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static delete(key: string, target: any, propertyKey?: string): boolean {
    // Delete metadata using Reflect.deleteMetadata
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static getKeys(target: any, propertyKey?: string): any[] {
    // Get all metadata keys using Reflect.getMetadataKeys
    throw new Error('NOT_IMPLEMENTED');
  }
}

// Array-based metadata store for collections
class ArrayMetadataStore {
  static push<T>(key: string, item: T, target: any, propertyKey?: string): void {
    // TODO: Get existing array, add item, store back
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static getArray<T>(key: string, target: any, propertyKey?: string): T[] {
    // TODO: Return metadata array or empty array if none exists
    throw new Error('NOT_IMPLEMENTED');
  }
  
  static remove<T>(key: string, item: T, target: any, propertyKey?: string): boolean {
    // TODO: Remove item from metadata array
    throw new Error('NOT_IMPLEMENTED');
  }
}

// ===== CLASS VS INSTANCE METADATA =====

// Base class to demonstrate inheritance
class BaseEntity {
  id: number = 0;
  createdAt: Date = new Date();
}

// Derived class
class User extends BaseEntity {
  name: string = '';
  email: string = '';
}

// ===== PRACTICAL EXAMPLES =====

// Entity configuration using class metadata
function configureEntity(entityClass: any, tableName: string, schema?: string) {
  // TODO: Store entity configuration as class metadata
  console.log(`Configuring entity ${entityClass.name} for table ${tableName}`);
}

// Track instance state using instance metadata
function trackInstanceState(instance: any, state: string) {
  // TODO: Store state information on the specific instance
  console.log(`Tracking state "${state}" for instance`);
}

// Get all instances with specific metadata
function findInstancesWithMetadata(instances: any[], key: string, value: any): any[] {
  // TODO: Filter instances that have matching metadata
  return instances.filter(instance => {
    // Check instance metadata
    return false;
  });
}

export { 
  MetadataStore, 
  ArrayMetadataStore, 
  BaseEntity, 
  User, 
  configureEntity, 
  trackInstanceState, 
  findInstancesWithMetadata 
};