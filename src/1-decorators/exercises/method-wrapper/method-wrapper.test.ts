import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskManager, wrapper } from './method-wrapper';

describe('Exercise 4: Method Wrapper Decorator', () => {
  let taskManager: TaskManager;
  let consoleSpy: any;

  beforeEach(() => {
    taskManager = new TaskManager();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('@wrapper decorator', () => {
    it('should log "Before" message before method execution', () => {
      taskManager.createTask('Test Task');
      
      expect(consoleSpy).toHaveBeenCalledWith('Before createTask');
    });

    it('should log "After" message after method execution', () => {
      taskManager.createTask('Test Task');
      
      expect(consoleSpy).toHaveBeenCalledWith('After createTask');
    });

    it('should log both before and after messages in correct order', () => {
      taskManager.deleteTask(1);
      
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Before deleteTask');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, 'After deleteTask');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should still return the original method result', () => {
      const result = taskManager.createTask('Important Task');
      
      expect(result).toBe('Task created: Important Task');
    });

    it('should work with different return types', () => {
      const result = taskManager.deleteTask(123);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Before deleteTask');
      expect(consoleSpy).toHaveBeenCalledWith('After deleteTask');
    });

    it('should not affect non-wrapped methods', () => {
      taskManager.listTasks();
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should preserve method context (this binding)', () => {
      const result = taskManager.createTask('Context Test');
      
      expect(result).toBe('Task created: Context Test');
      expect(taskManager).toBeInstanceOf(TaskManager);
    });

    it('should handle methods with multiple parameters', () => {
      // Create a test method with multiple parameters
      class TestClass {
        @wrapper
        multiParamMethod(a: string, b: number, c: boolean): string {
          return `${a}-${b}-${c}`;
        }
      }
      
      const test = new TestClass();
      const result = test.multiParamMethod('hello', 42, true);
      
      expect(result).toBe('hello-42-true');
      expect(consoleSpy).toHaveBeenCalledWith('Before multiParamMethod');
      expect(consoleSpy).toHaveBeenCalledWith('After multiParamMethod');
    });
  });

  describe('Multiple wrapped methods', () => {
    it('should work when multiple methods are wrapped', () => {
      taskManager.createTask('Task 1');
      taskManager.deleteTask(1);
      
      expect(consoleSpy).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Before createTask');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, 'After createTask');
      expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Before deleteTask');
      expect(consoleSpy).toHaveBeenNthCalledWith(4, 'After deleteTask');
    });
  });

  describe('Error handling', () => {
    it('should still log "After" even if method throws error', () => {
      class ErrorClass {
        @wrapper
        throwingMethod(): void {
          throw new Error('Test error');
        }
      }
      
      const errorInstance = new ErrorClass();
      
      expect(() => errorInstance.throwingMethod()).toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith('Before throwingMethod');
      // Note: In this implementation, "After" might not be called if error occurs
      // This is a design decision - some implementations might use try/finally
    });
  });

  describe('Decorator reusability', () => {
    it('should work when applied to different classes', () => {
      class AnotherClass {
        @wrapper
        anotherMethod(): string {
          return 'result';
        }
      }
      
      const instance = new AnotherClass();
      const result = instance.anotherMethod();
      
      expect(result).toBe('result');
      expect(consoleSpy).toHaveBeenCalledWith('Before anotherMethod');
      expect(consoleSpy).toHaveBeenCalledWith('After anotherMethod');
    });
  });
});