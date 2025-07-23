import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  Required,
  MinLength,
  MaxLength,
  Pattern,
  Column,
  Entity,
  validate,
  getColumnInfo,
  getTableName,
  getValidatedProperties,
  User,
  Product,
  demonstrateValidation,
  demonstrateColumnMetadata,
  demonstrateMetadataDecorators,
  METADATA_KEYS,
} from './simple-metadata-integration';

describe('Exercise: Simple Metadata Decorator', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Clear any existing metadata
    const targets = [User, User.prototype, Product, Product.prototype];
    targets.forEach(target => {
      const keys = Reflect.getMetadataKeys(target) || [];
      keys.forEach(key => {
        Reflect.deleteMetadata(key, target);
      });
    });
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Required decorator', () => {
    it('should set required metadata on property', () => {
      class TestClass {
        @Required
        testProperty: string = '';
      }
      
      const isRequired = Reflect.getMetadata(METADATA_KEYS.VALIDATION_REQUIRED, TestClass.prototype, 'testProperty');
      expect(isRequired).toBe(true);
    });

    it('should log when applied', () => {
      class TestClass {
        @Required
        testProperty: string = '';
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('@Required applied to testProperty');
    });

    it('should work on multiple properties', () => {
      class TestClass {
        @Required
        prop1: string = '';
        
        @Required
        prop2: string = '';
        
        prop3: string = ''; // Not required
      }
      
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, TestClass.prototype, 'prop1')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, TestClass.prototype, 'prop2')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, TestClass.prototype, 'prop3')).toBe(false);
    });
  });

  describe('MinLength decorator factory', () => {
    it('should set minimum length metadata', () => {
      class TestClass {
        @MinLength(5)
        testProperty: string = '';
      }
      
      const minLength = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, TestClass.prototype, 'testProperty');
      expect(minLength).toBe(5);
    });

    it('should log when applied with length', () => {
      class TestClass {
        @MinLength(10)
        testProperty: string = '';
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('@MinLength(10) applied to testProperty');
    });

    it('should handle different length values', () => {
      class TestClass {
        @MinLength(1)
        prop1: string = '';
        
        @MinLength(100)
        prop2: string = '';
      }
      
      expect(Reflect.getMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, TestClass.prototype, 'prop1')).toBe(1);
      expect(Reflect.getMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, TestClass.prototype, 'prop2')).toBe(100);
    });
  });

  describe('MaxLength decorator factory', () => {
    it('should set maximum length metadata', () => {
      class TestClass {
        @MaxLength(50)
        testProperty: string = '';
      }
      
      const maxLength = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, TestClass.prototype, 'testProperty');
      expect(maxLength).toBe(50);
    });

    it('should log when applied with length', () => {
      class TestClass {
        @MaxLength(25)
        testProperty: string = '';
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('@MaxLength(25) applied to testProperty');
    });
  });

  describe('Pattern decorator factory', () => {
    it('should set pattern metadata with regex', () => {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      
      class TestClass {
        @Pattern(emailRegex, 'Invalid email')
        email: string = '';
      }
      
      const patternData = Reflect.getMetadata(METADATA_KEYS.VALIDATION_PATTERN, TestClass.prototype, 'email');
      expect(patternData).toEqual({
        regex: emailRegex,
        message: 'Invalid email'
      });
    });

    it('should work without custom message', () => {
      const phoneRegex = /^\\d{10}$/;
      
      class TestClass {
        @Pattern(phoneRegex)
        phone: string = '';
      }
      
      const patternData = Reflect.getMetadata(METADATA_KEYS.VALIDATION_PATTERN, TestClass.prototype, 'phone');
      expect(patternData.regex).toBe(phoneRegex);
    });
  });

  describe('Column decorator factory', () => {
    it('should set column metadata with default options', () => {
      class TestClass {
        @Column()
        testProperty: string = '';
      }
      
      const columnInfo = Reflect.getMetadata(METADATA_KEYS.COLUMN_INFO, TestClass.prototype, 'testProperty');
      expect(columnInfo).toEqual({
        name: 'testProperty',
        type: 'varchar',
        length: undefined,
        nullable: true,
        unique: false,
        propertyName: 'testProperty'
      });
    });

    it('should set column metadata with custom options', () => {
      class TestClass {
        @Column({ 
          name: 'custom_name', 
          type: 'integer', 
          length: 10, 
          nullable: false, 
          unique: true 
        })
        testProperty: number = 0;
      }
      
      const columnInfo = Reflect.getMetadata(METADATA_KEYS.COLUMN_INFO, TestClass.prototype, 'testProperty');
      expect(columnInfo).toEqual({
        name: 'custom_name',
        type: 'integer',
        length: 10,
        nullable: false,
        unique: true,
        propertyName: 'testProperty'
      });
    });
  });

  describe('Entity decorator factory', () => {
    it('should set table name metadata on class', () => {
      @Entity('test_table')
      class TestEntity {}
      
      const tableName = Reflect.getMetadata(METADATA_KEYS.ENTITY_TABLE, TestEntity);
      expect(tableName).toBe('test_table');
    });

    it('should return the original class', () => {
      @Entity('original_table')
      class OriginalClass {
        testMethod() { return 'test'; }
      }
      
      const instance = new OriginalClass();
      expect(instance.testMethod()).toBe('test');
      expect(instance.constructor.name).toBe('OriginalClass');
    });
  });

  describe('validate function', () => {
    beforeEach(() => {
      // Reapply decorators to ensure metadata is set
      class TestUser {
        @Required
        @MinLength(2)
        @MaxLength(50)
        name: string = '';
        
        @Required
        @Pattern(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, 'Invalid email format')
        email: string = '';
        
        age: number = 0;
      }
      
      // Copy metadata to our test instances
      ['name', 'email'].forEach(prop => {
        const requiredMeta = Reflect.getMetadata(METADATA_KEYS.VALIDATION_REQUIRED, TestUser.prototype, prop);
        if (requiredMeta !== undefined) {
          Reflect.defineMetadata(METADATA_KEYS.VALIDATION_REQUIRED, requiredMeta, User.prototype, prop);
        }
        
        const minLengthMeta = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, TestUser.prototype, prop);
        if (minLengthMeta !== undefined) {
          Reflect.defineMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, minLengthMeta, User.prototype, prop);
        }
        
        const maxLengthMeta = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, TestUser.prototype, prop);
        if (maxLengthMeta !== undefined) {
          Reflect.defineMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, maxLengthMeta, User.prototype, prop);
        }
        
        const patternMeta = Reflect.getMetadata(METADATA_KEYS.VALIDATION_PATTERN, TestUser.prototype, prop);
        if (patternMeta !== undefined) {
          Reflect.defineMetadata(METADATA_KEYS.VALIDATION_PATTERN, patternMeta, User.prototype, prop);
        }
      });
    });

    it('should validate a valid object', () => {
      const user = new User('John Doe', 'john@example.com');
      user.age = 30;
      
      const result = validate(user);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect required field violations', () => {
      const user = new User('', ''); // Both required fields empty
      
      const result = validate(user);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const requiredErrors = result.errors.filter(e => e.message.includes('required'));
      expect(requiredErrors.length).toBeGreaterThan(0);
    });

    it('should detect min length violations', () => {
      const user = new User('A', 'valid@example.com'); // Name too short
      
      const result = validate(user);
      expect(result.valid).toBe(false);
      
      const minLengthError = result.errors.find(e => e.message.includes('at least'));
      expect(minLengthError).toBeDefined();
      expect(minLengthError?.property).toBe('name');
    });

    it('should detect max length violations', () => {
      const longName = 'A'.repeat(100); // Longer than max length
      const user = new User(longName, 'valid@example.com');
      
      const result = validate(user);
      expect(result.valid).toBe(false);
      
      const maxLengthError = result.errors.find(e => e.message.includes('no more than'));
      expect(maxLengthError).toBeDefined();
      expect(maxLengthError?.property).toBe('name');
    });

    it('should detect pattern violations', () => {
      const user = new User('Valid Name', 'invalid-email-format');
      
      const result = validate(user);
      expect(result.valid).toBe(false);
      
      const patternError = result.errors.find(e => e.message.includes('Invalid email format'));
      expect(patternError).toBeDefined();
      expect(patternError?.property).toBe('email');
    });

    it('should handle multiple validation errors', () => {
      const user = new User('', 'bad-email'); // Multiple issues
      
      const result = validate(user);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      
      const properties = result.errors.map(e => e.property);
      expect(properties).toContain('name'); // Required violation
      expect(properties).toContain('email'); // Pattern violation
    });
  });

  describe('getColumnInfo function', () => {
    beforeEach(() => {
      // Set up column metadata
      Reflect.defineMetadata(METADATA_KEYS.COLUMN_INFO, {
        name: 'user_name',
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: false,
        propertyName: 'name'
      }, User.prototype, 'name');
    });

    it('should retrieve column information', () => {
      const columnInfo = getColumnInfo(User.prototype, 'name');
      
      expect(columnInfo).toEqual({
        name: 'user_name',
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: false,
        propertyName: 'name'
      });
    });

    it('should return undefined for non-existent column', () => {
      const columnInfo = getColumnInfo(User.prototype, 'nonExistent');
      expect(columnInfo).toBeUndefined();
    });
  });

  describe('getTableName function', () => {
    beforeEach(() => {
      Reflect.defineMetadata(METADATA_KEYS.ENTITY_TABLE, 'users', User);
    });

    it('should retrieve table name', () => {
      const tableName = getTableName(User);
      expect(tableName).toBe('users');
    });

    it('should return undefined for class without entity metadata', () => {
      class NonEntityClass {}
      const tableName = getTableName(NonEntityClass);
      expect(tableName).toBeUndefined();
    });
  });

  describe('getValidatedProperties function', () => {
    beforeEach(() => {
      // Set up validation metadata
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_REQUIRED, true, User.prototype, 'name');
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, 2, User.prototype, 'name');
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_REQUIRED, true, User.prototype, 'email');
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_PATTERN, /test/, User.prototype, 'email');
      // age has no validation metadata
    });

    it('should return properties with validation metadata', () => {
      const validatedProps = getValidatedProperties(User);
      
      expect(validatedProps).toContain('name');
      expect(validatedProps).toContain('email');
      expect(validatedProps).not.toContain('age'); // No validation metadata
      expect(validatedProps).not.toContain('constructor');
    });

    it('should return empty array for class with no validated properties', () => {
      class NoValidationClass {
        prop1: string = '';
        prop2: number = 0;
      }
      
      const validatedProps = getValidatedProperties(NoValidationClass);
      expect(validatedProps).toEqual([]);
    });
  });

  describe('User class with decorators', () => {
    it('should have correct metadata applied', () => {
      // Check entity metadata
      expect(Reflect.hasMetadata(METADATA_KEYS.ENTITY_TABLE, User)).toBe(true);
      
      // Check property validation metadata
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, User.prototype, 'name')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, User.prototype, 'email')).toBe(true);
      
      // Check column metadata
      expect(Reflect.hasMetadata(METADATA_KEYS.COLUMN_INFO, User.prototype, 'name')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.COLUMN_INFO, User.prototype, 'email')).toBe(true);
    });

    it('should create instances normally', () => {
      const user = new User('Test User', 'test@example.com');
      
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.age).toBe(0);
      expect(user.isActive).toBe(true);
    });
  });

  describe('Product class with decorators', () => {
    it('should have correct metadata applied', () => {
      expect(Reflect.hasMetadata(METADATA_KEYS.ENTITY_TABLE, Product)).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, Product.prototype, 'name')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, Product.prototype, 'price')).toBe(true);
    });
  });

  describe('Demonstration functions', () => {
    describe('demonstrateValidation', () => {
      it('should run without errors', () => {
        expect(() => demonstrateValidation()).not.toThrow();
      });

      it('should log validation demonstrations', () => {
        demonstrateValidation();
        
        expect(consoleSpy).toHaveBeenCalledWith('=== Validation Demonstration ===\n');
        expect(consoleSpy).toHaveBeenCalledWith('1. Valid User:');
        expect(consoleSpy).toHaveBeenCalledWith('2. Invalid User:');
      });
    });

    describe('demonstrateColumnMetadata', () => {
      it('should run without errors', () => {
        expect(() => demonstrateColumnMetadata()).not.toThrow();
      });

      it('should log column metadata demonstrations', () => {
        demonstrateColumnMetadata();
        
        expect(consoleSpy).toHaveBeenCalledWith('=== Column Metadata Demonstration ===\n');
        expect(consoleSpy).toHaveBeenCalledWith('1. Entity Table Names:');
        expect(consoleSpy).toHaveBeenCalledWith('2. Column Information:');
      });
    });

    describe('demonstrateMetadataDecorators', () => {
      it('should run both demonstrations', () => {
        expect(() => demonstrateMetadataDecorators()).not.toThrow();
        
        expect(consoleSpy).toHaveBeenCalledWith('=== Simple Metadata Decorators ===\n');
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple decorators on same property', () => {
      class MultiDecoratorClass {
        @Required
        @MinLength(5)
        @MaxLength(20)
        @Pattern(/^[a-zA-Z]+$/, 'Only letters allowed')
        @Column({ name: 'multi_prop', type: 'varchar', length: 20 })
        multiProperty: string = '';
      }
      
      // Check all decorators applied
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, MultiDecoratorClass.prototype, 'multiProperty')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, MultiDecoratorClass.prototype, 'multiProperty')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, MultiDecoratorClass.prototype, 'multiProperty')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.VALIDATION_PATTERN, MultiDecoratorClass.prototype, 'multiProperty')).toBe(true);
      expect(Reflect.hasMetadata(METADATA_KEYS.COLUMN_INFO, MultiDecoratorClass.prototype, 'multiProperty')).toBe(true);
    });

    it('should validate complex decorator combinations', () => {
      class ComplexClass {
        @Required
        @MinLength(3)
        @MaxLength(10)
        username: string = '';
      }
      
      // Apply metadata manually for test
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_REQUIRED, true, ComplexClass.prototype, 'username');
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, 3, ComplexClass.prototype, 'username');
      Reflect.defineMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, 10, ComplexClass.prototype, 'username');
      
      const instance = new ComplexClass();
      
      // Test too short
      instance.username = 'ab';
      let result = validate(instance);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('at least 3'))).toBe(true);
      
      // Test too long
      instance.username = 'verylongusername';
      result = validate(instance);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('no more than 10'))).toBe(true);
      
      // Test valid
      instance.username = 'validuser';
      result = validate(instance);
      expect(result.valid).toBe(true);
    });
  });
});