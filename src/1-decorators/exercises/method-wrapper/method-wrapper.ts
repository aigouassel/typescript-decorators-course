import 'reflect-metadata';
import { wrapper } from './decorators.js';

/**
 * Exercise 4: Method Wrapper
 * Create a @wrapper decorator that adds "Before" and "After" logging around method execution
 */

// Test class
export class TaskManager {
  @wrapper
  createTask(name: string): string {
    return `Task created: ${name}`;
  }

  @wrapper
  deleteTask(id: number): boolean {
    return true;
  }

  // Non-wrapped method for comparison
  listTasks(): string[] {
    return ['task1', 'task2'];
  }
}