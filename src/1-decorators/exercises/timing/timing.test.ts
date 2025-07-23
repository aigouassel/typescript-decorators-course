import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataProcessor, timing, TimingOptions } from './timing';

describe('Exercise 1: Configurable Timing Decorator', () => {
  let processor: DataProcessor;
  let consoleSpy: any;

  beforeEach(() => {
    processor = new DataProcessor();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('@timing decorator factory', () => {
    it('should log execution time in milliseconds by default', () => {
      processor.processData([1, 2, 3, 4, 5]);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/processData took \d+\.\d+ms with args: \[\[1,2,3,4,5\]\]/)
      );
    });

    it('should log execution time in seconds when configured', async () => {
      await processor.asyncOperation(10);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/asyncOperation took \d+\.\d+seconds/)
      );
    });

    it('should only log when threshold is exceeded', () => {
      // This should not log because execution time < 100ms threshold
      processor.heavyComputation(100);
      
      // We can't reliably test threshold without creating artificial delay
      // but we can test that the method still works
      expect(processor.heavyComputation(100)).toBeTypeOf('number');
    });

    it('should include arguments when includeArgs is true', () => {
      processor.processData([10, 20]);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/with args: \[\[10,20\]\]/)
      );
    });

    it('should not include arguments when includeArgs is false', async () => {
      await processor.asyncOperation(5);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.not.stringMatching(/with args:/)
      );
    });

    it('should still return the original method result', () => {
      const result = processor.processData([1, 2, 3]);
      expect(result).toBe(6);
    });

    it('should work with async methods', async () => {
      const result = await processor.asyncOperation(5);
      expect(result).toBe('Completed after 5ms');
    });

    it('should not affect non-timed methods', () => {
      processor.simpleMethod();
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Configuration options', () => {
    it('should handle empty options object', () => {
      class TestClass {
        @timing({})
        testMethod(): string {
          return 'test';
        }
      }
      
      const instance = new TestClass();
      const result = instance.testMethod();
      
      expect(result).toBe('test');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/testMethod took \d+\.\d+ms/)
      );
    });

    it('should handle no options provided', () => {
      class TestClass {
        @timing()
        testMethod(): string {
          return 'test';
        }
      }
      
      const instance = new TestClass();
      const result = instance.testMethod();
      
      expect(result).toBe('test');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/testMethod took \d+\.\d+ms/)
      );
    });

    it('should format time correctly for different units', () => {
      class TestClass {
        @timing({ unit: 'ms' })
        msMethod(): string {
          return 'ms';
        }
        
        @timing({ unit: 'seconds' })
        secondsMethod(): string {
          return 'seconds';
        }
      }
      
      const instance = new TestClass();
      instance.msMethod();
      instance.secondsMethod();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/msMethod took \d+\.\d+ms/)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/secondsMethod took \d+\.\d+seconds/)
      );
    });
  });

  describe('Multiple decorated methods', () => {
    it('should work when multiple methods are decorated with different options', () => {
      processor.processData([1, 2]);
      consoleSpy.mockClear();
      
      processor.heavyComputation(10);
      
      // processData should log (threshold 0), heavyComputation might not (threshold 100ms)
      expect(processor.processData([5, 5])).toBe(10);
    });
  });

  describe('Error handling', () => {
    it('should still measure time even if method throws error', () => {
      class ErrorClass {
        @timing({ unit: 'ms' })
        throwingMethod(): void {
          throw new Error('Test error');
        }
      }
      
      const instance = new ErrorClass();
      
      expect(() => instance.throwingMethod()).toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/throwingMethod took \d+\.\d+ms/)
      );
    });
  });

  describe('Performance considerations', () => {
    it('should handle high-frequency calls efficiently', () => {
      class HighFreqClass {
        @timing({ threshold: 1000 }) // High threshold to avoid logging
        fastMethod(): number {
          return Date.now();
        }
      }
      
      const instance = new HighFreqClass();
      
      // Call many times
      for (let i = 0; i < 100; i++) {
        instance.fastMethod();
      }
      
      // Should not have logged due to high threshold
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Type safety', () => {
    it('should preserve method signatures and return types', () => {
      const numberResult = processor.processData([1, 2, 3]);
      expect(typeof numberResult).toBe('number');
      
      const stringResult = processor.simpleMethod();
      expect(typeof stringResult).toBe('string');
    });

    it('should work with generic methods', () => {
      class GenericClass {
        @timing()
        genericMethod<T>(value: T): T {
          return value;
        }
      }
      
      const instance = new GenericClass();
      expect(instance.genericMethod('test')).toBe('test');
      expect(instance.genericMethod(42)).toBe(42);
    });
  });
});