import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  setMetadata,
  getMetadata,
  hasMetadata,
  deleteMetadata,
  getMetadataKeys,
  getInheritedMetadata,
  getOwnMetadata,
  BaseEntity,
  User,
  Product,
} from './basic-operations';

describe('Exercise: Basic Metadata Operations', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Clear any existing metadata
    const targets = [User, User.prototype, Product, Product.prototype, BaseEntity, BaseEntity.prototype];
    targets.forEach(target => {
      const keys = Reflect.getMetadataKeys(target) || [];
      keys.forEach(key => {
        Reflect.deleteMetadata(key, target);
      });
    });
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('setMetadata function', () => {
    it('should set metadata on class', () => {
      setMetadata('test:key', 'test-value', User);
      
      const result = Reflect.getMetadata('test:key', User);
      expect(result).toBe('test-value');
    });

    it('should set metadata on property', () => {
      setMetadata('prop:key', 'prop-value', User.prototype, 'name');
      
      const result = Reflect.getMetadata('prop:key', User.prototype, 'name');
      expect(result).toBe('prop-value');
    });

    it('should handle different value types', () => {
      setMetadata('string:key', 'text', User);
      setMetadata('number:key', 42, User);
      setMetadata('boolean:key', true, User);
      setMetadata('object:key', { test: 'value' }, User);
      
      expect(Reflect.getMetadata('string:key', User)).toBe('text');
      expect(Reflect.getMetadata('number:key', User)).toBe(42);
      expect(Reflect.getMetadata('boolean:key', User)).toBe(true);
      expect(Reflect.getMetadata('object:key', User)).toEqual({ test: 'value' });
    });
  });

  describe('getMetadata function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('test:class', 'class-value', User);
      Reflect.defineMetadata('test:prop', 'prop-value', User.prototype, 'name');
    });

    it('should get metadata from class', () => {
      const result = getMetadata('test:class', User);
      expect(result).toBe('class-value');
    });

    it('should get metadata from property', () => {
      const result = getMetadata('test:prop', User.prototype, 'name');
      expect(result).toBe('prop-value');
    });

    it('should return undefined for non-existent metadata', () => {
      const result = getMetadata('non:existent', User);
      expect(result).toBeUndefined();
    });

    it('should handle generic type parameter', () => {
      Reflect.defineMetadata('typed:key', 'typed-value', User);
      
      const result = getMetadata<string>('typed:key', User);
      expect(result).toBe('typed-value');
      expect(typeof result).toBe('string');
    });
  });

  describe('hasMetadata function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('exists:key', 'value', User);
      Reflect.defineMetadata('prop:exists', 'value', User.prototype, 'email');
    });

    it('should return true for existing class metadata', () => {
      const result = hasMetadata('exists:key', User);
      expect(result).toBe(true);
    });

    it('should return true for existing property metadata', () => {
      const result = hasMetadata('prop:exists', User.prototype, 'email');
      expect(result).toBe(true);
    });

    it('should return false for non-existent metadata', () => {
      const result = hasMetadata('non:existent', User);
      expect(result).toBe(false);
    });

    it('should return false for wrong target', () => {
      const result = hasMetadata('exists:key', Product);
      expect(result).toBe(false);
    });
  });

  describe('deleteMetadata function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('delete:me', 'value', User);
      Reflect.defineMetadata('prop:delete', 'value', User.prototype, 'name');
    });

    it('should delete existing class metadata', () => {
      expect(Reflect.hasMetadata('delete:me', User)).toBe(true);
      
      const result = deleteMetadata('delete:me', User);
      expect(result).toBe(true);
      expect(Reflect.hasMetadata('delete:me', User)).toBe(false);
    });

    it('should delete existing property metadata', () => {
      expect(Reflect.hasMetadata('prop:delete', User.prototype, 'name')).toBe(true);
      
      const result = deleteMetadata('prop:delete', User.prototype, 'name');
      expect(result).toBe(true);
      expect(Reflect.hasMetadata('prop:delete', User.prototype, 'name')).toBe(false);
    });

    it('should return false for non-existent metadata', () => {
      const result = deleteMetadata('non:existent', User);
      expect(result).toBe(false);
    });
  });

  describe('getMetadataKeys function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('key1', 'value1', User);
      Reflect.defineMetadata('key2', 'value2', User);
      Reflect.defineMetadata('prop:key1', 'value1', User.prototype, 'name');
      Reflect.defineMetadata('prop:key2', 'value2', User.prototype, 'name');
    });

    it('should get all class metadata keys', () => {
      const keys = getMetadataKeys(User);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    it('should get all property metadata keys', () => {
      const keys = getMetadataKeys(User.prototype, 'name');
      expect(keys).toContain('prop:key1');
      expect(keys).toContain('prop:key2');
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for target with no metadata', () => {
      const keys = getMetadataKeys(Product);
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe('getInheritedMetadata function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('base:key', 'base-value', BaseEntity);
      Reflect.defineMetadata('base:prop', 'base-prop-value', BaseEntity.prototype, 'id');
      Reflect.defineMetadata('user:key', 'user-value', User);
    });

    it('should get metadata from parent class', () => {
      const result = getInheritedMetadata('base:key', User);
      expect(result).toBe('base-value');
    });

    it('should get metadata from parent property', () => {
      const result = getInheritedMetadata('base:prop', User.prototype, 'id');
      expect(result).toBe('base-prop-value');
    });

    it('should get own metadata when available', () => {
      const result = getInheritedMetadata('user:key', User);
      expect(result).toBe('user-value');
    });

    it('should return undefined for non-existent metadata', () => {
      const result = getInheritedMetadata('non:existent', User);
      expect(result).toBeUndefined();
    });
  });

  describe('getOwnMetadata function', () => {
    beforeEach(() => {
      Reflect.defineMetadata('base:key', 'base-value', BaseEntity);
      Reflect.defineMetadata('user:key', 'user-value', User);
    });

    it('should get own metadata', () => {
      const result = getOwnMetadata('user:key', User);
      expect(result).toBe('user-value');
    });

    it('should not get inherited metadata', () => {
      const result = getOwnMetadata('base:key', User);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent metadata', () => {
      const result = getOwnMetadata('non:existent', User);
      expect(result).toBeUndefined();
    });
  });

  describe('Metadata inheritance behavior', () => {
    it('should demonstrate proper inheritance', () => {
      // Set metadata on base class
      Reflect.defineMetadata('entity:base', 'base-entity', BaseEntity);
      Reflect.defineMetadata('prop:base', 'base-prop', BaseEntity.prototype, 'id');
      
      // Set metadata on derived class
      Reflect.defineMetadata('entity:derived', 'user-entity', User);
      
      // Test inheritance with getMetadata (should include inherited)
      expect(getInheritedMetadata('entity:base', User)).toBe('base-entity');
      expect(getInheritedMetadata('entity:derived', User)).toBe('user-entity');
      expect(getInheritedMetadata('prop:base', User.prototype, 'id')).toBe('base-prop');
      
      // Test own metadata (should not include inherited)
      expect(getOwnMetadata('entity:base', User)).toBeUndefined(); // Not own metadata
      expect(getOwnMetadata('entity:derived', User)).toBe('user-entity'); // Own metadata
    });
  });

  describe('Multiple metadata operations', () => {
    it('should handle multiple operations on same target', () => {
      // Set multiple values
      setMetadata('key1', 'value1', User);
      setMetadata('key2', 'value2', User);
      setMetadata('key3', 'value3', User);
      
      // Check all exist
      expect(hasMetadata('key1', User)).toBe(true);
      expect(hasMetadata('key2', User)).toBe(true);
      expect(hasMetadata('key3', User)).toBe(true);
      
      // Get all keys
      const keys = getMetadataKeys(User);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      
      // Delete one
      deleteMetadata('key2', User);
      expect(hasMetadata('key2', User)).toBe(false);
      expect(hasMetadata('key1', User)).toBe(true); // Others still exist
      expect(hasMetadata('key3', User)).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null and undefined values', () => {
      setMetadata('null:key', null, User);
      setMetadata('undefined:key', undefined, User);
      
      expect(getMetadata('null:key', User)).toBe(null);
      expect(getMetadata('undefined:key', User)).toBe(undefined);
    });

    it('should handle empty string keys', () => {
      setMetadata('', 'empty-key-value', User);
      expect(getMetadata('', User)).toBe('empty-key-value');
    });

    it('should handle symbol keys', () => {
      const symbolKey = Symbol('test');
      Reflect.defineMetadata(symbolKey, 'symbol-value', User);
      
      expect(Reflect.getMetadata(symbolKey, User)).toBe('symbol-value');
    });
  });
});