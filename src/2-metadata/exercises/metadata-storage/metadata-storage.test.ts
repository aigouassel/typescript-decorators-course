import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  MetadataStore,
  ArrayMetadataStore,
  BaseEntity,
  User,
  configureEntity,
  trackInstanceState,
  findInstancesWithMetadata
} from './metadata-storage';

describe('Exercise: Metadata Storage', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Clear any existing metadata
    const targets = [User, User.prototype, BaseEntity, BaseEntity.prototype];
    targets.forEach(target => {
      const keys = Reflect.getMetadataKeys(target) || [];
      keys.forEach(key => {
        Reflect.deleteMetadata(key, target);
      });
    });
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('MetadataStore class', () => {
    describe('set method', () => {
      it('should set metadata on target', () => {
        MetadataStore.set('test:key', 'test-value', User);
        
        const result = Reflect.getMetadata('test:key', User);
        expect(result).toBe('test-value');
      });

      it('should set metadata on property', () => {
        MetadataStore.set('prop:key', 'prop-value', User.prototype, 'name');
        
        const result = Reflect.getMetadata('prop:key', User.prototype, 'name');
        expect(result).toBe('prop-value');
      });

      it('should log when setting metadata', () => {
        MetadataStore.set('test:key', 'value', User);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          'Setting metadata: test:key on',
          expect.any(String)
        );
      });
    });

    describe('get method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('test:get', 'get-value', User);
        Reflect.defineMetadata('prop:get', 'prop-get-value', User.prototype, 'email');
      });

      it('should get metadata from target', () => {
        const result = MetadataStore.get('test:get', User);
        expect(result).toBe('get-value');
      });

      it('should get metadata from property', () => {
        const result = MetadataStore.get('prop:get', User.prototype, 'email');
        expect(result).toBe('prop-get-value');
      });

      it('should return undefined for non-existent metadata', () => {
        const result = MetadataStore.get('non:existent', User);
        expect(result).toBeUndefined();
      });
    });

    describe('has method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('exists:key', 'value', User);
      });

      it('should return true for existing metadata', () => {
        const result = MetadataStore.has('exists:key', User);
        expect(result).toBe(true);
      });

      it('should return false for non-existent metadata', () => {
        const result = MetadataStore.has('non:existent', User);
        expect(result).toBe(false);
      });
    });

    describe('delete method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('delete:me', 'value', User);
      });

      it('should delete existing metadata', () => {
        expect(Reflect.hasMetadata('delete:me', User)).toBe(true);
        
        const result = MetadataStore.delete('delete:me', User);
        expect(result).toBe(true);
        expect(Reflect.hasMetadata('delete:me', User)).toBe(false);
      });

      it('should return false for non-existent metadata', () => {
        const result = MetadataStore.delete('non:existent', User);
        expect(result).toBe(false);
      });
    });

    describe('getKeys method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('key1', 'value1', User);
        Reflect.defineMetadata('key2', 'value2', User);
      });

      it('should return all metadata keys', () => {
        const keys = MetadataStore.getKeys(User);
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
      });

      it('should return empty array for target with no metadata', () => {
        class EmptyClass {}
        const keys = MetadataStore.getKeys(EmptyClass);
        expect(Array.isArray(keys)).toBe(true);
      });
    });
  });

  describe('ArrayMetadataStore class', () => {
    describe('push method', () => {
      it('should add item to metadata array', () => {
        ArrayMetadataStore.push('test:array', 'item1', User);
        ArrayMetadataStore.push('test:array', 'item2', User);
        
        const result = Reflect.getMetadata('test:array', User);
        expect(result).toEqual(['item1', 'item2']);
      });

      it('should log when pushing', () => {
        ArrayMetadataStore.push('test:array', 'item', User);
        
        expect(consoleSpy).toHaveBeenCalledWith('Pushing to array metadata: test:array');
      });
    });

    describe('getArray method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('existing:array', ['existing1', 'existing2'], User);
      });

      it('should return existing array', () => {
        const result = ArrayMetadataStore.getArray('existing:array', User);
        expect(result).toEqual(['existing1', 'existing2']);
      });

      it('should return empty array for non-existent metadata', () => {
        const result = ArrayMetadataStore.getArray('non:existent', User);
        expect(result).toEqual([]);
      });
    });

    describe('remove method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('remove:array', ['item1', 'item2', 'item3'], User);
      });

      it('should remove existing item from array', () => {
        const result = ArrayMetadataStore.remove('remove:array', 'item2', User);
        expect(result).toBe(true);
        
        const updatedArray = Reflect.getMetadata('remove:array', User);
        expect(updatedArray).toEqual(['item1', 'item3']);
      });

      it('should return false for non-existent item', () => {
        const result = ArrayMetadataStore.remove('remove:array', 'non-existent', User);
        expect(result).toBe(false);
      });

      it('should return false for non-existent array', () => {
        const result = ArrayMetadataStore.remove('non:existent', 'item', User);
        expect(result).toBe(false);
      });
    });
  });

  describe('Class vs Instance Metadata', () => {
    it('should demonstrate class metadata sharing', () => {
      // Set class metadata
      MetadataStore.set('class:shared', 'shared-value', User);
      
      const user1 = new User();
      const user2 = new User();
      
      // Both instances should access the same class metadata
      const value1 = MetadataStore.get('class:shared', user1.constructor);
      const value2 = MetadataStore.get('class:shared', user2.constructor);
      
      expect(value1).toBe('shared-value');
      expect(value2).toBe('shared-value');
      expect(value1).toBe(value2);
    });

    it('should demonstrate instance metadata isolation', () => {
      const user1 = new User();
      const user2 = new User();
      
      // Set different metadata on each instance
      MetadataStore.set('instance:unique', 'value1', user1);
      MetadataStore.set('instance:unique', 'value2', user2);
      
      // Each instance should have its own metadata
      const value1 = MetadataStore.get('instance:unique', user1);
      const value2 = MetadataStore.get('instance:unique', user2);
      
      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
      expect(value1).not.toBe(value2);
    });

    it('should demonstrate property metadata on prototype', () => {
      // Set property metadata
      MetadataStore.set('prop:info', 'property-metadata', User.prototype, 'name');
      
      const user1 = new User();
      const user2 = new User();
      
      // Both instances share the same prototype metadata
      const value1 = MetadataStore.get('prop:info', Object.getPrototypeOf(user1), 'name');
      const value2 = MetadataStore.get('prop:info', Object.getPrototypeOf(user2), 'name');
      
      expect(value1).toBe('property-metadata');
      expect(value2).toBe('property-metadata');
      expect(value1).toBe(value2);
    });
  });

  describe('Inheritance behavior', () => {
    it('should demonstrate metadata inheritance from parent class', () => {
      // Set metadata on base class
      MetadataStore.set('base:info', 'base-value', BaseEntity);
      MetadataStore.set('base:prop', 'base-prop-value', BaseEntity.prototype, 'id');
      
      // User should inherit metadata from BaseEntity
      const inheritedClassMeta = Reflect.getMetadata('base:info', User);
      const inheritedPropMeta = Reflect.getMetadata('base:prop', User.prototype, 'id');
      
      expect(inheritedClassMeta).toBe('base-value');
      expect(inheritedPropMeta).toBe('base-prop-value');
    });

    it('should allow overriding inherited metadata', () => {
      // Set metadata on base class
      MetadataStore.set('override:test', 'base-value', BaseEntity);
      
      // Override in derived class
      MetadataStore.set('override:test', 'derived-value', User);
      
      // User should have its own metadata, not inherited
      const ownMeta = Reflect.getOwnMetadata('override:test', User);
      const inheritedMeta = Reflect.getMetadata('override:test', User);
      
      expect(ownMeta).toBe('derived-value');
      expect(inheritedMeta).toBe('derived-value'); // Own takes precedence
    });
  });

  describe('Utility functions', () => {
    describe('configureEntity', () => {
      it('should configure entity with table name', () => {
        configureEntity(User, 'custom_users', 'custom_schema');
        
        expect(consoleSpy).toHaveBeenCalledWith(
          'Configuring entity User for table custom_users'
        );
      });

      it('should work without schema', () => {
        configureEntity(User, 'users');
        
        expect(consoleSpy).toHaveBeenCalledWith(
          'Configuring entity User for table users'
        );
      });
    });

    describe('trackInstanceState', () => {
      it('should track state on instance', () => {
        const user = new User();
        trackInstanceState(user, 'active');
        
        expect(consoleSpy).toHaveBeenCalledWith(
          'Tracking state "active" for instance'
        );
      });
    });

    describe('findInstancesWithMetadata', () => {
      it('should find instances with matching metadata', () => {
        const user1 = new User();
        const user2 = new User();
        const user3 = new User();
        
        // Set metadata on some instances
        MetadataStore.set('status', 'active', user1);
        MetadataStore.set('status', 'active', user2);
        MetadataStore.set('status', 'inactive', user3);
        
        const instances = [user1, user2, user3];
        const activeInstances = findInstancesWithMetadata(instances, 'status', 'active');
        
        expect(activeInstances).toHaveLength(2);
        expect(activeInstances).toContain(user1);
        expect(activeInstances).toContain(user2);
        expect(activeInstances).not.toContain(user3);
      });

      it('should return empty array when no matches found', () => {
        const user1 = new User();
        const user2 = new User();
        
        const instances = [user1, user2];
        const matches = findInstancesWithMetadata(instances, 'non:existent', 'value');
        
        expect(matches).toEqual([]);
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple metadata types on same target', () => {
      const user = new User();
      
      // Set different types of metadata
      MetadataStore.set('string:data', 'text', user);
      MetadataStore.set('number:data', 42, user);
      MetadataStore.set('object:data', { key: 'value' }, user);
      ArrayMetadataStore.push('array:data', 'item1', user);
      ArrayMetadataStore.push('array:data', 'item2', user);
      
      // Verify all metadata is stored correctly
      expect(MetadataStore.get('string:data', user)).toBe('text');
      expect(MetadataStore.get('number:data', user)).toBe(42);
      expect(MetadataStore.get('object:data', user)).toEqual({ key: 'value' });
      expect(ArrayMetadataStore.getArray('array:data', user)).toEqual(['item1', 'item2']);
    });

    it('should handle metadata operations on multiple inheritance levels', () => {
      // Create a third level in inheritance hierarchy
      class SpecialUser extends User {
        specialProperty: string = '';
      }
      
      // Set metadata at each level
      MetadataStore.set('level:base', 'base-data', BaseEntity);
      MetadataStore.set('level:user', 'user-data', User);
      MetadataStore.set('level:special', 'special-data', SpecialUser);
      
      // SpecialUser should have access to all levels
      expect(Reflect.getMetadata('level:base', SpecialUser)).toBe('base-data');
      expect(Reflect.getMetadata('level:user', SpecialUser)).toBe('user-data');
      expect(Reflect.getMetadata('level:special', SpecialUser)).toBe('special-data');
      
      // But only own metadata with getOwnMetadata
      expect(Reflect.getOwnMetadata('level:base', SpecialUser)).toBeUndefined();
      expect(Reflect.getOwnMetadata('level:user', SpecialUser)).toBeUndefined();
      expect(Reflect.getOwnMetadata('level:special', SpecialUser)).toBe('special-data');
    });
  });
});