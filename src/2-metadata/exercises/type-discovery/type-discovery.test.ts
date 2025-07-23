import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  getPropertyType,
  getParameterTypes,
  getReturnType,
  typeToString,
  getAllProperties,
  getMethodInfo,
  TypeInspector,
  Address,
  User,
  Product,
} from './type-discovery';

describe('Exercise: Property Type Discovery', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('getPropertyType function', () => {
    it('should get string property type', () => {
      const type = getPropertyType(User.prototype, 'name');
      expect(type).toBe(String);
    });

    it('should get number property type', () => {
      const type = getPropertyType(User.prototype, 'id');
      expect(type).toBe(Number);
    });

    it('should get boolean property type', () => {
      const type = getPropertyType(User.prototype, 'isActive');
      expect(type).toBe(Boolean);
    });

    it('should get Date property type', () => {
      const type = getPropertyType(User.prototype, 'birthDate');
      expect(type).toBe(Date);
    });

    it('should get custom class property type', () => {
      const type = getPropertyType(User.prototype, 'address');
      expect(type).toBe(Address);
    });

    it('should get Array property type', () => {
      const type = getPropertyType(User.prototype, 'tags');
      expect(type).toBe(Array);
    });

    it('should return undefined for non-existent property', () => {
      const type = getPropertyType(User.prototype, 'nonExistent');
      expect(type).toBeUndefined();
    });
  });

  describe('getParameterTypes function', () => {
    it('should get parameter types for method with multiple parameters', () => {
      const types = getParameterTypes(User.prototype, 'updateProfile');
      expect(types).toEqual([String, String]);
    });

    it('should get parameter types for method with single parameter', () => {
      const types = getParameterTypes(User.prototype, 'addTag');
      expect(types).toEqual([String]);
    });

    it('should get parameter types for method with custom class parameter', () => {
      const types = getParameterTypes(Address.prototype, 'constructor');
      expect(types).toEqual([String, String, String]);
    });

    it('should return undefined for non-existent method', () => {
      const types = getParameterTypes(User.prototype, 'nonExistentMethod');
      expect(types).toBeUndefined();
    });

    it('should handle methods with no parameters', () => {
      const types = getParameterTypes(User.prototype, 'calculateAge');
      expect(Array.isArray(types)).toBe(true);
      expect(types?.length).toBe(0);
    });
  });

  describe('getReturnType function', () => {
    it('should get number return type', () => {
      const type = getReturnType(User.prototype, 'calculateAge');
      expect(type).toBe(Number);
    });

    it('should get boolean return type', () => {
      const type = getReturnType(User.prototype, 'hasTag');
      expect(type).toBe(Boolean);
    });

    it('should get string return type', () => {
      const type = getReturnType(Address.prototype, 'getFullAddress');
      expect(type).toBe(String);
    });

    it('should get void return type', () => {
      const type = getReturnType(User.prototype, 'updateProfile');
      expect(type).toBe(undefined); // void methods return undefined
    });

    it('should return undefined for non-existent method', () => {
      const type = getReturnType(User.prototype, 'nonExistentMethod');
      expect(type).toBeUndefined();
    });
  });

  describe('typeToString function', () => {
    it('should convert primitive types to strings', () => {
      expect(typeToString(String)).toBe('string');
      expect(typeToString(Number)).toBe('number');
      expect(typeToString(Boolean)).toBe('boolean');
      expect(typeToString(Date)).toBe('Date');
      expect(typeToString(Array)).toBe('Array');
      expect(typeToString(Object)).toBe('Object');
    });

    it('should convert custom class types to their names', () => {
      expect(typeToString(User)).toBe('User');
      expect(typeToString(Address)).toBe('Address');
      expect(typeToString(Product)).toBe('Product');
    });

    it('should handle undefined type', () => {
      expect(typeToString(undefined)).toBe('unknown');
    });

    it('should handle anonymous functions', () => {
      const AnonymousClass = function() {};
      Object.defineProperty(AnonymousClass, 'name', { value: '' });
      expect(typeToString(AnonymousClass as any)).toBe('unknown');
    });
  });

  describe('getAllProperties function', () => {
    it('should get all properties for User class', () => {
      const properties = getAllProperties(User);
      
      const propertyNames = properties.map(p => p.name);
      expect(propertyNames).toContain('id');
      expect(propertyNames).toContain('name');
      expect(propertyNames).toContain('email');
      expect(propertyNames).toContain('isActive');
      expect(propertyNames).toContain('birthDate');
      expect(propertyNames).toContain('address');
      expect(propertyNames).toContain('tags');
    });

    it('should have correct type information', () => {
      const properties = getAllProperties(User);
      const propertyMap = new Map(properties.map(p => [p.name, p]));
      
      expect(propertyMap.get('name')?.type).toBe('string');
      expect(propertyMap.get('id')?.type).toBe('number');
      expect(propertyMap.get('isActive')?.type).toBe('boolean');
      expect(propertyMap.get('birthDate')?.type).toBe('Date');
      expect(propertyMap.get('address')?.type).toBe('Address');
      expect(propertyMap.get('tags')?.type).toBe('Array');
    });

    it('should have correct constructor references', () => {
      const properties = getAllProperties(User);
      const propertyMap = new Map(properties.map(p => [p.name, p]));
      
      expect(propertyMap.get('name')?.constructor).toBe(String);
      expect(propertyMap.get('id')?.constructor).toBe(Number);
      expect(propertyMap.get('address')?.constructor).toBe(Address);
    });

    it('should not include constructor property', () => {
      const properties = getAllProperties(User);
      const constructorProp = properties.find(p => p.name === 'constructor');
      expect(constructorProp).toBeUndefined();
    });
  });

  describe('getMethodInfo function', () => {
    it('should get method info for updateProfile', () => {
      const methodInfo = getMethodInfo(User, 'updateProfile');
      
      expect(methodInfo).toBeDefined();
      expect(methodInfo?.name).toBe('updateProfile');
      expect(methodInfo?.parameterTypes).toEqual(['string', 'string']);
      expect(methodInfo?.returnType).toBe('unknown'); // void
      expect(methodInfo?.parameterConstructors).toEqual([String, String]);
    });

    it('should get method info for calculateAge', () => {
      const methodInfo = getMethodInfo(User, 'calculateAge');
      
      expect(methodInfo).toBeDefined();
      expect(methodInfo?.name).toBe('calculateAge');
      expect(methodInfo?.parameterTypes).toEqual([]);
      expect(methodInfo?.returnType).toBe('number');
      expect(methodInfo?.returnConstructor).toBe(Number);
    });

    it('should get method info for hasTag', () => {
      const methodInfo = getMethodInfo(User, 'hasTag');
      
      expect(methodInfo).toBeDefined();
      expect(methodInfo?.name).toBe('hasTag');
      expect(methodInfo?.parameterTypes).toEqual(['string']);
      expect(methodInfo?.returnType).toBe('boolean');
      expect(methodInfo?.parameterConstructors).toEqual([String]);
      expect(methodInfo?.returnConstructor).toBe(Boolean);
    });

    it('should return undefined for non-existent method', () => {
      const methodInfo = getMethodInfo(User, 'nonExistentMethod');
      expect(methodInfo).toBeUndefined();
    });
  });

  describe('TypeInspector class', () => {
    let userInspector: TypeInspector;
    let addressInspector: TypeInspector;

    beforeEach(() => {
      userInspector = new TypeInspector(User);
      addressInspector = new TypeInspector(Address);
    });

    describe('getClassName method', () => {
      it('should return correct class name', () => {
        expect(userInspector.getClassName()).toBe('User');
        expect(addressInspector.getClassName()).toBe('Address');
      });

      it('should handle anonymous classes', () => {
        const AnonymousClass = function() {};
        Object.defineProperty(AnonymousClass, 'name', { value: '' });
        const inspector = new TypeInspector(AnonymousClass);
        expect(inspector.getClassName()).toBe('unknown');
      });
    });

    describe('getProperties method', () => {
      it('should return properties for User', () => {
        const properties = userInspector.getProperties();
        const propertyNames = properties.map(p => p.name);
        
        expect(propertyNames).toContain('name');
        expect(propertyNames).toContain('email');
        expect(propertyNames).toContain('id');
        expect(properties.length).toBeGreaterThan(0);
      });

      it('should return properties for Address', () => {
        const properties = addressInspector.getProperties();
        const propertyNames = properties.map(p => p.name);
        
        expect(propertyNames).toContain('street');
        expect(propertyNames).toContain('city');
        expect(propertyNames).toContain('country');
        expect(propertyNames).toContain('zipCode');
      });
    });

    describe('getMethods method', () => {
      it('should return methods for User', () => {
        const methods = userInspector.getMethods();
        const methodNames = methods.map(m => m.name);
        
        expect(methodNames).toContain('updateProfile');
        expect(methodNames).toContain('calculateAge');
        expect(methodNames).toContain('addTag');
        expect(methodNames).toContain('hasTag');
      });

      it('should return methods for Address', () => {
        const methods = addressInspector.getMethods();
        const methodNames = methods.map(m => m.name);
        
        expect(methodNames).toContain('getFullAddress');
        expect(methodNames).toContain('isValid');
      });

      it('should have correct method signatures', () => {
        const methods = userInspector.getMethods();
        const updateProfile = methods.find(m => m.name === 'updateProfile');
        
        expect(updateProfile?.parameterTypes).toEqual(['string', 'string']);
        expect(updateProfile?.returnType).toBe('unknown'); // void
      });
    });

    describe('printReport method', () => {
      it('should print report without errors', () => {
        expect(() => userInspector.printReport()).not.toThrow();
        expect(() => addressInspector.printReport()).not.toThrow();
      });

      it('should log class name in report', () => {
        userInspector.printReport();
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Type Inspector Report for User')
        );
      });

      it('should log properties and methods', () => {
        userInspector.printReport();
        
        expect(consoleSpy).toHaveBeenCalledWith('Properties:');
        expect(consoleSpy).toHaveBeenCalledWith('\nMethods:');
      });
    });
  });

  describe('Complex type scenarios', () => {
    it('should handle nested custom types', () => {
      const addressType = getPropertyType(User.prototype, 'address');
      expect(addressType).toBe(Address);
      expect(typeToString(addressType)).toBe('Address');
    });

    it('should handle array types correctly', () => {
      const tagsType = getPropertyType(User.prototype, 'tags');
      expect(tagsType).toBe(Array);
      expect(typeToString(tagsType)).toBe('Array');
    });

    it('should handle constructor parameters', () => {
      const constructorTypes = getParameterTypes(User, 'constructor');
      expect(constructorTypes).toEqual([String, String]);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle classes with no properties', () => {
      class EmptyClass {}
      const properties = getAllProperties(EmptyClass);
      expect(Array.isArray(properties)).toBe(true);
    });

    it('should handle classes with no methods', () => {
      class EmptyClass {}
      const inspector = new TypeInspector(EmptyClass);
      const methods = inspector.getMethods();
      expect(Array.isArray(methods)).toBe(true);
    });

    it('should handle inherited properties and methods', () => {
      class BaseClass {
        baseProperty: string = '';
        baseMethod(): void {}
      }
      
      class DerivedClass extends BaseClass {
        derivedProperty: number = 0;
      }
      
      const inspector = new TypeInspector(DerivedClass);
      const properties = inspector.getProperties();
      const methods = inspector.getMethods();
      
      // Should include both own and inherited members
      expect(properties.some(p => p.name === 'derivedProperty')).toBe(true);
      expect(methods.some(m => m.name === 'baseMethod')).toBe(true);
    });
  });
});