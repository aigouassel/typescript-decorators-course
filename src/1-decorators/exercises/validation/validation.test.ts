import { describe, it, expect, beforeEach } from 'vitest';
import { User, notEmpty } from './validation';

describe('Exercise 5: Simple Validation Decorator', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
  });

  describe('@notEmpty decorator', () => {
    it('should allow setting non-empty string values', () => {
      expect(() => {
        user.name = 'John Doe';
      }).not.toThrow();
      
      expect(user.name).toBe('John Doe');
    });

    it('should throw error when setting empty string', () => {
      expect(() => {
        user.name = '';
      }).toThrow('name cannot be empty');
    });

    it('should throw error when setting whitespace-only string', () => {
      expect(() => {
        user.email = '   ';
      }).toThrow('email cannot be empty');
    });

    it('should work with multiple validated properties', () => {
      // Both should work with valid values
      expect(() => {
        user.name = 'Alice';
        user.email = 'alice@example.com';
      }).not.toThrow();
      
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
    });

    it('should not affect non-validated properties', () => {
      expect(() => {
        user.description = '';
        user.description = '   ';
      }).not.toThrow();
      
      expect(user.description).toBe('   ');
    });

    it('should allow setting null or undefined values', () => {
      expect(() => {
        user.name = null as any;
        user.email = undefined as any;
      }).not.toThrow();
      
      expect(user.name).toBeNull();
      expect(user.email).toBeUndefined();
    });

    it('should allow setting non-string values', () => {
      expect(() => {
        user.name = 123 as any;
        user.email = true as any;
      }).not.toThrow();
      
      expect(user.name).toBe(123);
      expect(user.email).toBe(true);
    });

    it('should provide specific error messages for different properties', () => {
      expect(() => {
        user.name = '';
      }).toThrow('name cannot be empty');
      
      expect(() => {
        user.email = '';
      }).toThrow('email cannot be empty');
    });
  });

  describe('Validation timing', () => {
    it('should validate on property assignment', () => {
      user.name = 'Valid Name';
      
      expect(() => {
        user.name = '';
      }).toThrow('name cannot be empty');
    });

    it('should not validate on property access', () => {
      user.name = 'Test Name';
      
      expect(() => {
        const value = user.name;
      }).not.toThrow();
    });
  });

  describe('Multiple instances', () => {
    it('should validate independently for different instances', () => {
      const user1 = new User();
      const user2 = new User();
      
      user1.name = 'User One';
      
      expect(() => {
        user2.name = '';
      }).toThrow('name cannot be empty');
      
      expect(user1.name).toBe('User One');
    });
  });

  describe('Decorator reusability', () => {
    it('should work when applied to different classes', () => {
      class Product {
        @notEmpty
        title!: string;
      }
      
      const product = new Product();
      
      expect(() => {
        product.title = '';
      }).toThrow('title cannot be empty');
      
      expect(() => {
        product.title = 'Valid Title';
      }).not.toThrow();
      
      expect(product.title).toBe('Valid Title');
    });
  });

  describe('Edge cases', () => {
    it('should handle tab and newline characters as empty', () => {
      expect(() => {
        user.name = '\t\n  ';
      }).toThrow('name cannot be empty');
    });

    it('should preserve property enumeration', () => {
      user.name = 'Test';
      user.email = 'test@example.com';
      user.description = 'desc';
      
      const keys = Object.keys(user);
      // Note: Decorated properties become enumerable after first assignment
      expect(keys).toContain('description');
      
      // Check that properties are accessible
      expect(user.name).toBe('Test');
      expect(user.email).toBe('test@example.com');
      expect(user.description).toBe('desc');
    });
  });
});