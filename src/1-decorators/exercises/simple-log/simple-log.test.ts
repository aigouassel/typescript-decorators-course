import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Calculator, log } from './simple-log';

describe('Exercise 1: Simple Log Decorator', () => {
  let calculator: Calculator;
  let consoleSpy: any;

  beforeEach(() => {
    calculator = new Calculator();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('@log decorator', () => {
    it('should log when decorated method is called', () => {
      calculator.add(2, 3);
      
      expect(consoleSpy).toHaveBeenCalledWith('Calling method: add');
    });

    it('should log method name correctly', () => {
      calculator.multiply(4, 5);
      
      expect(consoleSpy).toHaveBeenCalledWith('Calling method: multiply');
    });

    it('should still return the correct result', () => {
      const result = calculator.add(10, 15);
      
      expect(result).toBe(25);
    });

    it('should work with multiple calls', () => {
      calculator.add(1, 2);
      calculator.multiply(3, 4);
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Calling method: add');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Calling method: multiply');
    });

    it('should not log for non-decorated methods', () => {
      calculator.subtract(10, 5);
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should preserve method context (this binding)', () => {
      const result = calculator.add(7, 8);
      
      expect(result).toBe(15);
      expect(calculator).toBeInstanceOf(Calculator);
    });

    it('should handle methods with different parameter counts', () => {
      // Test that the decorator works regardless of parameter count
      calculator.add(1, 2);
      calculator.multiply(3, 4);
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration tests', () => {
    it('should work when applied to multiple methods in the same class', () => {
      calculator.add(1, 1);
      calculator.multiply(2, 2);
      
      expect(consoleSpy).toHaveBeenCalledWith('Calling method: add');
      expect(consoleSpy).toHaveBeenCalledWith('Calling method: multiply');
    });

    it('should be reusable across different classes', () => {
      class TestClass {
        @log
        testMethod() {
          return 'test';
        }
      }
      
      const instance = new TestClass();
      instance.testMethod();
      
      expect(consoleSpy).toHaveBeenCalledWith('Calling method: testMethod');
    });
  });
});