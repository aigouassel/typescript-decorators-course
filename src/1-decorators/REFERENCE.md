# Part 1: Decorator API Reference

This reference covers the TypeScript decorator syntax and patterns. For complete documentation, see the [TypeScript Handbook - Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).

## Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Decorator Types

### Class Decorators

Applied to class declarations. Receive the class constructor as the only parameter.

#### Syntax
```typescript
@decorator
class MyClass {}

// Equivalent to:
class MyClass {}
MyClass = decorator(MyClass) || MyClass;
```

#### Function Signature
```typescript
type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
```

#### Basic Example
```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;
  constructor(title: string) {
    this.title = title;
  }
}
```

#### Class Replacement Example
```typescript
function addTimestamp<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    timestamp = new Date();
  };
}

@addTimestamp
class User {
  constructor(public name: string) {}
}
```

### Method Decorators

Applied to method declarations. Receive three parameters: target, property key, and property descriptor.

#### Syntax
```typescript
class MyClass {
  @decorator
  method() {}
}
```

#### Function Signature
```typescript
type MethodDecorator = <T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
```

#### Parameters
- **target**: The prototype of the class (for instance methods) or the constructor (for static methods)
- **propertyKey**: The name of the method
- **descriptor**: The Property Descriptor for the method

#### Basic Example
```typescript
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

#### Method Wrapping Example
```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}
```

### Property Decorators

Applied to property declarations. Receive two parameters: target and property key.

#### Syntax
```typescript
class MyClass {
  @decorator
  property: string;
}
```

#### Function Signature
```typescript
type PropertyDecorator = (target: any, propertyKey: string | symbol) => void;
```

#### Parameters
- **target**: The prototype of the class (for instance properties) or the constructor (for static properties)
- **propertyKey**: The name of the property

#### Basic Example
```typescript
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value: string;

    const getter = function () {
      return value;
    };

    const setter = function (newVal: string) {
      value = formatString.replace('%s', newVal);
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }
}
```

### Parameter Decorators

Applied to function parameters. Receive three parameters: target, property key, and parameter index.

#### Syntax
```typescript
class MyClass {
  method(@decorator param: string) {}
}
```

#### Function Signature
```typescript
type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;
```

#### Parameters
- **target**: The prototype of the class (for instance methods) or the constructor (for static methods)
- **propertyKey**: The name of the method (undefined for constructor parameters)
- **parameterIndex**: The ordinal index of the parameter in the function's parameter list

#### Basic Example
```typescript
function required(target: any, propertyKey: string, parameterIndex: number) {
  const existingRequiredParameters: number[] = Reflect.getOwnMetadata("required", target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata("required", existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const requiredParameters: number[] = Reflect.getOwnMetadata("required", target, propertyKey) || [];
    
    for (const parameterIndex of requiredParameters) {
      if (parameterIndex >= args.length || args[parameterIndex] === undefined) {
        throw new Error("Missing required argument.");
      }
    }

    return method.apply(this, args);
  };
}

class BugReport {
  @validate
  print(@required verbose: boolean) {
    // implementation
  }
}
```

## Decorator Factories

Functions that return decorators, allowing parameterization.

### Basic Factory Pattern
```typescript
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

class MyClass {
  @configurable(false)
  method() {}
}
```

### Advanced Factory Example
```typescript
interface CacheOptions {
  ttl?: number;
  key?: string;
}

function cache(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheMap = new Map<string, { value: any; timestamp: number }>();
    
    descriptor.value = function (...args: any[]) {
      const key = options.key || JSON.stringify(args);
      const cached = cacheMap.get(key);
      const now = Date.now();
      
      if (cached && (!options.ttl || now - cached.timestamp < options.ttl)) {
        return cached.value;
      }
      
      const result = originalMethod.apply(this, args);
      cacheMap.set(key, { value: result, timestamp: now });
      
      return result;
    };
  };
}

class DataService {
  @cache({ ttl: 5000, key: 'user-data' })
  getUserData() {
    // expensive operation
  }
}
```

## Property Descriptor

The Property Descriptor object passed to method decorators.

### Interface
```typescript
interface PropertyDescriptor {
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get?(): any;
  set?(v: any): void;
}
```

### Common Patterns

#### Method Replacement
```typescript
function override(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    // Custom logic before
    const result = originalMethod.apply(this, args);
    // Custom logic after
    return result;
  };
}
```

#### Property Configuration
```typescript
function readonly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false;
}

function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
```

## Execution Order

### Multiple Decorators on Same Target
```typescript
@f @g x
// Equivalent to: f(g(x))
```

### Example
```typescript
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}

// Output:
// first(): factory evaluated
// second(): factory evaluated  
// second(): called
// first(): called
```

### Decorator Type Order
Within a class, decorators are applied in this order:
1. Parameter decorators
2. Method/Property/Accessor decorators  
3. Class decorators

```typescript
@classDecorator
class Example {
  @propertyDecorator
  property: string;
  
  @methodDecorator
  method(@parameterDecorator param: string) {}
}

// Execution order:
// 1. propertyDecorator
// 2. parameterDecorator  
// 3. methodDecorator
// 4. classDecorator
```

## Common Patterns

### Validation Decorator
```typescript
function validate(...validators: Function[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      validators.forEach((validator, index) => {
        if (!validator(args[index])) {
          throw new Error(`Validation failed for parameter ${index}`);
        }
      });
      
      return method.apply(this, args);
    };
  };
}

// Usage
const isString = (value: any) => typeof value === 'string';
const isNumber = (value: any) => typeof value === 'number';

class UserService {
  @validate(isString, isNumber)
  createUser(name: string, age: number) {
    return { name, age };
  }
}
```

### Timing Decorator
```typescript
function time(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    
    console.log(`${propertyKey} took ${end - start} milliseconds`);
    return result;
  };
}

class Calculator {
  @time
  fibonacci(n: number): number {
    return n <= 1 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

### Memoization Decorator
```typescript
function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cache = new Map<string, any>();
  
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

class MathUtils {
  @memoize
  expensiveCalculation(x: number, y: number): number {
    // Simulate expensive calculation
    return x * y + Math.random();
  }
}
```

### Retry Decorator
```typescript
function retry(maxAttempts: number, delay: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError;
    };
  };
}

class ApiService {
  @retry(3, 2000)
  async fetchData(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}
```

### Authorization Decorator
```typescript
function requireRole(role: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // Assume getCurrentUser() is available
      const currentUser = getCurrentUser();
      
      if (!currentUser || currentUser.role !== role) {
        throw new Error(`Access denied. Required role: ${role}`);
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

class AdminService {
  @requireRole('admin')
  deleteUser(userId: string) {
    // Delete user logic
  }
}
```

## Type Safety

### Generic Decorators
```typescript
function logReturn<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  const originalMethod = descriptor.value;
  
  if (originalMethod) {
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      console.log(`${propertyKey} returned:`, result);
      return result;
    } as any;
  }
  
  return descriptor;
}
```

### Decorator with Type Constraints
```typescript
type Constructor = new (...args: any[]) => {};

function mixin<T extends Constructor>(Base: T) {
  return class extends Base {
    timestamp = new Date();
  };
}

@mixin
class User {
  constructor(public name: string) {}
}
```

## Best Practices

### 1. Preserve Type Information
```typescript
function decorator<T extends Function>(target: T): T {
  // Implementation that preserves type
  return target;
}
```

### 2. Handle Errors Gracefully
```typescript
function safeDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    try {
      return originalMethod.apply(this, args);
    } catch (error) {
      console.error(`Error in ${propertyKey}:`, error);
      throw error;
    }
  };
}
```

### 3. Use Factories for Configuration
```typescript
interface LogOptions {
  level: 'info' | 'warn' | 'error';
  includeArgs: boolean;
}

function log(options: LogOptions = { level: 'info', includeArgs: true }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Implementation using options
  };
}
```

### 4. Clean Up Resources
```typescript
function withCleanup(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const resource = acquireResource();
    
    try {
      return originalMethod.apply(this, args);
    } finally {
      releaseResource(resource);
    }
  };
}
```

## Common Pitfalls

### 1. Arrow Functions Lose `this`
```typescript
// ❌ Wrong
descriptor.value = (...args: any[]) => {
  return originalMethod.apply(this, args); // `this` is undefined
};

// ✅ Correct
descriptor.value = function (...args: any[]) {
  return originalMethod.apply(this, args); // `this` is preserved
};
```

### 2. Not Returning Descriptor
```typescript
// ❌ May not work as expected
function decorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.enumerable = false;
  // Missing return statement
}

// ✅ Explicit return
function decorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
```

### 3. Side Effects in Decorator Functions
```typescript
// ❌ Side effects during class definition
function badDecorator(target: any) {
  console.log('This runs when class is defined!');
  // Expensive operations here are problematic
}

// ✅ Defer side effects
function goodDecorator(target: any) {
  // Minimal logic during decoration
  return target;
}
```

## Quick Reference

| Decorator Type | Signature | Parameters | Use Case |
|----------------|-----------|------------|----------|
| Class | `(constructor: Function) => Function \| void` | constructor | Modify or replace class |
| Method | `(target, key, descriptor) => descriptor \| void` | target, property key, descriptor | Wrap or modify methods |
| Property | `(target, key) => void` | target, property key | Add property metadata |
| Parameter | `(target, key, index) => void` | target, property key, parameter index | Parameter validation/metadata |

## Links

- **TypeScript Handbook - Decorators**: https://www.typescriptlang.org/docs/handbook/decorators.html
- **ECMAScript Decorators Proposal**: https://github.com/tc39/proposal-decorators
- **TypeScript Decorator Metadata**: https://www.typescriptlang.org/docs/handbook/decorators.html#metadata