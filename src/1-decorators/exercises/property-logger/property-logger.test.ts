import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfile, track } from './property-logger';

describe('Exercise 3: Property Logger Decorator', () => {
  let user: UserProfile;
  let consoleSpy: any;

  beforeEach(() => {
    user = new UserProfile();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('@track decorator', () => {
    it('should log when property is set', () => {
      user.name = 'John Doe';
      
      // Since the class initializes with empty string, the log shows empty string to John Doe
      expect(consoleSpy).toHaveBeenCalledWith('Setting property: name from  to John Doe');
    });

    it('should log when property is accessed', () => {
      user.name = 'Jane';
      consoleSpy.mockClear(); // Clear the set log
      
      const value = user.name;
      
      expect(consoleSpy).toHaveBeenCalledWith('Getting property: name = Jane');
      expect(value).toBe('Jane');
    });

    it('should log property updates with old and new values', () => {
      user.email = 'old@example.com';
      user.email = 'new@example.com';
      
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Setting property: email from undefined to old@example.com');
      expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Setting property: email from old@example.com to new@example.com');
    });

    it('should work with multiple tracked properties', () => {
      user.name = 'Alice';
      user.email = 'alice@example.com';
      
      expect(consoleSpy).toHaveBeenCalledWith('Setting property: name from undefined to Alice');
      expect(consoleSpy).toHaveBeenCalledWith('Setting property: email from undefined to alice@example.com');
    });

    it('should not log for non-tracked properties', () => {
      user.age = 25;
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should preserve property values correctly', () => {
      user.name = 'Test User';
      consoleSpy.mockClear();
      
      expect(user.name).toBe('Test User');
      expect(consoleSpy).toHaveBeenCalledWith('Getting property: name = Test User');
    });
  });

  describe('Property behavior', () => {
    it('should handle undefined values correctly', () => {
      const value = user.name; // Initially undefined
      
      expect(consoleSpy).toHaveBeenCalledWith('Getting property: name = undefined');
      expect(value).toBeUndefined();
    });

    it('should handle null values correctly', () => {
      user.name = null as any;
      
      expect(consoleSpy).toHaveBeenCalledWith('Setting property: name from undefined to null');
    });

    it('should handle different data types', () => {
      user.name = 'string value';
      user.email = 'test@example.com';
      
      expect(user.name).toBe('string value');
      expect(user.email).toBe('test@example.com');
    });

    it('should allow property enumeration', () => {
      user.name = 'John';
      user.email = 'john@test.com';
      
      const keys = Object.keys(user);
      expect(keys).toContain('name');
      expect(keys).toContain('email');
    });
  });

  describe('Multiple instances', () => {
    it('should track properties independently for different instances', () => {
      const user1 = new UserProfile();
      const user2 = new UserProfile();
      
      user1.name = 'User One';
      user2.name = 'User Two';
      
      consoleSpy.mockClear();
      
      expect(user1.name).toBe('User One');
      expect(user2.name).toBe('User Two');
      
      expect(consoleSpy).toHaveBeenCalledWith('Getting property: name = User One');
      expect(consoleSpy).toHaveBeenCalledWith('Getting property: name = User Two');
    });
  });

  describe('Decorator reusability', () => {
    it('should work when applied to different classes', () => {
      class Product {
        @track
        title: string = '';
      }
      
      const product = new Product();
      product.title = 'Test Product';
      
      expect(consoleSpy).toHaveBeenCalledWith('Setting property: title from undefined to Test Product');
    });
  });
});