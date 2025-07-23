import { describe, it, expect, beforeEach } from 'vitest';
import { User, Product, PlainClass, classInfo, ClassInfo } from './class-info';

describe('Exercise 2: Class Information Decorator', () => {
  describe('@classInfo decorator', () => {
    it('should add static info property to decorated class', () => {
      expect((User as any).info).toBeDefined();
      expect((Product as any).info).toBeDefined();
    });

    it('should include correct class name in info', () => {
      const userInfo: ClassInfo = (User as any).info;
      const productInfo: ClassInfo = (Product as any).info;
      
      expect(userInfo.name).toBe('User');
      expect(productInfo.name).toBe('Product');
    });

    it('should include createdAt timestamp in info', () => {
      const userInfo: ClassInfo = (User as any).info;
      const productInfo: ClassInfo = (Product as any).info;
      
      expect(userInfo.createdAt).toBeInstanceOf(Date);
      expect(productInfo.createdAt).toBeInstanceOf(Date);
    });

    it('should create timestamps close to current time', () => {
      const now = Date.now();
      const userInfo: ClassInfo = (User as any).info;
      
      // Allow for a reasonable time difference (e.g., within 1 second)
      const timeDiff = Math.abs(now - userInfo.createdAt.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should not affect non-decorated classes', () => {
      expect((PlainClass as any).info).toBeUndefined();
    });

    it('should create separate info objects for different classes', () => {
      const userInfo: ClassInfo = (User as any).info;
      const productInfo: ClassInfo = (Product as any).info;
      
      expect(userInfo).not.toBe(productInfo);
      expect(userInfo.name).not.toBe(productInfo.name);
    });
  });

  describe('Class instances', () => {
    it('should not affect instance creation', () => {
      const user = new User();
      const product = new Product();
      
      expect(user).toBeInstanceOf(User);
      expect(product).toBeInstanceOf(Product);
    });

    it('should allow normal property assignment on instances', () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john@example.com';
      
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should not add info property to instances', () => {
      const user = new User();
      
      expect((user as any).info).toBeUndefined();
    });
  });

  describe('Decorator reusability', () => {
    it('should work when applied to multiple classes', () => {
      @classInfo
      class TestClass1 {}
      
      @classInfo
      class TestClass2 {}
      
      expect((TestClass1 as any).info).toBeDefined();
      expect((TestClass2 as any).info).toBeDefined();
      expect((TestClass1 as any).info.name).toBe('TestClass1');
      expect((TestClass2 as any).info.name).toBe('TestClass2');
    });

    it('should preserve class functionality', () => {
      @classInfo
      class Calculator {
        add(a: number, b: number): number {
          return a + b;
        }
      }
      
      const calc = new Calculator();
      expect(calc.add(2, 3)).toBe(5);
      expect((Calculator as any).info.name).toBe('Calculator');
    });
  });

  describe('Type safety', () => {
    it('should maintain proper TypeScript types', () => {
      const user = new User();
      
      // These should compile without TypeScript errors
      user.name = 'Test';
      user.email = 'test@example.com';
      
      expect(user.name).toBe('Test');
      expect(user.email).toBe('test@example.com');
    });
  });
});