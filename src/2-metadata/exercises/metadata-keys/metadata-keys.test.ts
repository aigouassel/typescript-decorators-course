import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  MetadataKeys,
  MetadataRegistry,
  TypedMetadataAccessor,
  MetadataCollection,
  type KeyDefinition
} from './metadata-keys';

describe('Exercise: Metadata Key Management', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Clear registry before each test
    const registryKeys = MetadataRegistry.getAllKeys();
    registryKeys.forEach(key => {
      // Clear the registry - we can't directly access private members, 
      // so we'll test the public interface
    });
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('MetadataKeys class', () => {
    describe('create method', () => {
      it('should create properly formatted namespaced key', () => {
        const key = MetadataKeys.create('validation', 'required');
        expect(key).toBe('validation:required');
      });

      it('should create key with subkey', () => {
        const key = MetadataKeys.create('validation', 'rules', 'minLength');
        expect(key).toBe('validation:rules:minLength');
      });

      it('should handle pre-defined namespaces', () => {
        const validationKey = MetadataKeys.create(MetadataKeys.VALIDATION, 'required');
        const databaseKey = MetadataKeys.create(MetadataKeys.DATABASE, 'table');
        
        expect(validationKey).toBe('validation:required');
        expect(databaseKey).toBe('database:table');
      });
    });

    describe('parse method', () => {
      it('should parse simple namespaced key', () => {
        const parsed = MetadataKeys.parse('validation:required');
        
        expect(parsed.namespace).toBe('validation');
        expect(parsed.key).toBe('required');
        expect(parsed.subkey).toBeUndefined();
      });

      it('should parse key with subkey', () => {
        const parsed = MetadataKeys.parse('validation:rules:minLength');
        
        expect(parsed.namespace).toBe('validation');
        expect(parsed.key).toBe('rules');
        expect(parsed.subkey).toBe('minLength');
      });

      it('should handle malformed keys gracefully', () => {
        const parsed = MetadataKeys.parse('malformed');
        
        expect(parsed.namespace).toBe('malformed');
        expect(parsed.key).toBe('');
        expect(parsed.subkey).toBeUndefined();
      });
    });

    describe('isValid method', () => {
      it('should validate correct key format', () => {
        expect(MetadataKeys.isValid('validation:required')).toBe(true);
        expect(MetadataKeys.isValid('database:table:name')).toBe(true);
      });

      it('should reject invalid key formats', () => {
        expect(MetadataKeys.isValid('invalid')).toBe(false);
        expect(MetadataKeys.isValid('invalid:')).toBe(false);
        expect(MetadataKeys.isValid(':invalid')).toBe(false);
        expect(MetadataKeys.isValid('')).toBe(false);
      });
    });

    describe('getKeysForNamespace method', () => {
      let testTarget: any;

      beforeEach(() => {
        testTarget = class TestClass {};
        
        // Set metadata with different namespaces
        Reflect.defineMetadata('validation:required', true, testTarget);
        Reflect.defineMetadata('validation:minLength', 5, testTarget);
        Reflect.defineMetadata('database:table', 'test_table', testTarget);
        Reflect.defineMetadata('other:key', 'value', testTarget);
      });

      it('should return keys for specific namespace', () => {
        const validationKeys = MetadataKeys.getKeysForNamespace(testTarget, 'validation');
        
        expect(validationKeys).toContain('validation:required');
        expect(validationKeys).toContain('validation:minLength');
        expect(validationKeys).not.toContain('database:table');
        expect(validationKeys).not.toContain('other:key');
      });

      it('should return empty array for non-existent namespace', () => {
        const keys = MetadataKeys.getKeysForNamespace(testTarget, 'nonexistent');
        expect(keys).toEqual([]);
      });
    });
  });

  describe('MetadataRegistry class', () => {
    describe('register method', () => {
      it('should register valid key definition', () => {
        const key = 'validation:required';
        const definition: KeyDefinition = {
          description: 'Marks field as required',
          valueType: 'boolean',
          defaultValue: false
        };
        
        expect(() => {
          MetadataRegistry.register(key, definition);
        }).not.toThrow();
      });

      it('should reject invalid key format', () => {
        const definition: KeyDefinition = {
          description: 'Test',
          valueType: 'string'
        };
        
        expect(() => {
          MetadataRegistry.register('invalid', definition);
        }).toThrow('Invalid metadata key format: invalid');
      });

      it('should add timestamp to definition', () => {
        const key = 'test:key';
        const definition: KeyDefinition = {
          description: 'Test key',
          valueType: 'string'
        };
        
        MetadataRegistry.register(key, definition);
        
        const registered = MetadataRegistry.getDefinition(key);
        expect(registered?.registeredAt).toBeInstanceOf(Date);
        expect(registered?.key).toBe(key);
      });
    });

    describe('getDefinition method', () => {
      beforeEach(() => {
        MetadataRegistry.register('test:definition', {
          description: 'Test definition',
          valueType: 'string',
          required: true
        });
      });

      it('should return registered definition', () => {
        const definition = MetadataRegistry.getDefinition('test:definition');
        
        expect(definition).toBeDefined();
        expect(definition?.description).toBe('Test definition');
        expect(definition?.valueType).toBe('string');
        expect(definition?.required).toBe(true);
      });

      it('should return undefined for non-registered key', () => {
        const definition = MetadataRegistry.getDefinition('non:existent');
        expect(definition).toBeUndefined();
      });
    });

    describe('getAllKeys method', () => {
      beforeEach(() => {
        MetadataRegistry.register('validation:test1', { description: 'Test 1', valueType: 'string' });
        MetadataRegistry.register('database:test2', { description: 'Test 2', valueType: 'number' });
      });

      it('should return all registered keys', () => {
        const keys = MetadataRegistry.getAllKeys();
        
        expect(keys).toContain('validation:test1');
        expect(keys).toContain('database:test2');
      });
    });

    describe('getKeysByNamespace method', () => {
      beforeEach(() => {
        MetadataRegistry.register('validation:req', { description: 'Required', valueType: 'boolean' });
        MetadataRegistry.register('validation:min', { description: 'Min length', valueType: 'number' });
        MetadataRegistry.register('database:table', { description: 'Table name', valueType: 'string' });
      });

      it('should return keys for specific namespace', () => {
        const validationKeys = MetadataRegistry.getKeysByNamespace('validation');
        
        expect(validationKeys).toContain('validation:req');
        expect(validationKeys).toContain('validation:min');
        expect(validationKeys).not.toContain('database:table');
      });
    });

    describe('isRegistered method', () => {
      beforeEach(() => {
        MetadataRegistry.register('registered:key', { description: 'Test', valueType: 'string' });
      });

      it('should return true for registered key', () => {
        expect(MetadataRegistry.isRegistered('registered:key')).toBe(true);
      });

      it('should return false for non-registered key', () => {
        expect(MetadataRegistry.isRegistered('not:registered')).toBe(false);
      });
    });
  });

  describe('TypedMetadataAccessor class', () => {
    let testTarget: any;
    let accessor: TypedMetadataAccessor<string>;

    beforeEach(() => {
      testTarget = class TestClass {};
      
      // Register the key first
      MetadataRegistry.register('typed:test', {
        description: 'Typed test key',
        valueType: 'string',
        defaultValue: 'default'
      });
      
      accessor = new TypedMetadataAccessor<string>('typed:test', 'fallback-default');
    });

    describe('get method', () => {
      it('should return stored metadata value', () => {
        Reflect.defineMetadata('typed:test', 'stored-value', testTarget);
        
        const result = accessor.get(testTarget);
        expect(result).toBe('stored-value');
      });

      it('should return default value when no metadata exists', () => {
        const result = accessor.get(testTarget);
        expect(result).toBe('fallback-default');
      });
    });

    describe('set method', () => {
      it('should set metadata value', () => {
        accessor.set(testTarget, 'new-value');
        
        const result = Reflect.getMetadata('typed:test', testTarget);
        expect(result).toBe('new-value');
      });

      it('should validate value if validator exists', () => {
        // Create accessor with validation
        MetadataRegistry.register('validated:key', {
          description: 'Validated key',
          valueType: 'string',
          validator: (value: any) => typeof value === 'string' && value.length > 0
        });
        
        const validatedAccessor = new TypedMetadataAccessor<string>('validated:key');
        
        // Valid value should work
        expect(() => {
          validatedAccessor.set(testTarget, 'valid');
        }).not.toThrow();
        
        // Invalid value should throw
        expect(() => {
          validatedAccessor.set(testTarget, '');
        }).toThrow('Invalid value for metadata key validated:key');
      });
    });

    describe('has method', () => {
      it('should return true when metadata exists', () => {
        Reflect.defineMetadata('typed:test', 'value', testTarget);
        
        expect(accessor.has(testTarget)).toBe(true);
      });

      it('should return false when metadata does not exist', () => {
        expect(accessor.has(testTarget)).toBe(false);
      });
    });

    describe('delete method', () => {
      beforeEach(() => {
        Reflect.defineMetadata('typed:test', 'to-delete', testTarget);
      });

      it('should delete existing metadata', () => {
        expect(accessor.has(testTarget)).toBe(true);
        
        const result = accessor.delete(testTarget);
        expect(result).toBe(true);
        expect(accessor.has(testTarget)).toBe(false);
      });

      it('should return false for non-existent metadata', () => {
        accessor.delete(testTarget); // Delete first time
        
        const result = accessor.delete(testTarget); // Try to delete again
        expect(result).toBe(false);
      });
    });
  });

  describe('MetadataCollection class', () => {
    let testTarget: any;
    let collection: MetadataCollection<string>;

    beforeEach(() => {
      testTarget = class TestClass {};
      
      MetadataRegistry.register('collection:test', {
        description: 'Collection test',
        valueType: 'array',
        defaultValue: []
      });
      
      collection = new MetadataCollection<string>('collection:test');
    });

    describe('add method', () => {
      it('should add item to collection', () => {
        collection.add(testTarget, 'item1');
        collection.add(testTarget, 'item2');
        
        const items = collection.getAll(testTarget);
        expect(items).toEqual(['item1', 'item2']);
      });

      it('should handle adding to empty collection', () => {
        collection.add(testTarget, 'first-item');
        
        const items = collection.getAll(testTarget);
        expect(items).toEqual(['first-item']);
      });
    });

    describe('remove method', () => {
      beforeEach(() => {
        collection.add(testTarget, 'item1');
        collection.add(testTarget, 'item2');
        collection.add(testTarget, 'item3');
      });

      it('should remove existing item', () => {
        const result = collection.remove(testTarget, 'item2');
        expect(result).toBe(true);
        
        const items = collection.getAll(testTarget);
        expect(items).toEqual(['item1', 'item3']);
      });

      it('should return false for non-existent item', () => {
        const result = collection.remove(testTarget, 'non-existent');
        expect(result).toBe(false);
        
        const items = collection.getAll(testTarget);
        expect(items).toEqual(['item1', 'item2', 'item3']);
      });
    });

    describe('getAll method', () => {
      it('should return empty array for new collection', () => {
        const items = collection.getAll(testTarget);
        expect(items).toEqual([]);
      });

      it('should return all items in collection', () => {
        collection.add(testTarget, 'a');
        collection.add(testTarget, 'b');
        collection.add(testTarget, 'c');
        
        const items = collection.getAll(testTarget);
        expect(items).toEqual(['a', 'b', 'c']);
      });
    });

    describe('clear method', () => {
      beforeEach(() => {
        collection.add(testTarget, 'item1');
        collection.add(testTarget, 'item2');
      });

      it('should clear all items from collection', () => {
        expect(collection.getAll(testTarget)).toHaveLength(2);
        
        collection.clear(testTarget);
        
        expect(collection.getAll(testTarget)).toEqual([]);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete key management workflow', () => {
      // 1. Register keys
      const validationRequiredKey = MetadataKeys.create(MetadataKeys.VALIDATION, 'required');
      const validationRulesKey = MetadataKeys.create(MetadataKeys.VALIDATION, 'rules');
      
      MetadataRegistry.register(validationRequiredKey, {
        description: 'Indicates if field is required',
        valueType: 'boolean',
        defaultValue: false
      });
      
      MetadataRegistry.register(validationRulesKey, {
        description: 'Validation rules for field',
        valueType: 'array',
        defaultValue: []
      });
      
      // 2. Create typed accessors
      const requiredAccessor = new TypedMetadataAccessor<boolean>(validationRequiredKey);
      const rulesCollection = new MetadataCollection<string>(validationRulesKey);
      
      // 3. Use accessors
      class TestEntity {
        name: string = '';
        email: string = '';
      }
      
      requiredAccessor.set(TestEntity.prototype, true, 'name');
      rulesCollection.add(TestEntity.prototype, 'minLength:2', 'name');
      rulesCollection.add(TestEntity.prototype, 'maxLength:50', 'name');
      
      requiredAccessor.set(TestEntity.prototype, true, 'email');
      rulesCollection.add(TestEntity.prototype, 'email:format', 'email');
      
      // 4. Verify results
      expect(requiredAccessor.get(TestEntity.prototype, 'name')).toBe(true);
      expect(requiredAccessor.get(TestEntity.prototype, 'email')).toBe(true);
      
      expect(rulesCollection.getAll(TestEntity.prototype, 'name')).toEqual(['minLength:2', 'maxLength:50']);
      expect(rulesCollection.getAll(TestEntity.prototype, 'email')).toEqual(['email:format']);
    });

    it('should handle namespace filtering correctly', () => {
      class TestClass {}
      
      // Set metadata in different namespaces
      Reflect.defineMetadata('validation:required', true, TestClass);
      Reflect.defineMetadata('validation:minLength', 5, TestClass);
      Reflect.defineMetadata('database:table', 'test_table', TestClass);
      Reflect.defineMetadata('serialization:include', true, TestClass);
      
      // Filter by namespace
      const validationKeys = MetadataKeys.getKeysForNamespace(TestClass, MetadataKeys.VALIDATION);
      const databaseKeys = MetadataKeys.getKeysForNamespace(TestClass, MetadataKeys.DATABASE);
      
      expect(validationKeys).toHaveLength(2);
      expect(validationKeys).toContain('validation:required');
      expect(validationKeys).toContain('validation:minLength');
      
      expect(databaseKeys).toHaveLength(1);
      expect(databaseKeys).toContain('database:table');
    });

    it('should handle complex key structures', () => {
      // Test nested key structures
      const complexKey = MetadataKeys.create('validation', 'rules', 'complex');
      expect(complexKey).toBe('validation:rules:complex');
      
      const parsed = MetadataKeys.parse(complexKey);
      expect(parsed.namespace).toBe('validation');
      expect(parsed.key).toBe('rules');
      expect(parsed.subkey).toBe('complex');
      
      expect(MetadataKeys.isValid(complexKey)).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle empty and invalid inputs gracefully', () => {
      expect(MetadataKeys.isValid('')).toBe(false);
      expect(MetadataKeys.isValid(':')).toBe(false);
      expect(MetadataKeys.isValid(':::')).toBe(false);
      
      const emptyParsed = MetadataKeys.parse('');
      expect(emptyParsed.namespace).toBe('');
      expect(emptyParsed.key).toBe('');
    });

    it('should handle non-string metadata keys', () => {
      class TestClass {}
      const symbolKey = Symbol('test');
      
      Reflect.defineMetadata(symbolKey, 'value', TestClass);
      
      // Symbol keys should not be included in namespace filtering
      const keys = MetadataKeys.getKeysForNamespace(TestClass, 'any');
      expect(keys).not.toContain(symbolKey);
    });

    it('should handle multiple namespaces with same suffix', () => {
      class TestClass {}
      
      Reflect.defineMetadata('validation:test', 'value1', TestClass);
      Reflect.defineMetadata('custom-validation:test', 'value2', TestClass);
      
      const validationKeys = MetadataKeys.getKeysForNamespace(TestClass, 'validation');
      
      expect(validationKeys).toContain('validation:test');
      expect(validationKeys).not.toContain('custom-validation:test');
    });
  });
});