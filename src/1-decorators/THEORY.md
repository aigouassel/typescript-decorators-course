# Part 1: Decorator Theory and Concepts

## Table of Contents
1. [What are Decorators?](#what-are-decorators)
2. [Class Decorators](#class-decorators)
3. [Method Decorators](#method-decorators)
4. [Property Decorators](#property-decorators)
5. [Parameter Decorators](#parameter-decorators)
6. [Decorator Factories](#decorator-factories)
7. [Execution Order](#execution-order)
8. [Practical Examples](#practical-examples)

## What are Decorators?

Decorators are a special kind of declaration that can be attached to:
- Classes
- Methods
- Properties
- Parameters

They provide a way to add metadata and modify behavior without changing the original code structure.

### Syntax
```typescript
@decoratorName
class MyClass {}

@decoratorName
method() {}

@decoratorName
property: string;

method(@decoratorName param: string) {}
```

### Key Concepts
- Decorators are **functions** that get called at runtime
- They can **observe**, **modify**, or **replace** definitions
- They execute when the class is **declared**, not when instantiated
- They use the `@` symbol followed by the decorator name

## Class Decorators

Class decorators are applied to the class constructor and can observe, modify, or replace the class definition.

### Basic Class Decorator
```typescript
function classDecorator(constructor: Function) {
  console.log('Class decorator called on:', constructor.name);
}

@classDecorator
class MyClass {
  constructor() {
    console.log('MyClass instantiated');
  }
}

// Output when class is declared:
// "Class decorator called on: MyClass"
```

### Class Decorator with Modification
```typescript
function addTimestamp<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    timestamp = new Date();
    
    constructor(...args: any[]) {
      super(...args);
      console.log(`Instance created at: ${this.timestamp}`);
    }
  };
}

@addTimestamp
class User {
  constructor(public name: string) {}
}

const user = new User('Alice');
// Output: "Instance created at: [current timestamp]"
console.log((user as any).timestamp); // Current date
```

### Sealed Class Decorator
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

// Trying to add properties will fail in strict mode
```

## Method Decorators

Method decorators are applied to method declarations and receive three parameters:
1. Target object (prototype for instance methods, constructor for static methods)
2. Property name
3. Property descriptor

### Basic Method Decorator
```typescript
function logMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  console.log(`Method decorator applied to: ${propertyName}`);
  
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with args:`, args);
    const result = method.apply(this, args);
    console.log(`${propertyName} returned:`, result);
    return result;
  };
}

class Calculator {
  @logMethod
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Output:
// "Method decorator applied to: add"
// "Calling add with args: [2, 3]"
// "add returned: 5"
```

### Performance Timing Decorator
```typescript
function measureTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = method.apply(this, args);
    const end = performance.now();
    console.log(`${propertyName} took ${end - start} milliseconds`);
    return result;
  };
}

class DataProcessor {
  @measureTime
  processLargeArray(data: number[]): number {
    return data.reduce((sum, num) => sum + num, 0);
  }
}
```

### Method Validation Decorator
```typescript
function validateArgs(...validators: Function[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      validators.forEach((validator, index) => {
        if (!validator(args[index])) {
          throw new Error(`Invalid argument at position ${index} for method ${propertyName}`);
        }
      });
      return method.apply(this, args);
    };
  };
}

// Validator functions
const isString = (value: any) => typeof value === 'string';
const isPositiveNumber = (value: any) => typeof value === 'number' && value > 0;

class UserService {
  @validateArgs(isString, isPositiveNumber)
  createUser(name: string, age: number) {
    return { name, age };
  }
}

const service = new UserService();
service.createUser('Alice', 25); // ✅ Works
// service.createUser('Bob', -5); // ❌ Throws error
```

## Property Decorators

Property decorators are applied to property declarations and receive two parameters:
1. Target object
2. Property name

### Basic Property Decorator
```typescript
function logProperty(target: any, propertyName: string) {
  console.log(`Property decorator applied to: ${propertyName}`);
  
  let value: any;
  
  const getter = () => {
    console.log(`Getting ${propertyName}: ${value}`);
    return value;
  };
  
  const setter = (newValue: any) => {
    console.log(`Setting ${propertyName} to: ${newValue}`);
    value = newValue;
  };
  
  Object.defineProperty(target, propertyName, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class Person {
  @logProperty
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person('Alice');
// Output: "Setting name to: Alice"
console.log(person.name);
// Output: "Getting name: Alice"
```

### Required Property Decorator
```typescript
const requiredProperties: string[] = [];

function required(target: any, propertyName: string) {
  requiredProperties.push(propertyName);
}

function validate(target: any) {
  const missingProperties = requiredProperties.filter(prop => !target[prop]);
  if (missingProperties.length > 0) {
    throw new Error(`Missing required properties: ${missingProperties.join(', ')}`);
  }
}

class Product {
  @required
  name: string;
  
  @required
  price: number;
  
  description?: string;
  
  constructor(data: Partial<Product>) {
    Object.assign(this, data);
    validate(this);
  }
}

// const product = new Product({}); // ❌ Throws error
const product = new Product({ name: 'Laptop', price: 999 }); // ✅ Works
```

## Parameter Decorators

Parameter decorators are applied to function parameters and receive three parameters:
1. Target object
2. Method name
3. Parameter index

### Basic Parameter Decorator
```typescript
function logParameter(target: any, methodName: string, parameterIndex: number) {
  console.log(`Parameter decorator applied to parameter ${parameterIndex} of method ${methodName}`);
}

class OrderService {
  createOrder(
    @logParameter userId: string,
    @logParameter amount: number,
    @logParameter items: string[]
  ) {
    return { userId, amount, items };
  }
}

// Output when class is declared:
// "Parameter decorator applied to parameter 2 of method createOrder"
// "Parameter decorator applied to parameter 1 of method createOrder"
// "Parameter decorator applied to parameter 0 of method createOrder"
```

### Parameter Validation Decorator
```typescript
const parameterValidators = new Map<string, Map<number, Function>>();

function validateParameter(validator: Function) {
  return function (target: any, methodName: string, parameterIndex: number) {
    const className = target.constructor.name;
    const key = `${className}.${methodName}`;
    
    if (!parameterValidators.has(key)) {
      parameterValidators.set(key, new Map());
    }
    
    parameterValidators.get(key)!.set(parameterIndex, validator);
  };
}

function validateMethod(target: any, methodName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const className = target.constructor.name;
    const key = `${className}.${methodName}`;
    const validators = parameterValidators.get(key);
    
    if (validators) {
      validators.forEach((validator, index) => {
        if (!validator(args[index])) {
          throw new Error(`Invalid parameter at index ${index} for ${methodName}`);
        }
      });
    }
    
    return method.apply(this, args);
  };
}

// Validator functions
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isNotEmpty = (value: string) => value && value.trim().length > 0;

class AuthService {
  @validateMethod
  login(
    @validateParameter(isEmail) email: string,
    @validateParameter(isNotEmpty) password: string
  ) {
    return { email, authenticated: true };
  }
}

const auth = new AuthService();
auth.login('user@example.com', 'password123'); // ✅ Works
// auth.login('invalid-email', ''); // ❌ Throws error
```

## Decorator Factories

Decorator factories are functions that return decorators, allowing you to customize decorator behavior with parameters.

### Simple Decorator Factory
```typescript
function component(name: string) {
  return function (constructor: Function) {
    console.log(`Registering component: ${name}`);
    (constructor as any).componentName = name;
  };
}

@component('UserProfile')
class UserProfileComponent {
  render() {
    return '<div>User Profile</div>';
  }
}

console.log((UserProfileComponent as any).componentName); // "UserProfile"
```

### Configurable Method Decorator Factory
```typescript
function retry(maxAttempts: number, delay: number = 1000) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          lastError = error;
          console.log(`Attempt ${attempt} failed for ${propertyName}:`, error.message);
          
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
  async fetchData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}
```

### Property Decorator Factory with Options
```typescript
interface FormatOptions {
  uppercase?: boolean;
  trim?: boolean;
  prefix?: string;
}

function format(options: FormatOptions = {}) {
  return function (target: any, propertyName: string) {
    let value: string;
    
    const getter = () => value;
    
    const setter = (newValue: string) => {
      if (typeof newValue === 'string') {
        let formatted = newValue;
        
        if (options.trim) {
          formatted = formatted.trim();
        }
        
        if (options.uppercase) {
          formatted = formatted.toUpperCase();
        }
        
        if (options.prefix) {
          formatted = options.prefix + formatted;
        }
        
        value = formatted;
      } else {
        value = newValue;
      }
    };
    
    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class User {
  @format({ uppercase: true, trim: true, prefix: 'USER_' })
  username: string;
  
  constructor(username: string) {
    this.username = username;
  }
}

const user = new User('  alice  ');
console.log(user.username); // "USER_ALICE"
```

## Execution Order

Understanding the order in which decorators execute is crucial:

```typescript
function first() {
  console.log('first(): factory evaluated');
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log('first(): called');
  };
}

function second() {
  console.log('second(): factory evaluated');
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log('second(): called');
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}

// Output:
// "first(): factory evaluated"
// "second(): factory evaluated"
// "second(): called"
// "first(): called"
```

### Multiple Decorator Types Order
```typescript
function classDecorator(constructor: Function) {
  console.log('Class decorator');
}

function methodDecorator(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  console.log('Method decorator:', propertyName);
}

function propertyDecorator(target: any, propertyName: string) {
  console.log('Property decorator:', propertyName);
}

function parameterDecorator(target: any, methodName: string, parameterIndex: number) {
  console.log('Parameter decorator:', methodName, 'index:', parameterIndex);
}

@classDecorator
class OrderOfExecution {
  @propertyDecorator
  property: string;
  
  @methodDecorator
  method(@parameterDecorator param: string) {
    return param;
  }
}

// Output:
// "Property decorator: property"
// "Parameter decorator: method index: 0"
// "Method decorator: method"
// "Class decorator"
```

## Practical Examples

### 1. Caching Decorator
```typescript
const cache = new Map<string, any>();

function cached(ttl: number = 60000) { // TTL in milliseconds
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`Cache hit for ${propertyName}`);
        return cached.value;
      }
      
      const result = method.apply(this, args);
      cache.set(key, { value: result, timestamp: Date.now() });
      console.log(`Cache miss for ${propertyName}, result cached`);
      
      return result;
    };
  };
}

class DataService {
  @cached(30000) // Cache for 30 seconds
  async fetchUserData(userId: string) {
    console.log(`Fetching data for user ${userId}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  }
}
```

### 2. Authorization Decorator
```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

const currentUser = { role: Role.USER }; // Simulate current user

function requireRole(requiredRole: Role) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      if (currentUser.role !== requiredRole && requiredRole !== Role.USER) {
        throw new Error(`Access denied. Required role: ${requiredRole}`);
      }
      
      return method.apply(this, args);
    };
  };
}

class AdminService {
  @requireRole(Role.ADMIN)
  deleteUser(userId: string) {
    console.log(`Deleting user ${userId}`);
    return { success: true };
  }
  
  @requireRole(Role.MODERATOR)
  banUser(userId: string) {
    console.log(`Banning user ${userId}`);
    return { success: true };
  }
  
  getUsers() {
    console.log('Getting all users');
    return [];
  }
}

const adminService = new AdminService();
adminService.getUsers(); // ✅ Works
// adminService.deleteUser('123'); // ❌ Throws error
```

### 3. Rate Limiting Decorator
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyName}`;
      const now = Date.now();
      const windowData = rateLimitMap.get(key);
      
      if (!windowData || now > windowData.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return method.apply(this, args);
      }
      
      if (windowData.count >= maxRequests) {
        throw new Error(`Rate limit exceeded for ${propertyName}. Try again later.`);
      }
      
      windowData.count++;
      return method.apply(this, args);
    };
  };
}

class EmailService {
  @rateLimit(5, 60000) // 5 requests per minute
  sendEmail(to: string, subject: string, body: string) {
    console.log(`Sending email to ${to}: ${subject}`);
    return { messageId: Math.random().toString(36) };
  }
}
```

### 4. Deprecation Warning Decorator
```typescript
function deprecated(message?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const warning = message || `${target.constructor.name}.${propertyName} is deprecated`;
      console.warn(`⚠️ DEPRECATION WARNING: ${warning}`);
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

class LegacyService {
  @deprecated('Use getUserById instead')
  getUser(id: string) {
    return { id, name: 'Legacy User' };
  }
  
  getUserById(id: string) {
    return { id, name: 'New User' };
  }
}
```

### 5. Async Error Handling Decorator
```typescript
function catchAsync(fallback?: any) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        console.error(`Error in ${target.constructor.name}.${propertyName}:`, error);
        
        if (fallback !== undefined) {
          return typeof fallback === 'function' ? fallback(error, ...args) : fallback;
        }
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

class UserService {
  @catchAsync([]) // Return empty array on error
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }
  
  @catchAsync((error: Error, userId: string) => ({ id: userId, name: 'Unknown', error: error.message }))
  async getUser(userId: string): Promise<User> {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    return response.json();
  }
}
```

## Best Practices

### Decorator Design
1. **Single Responsibility**: Each decorator should have one clear purpose
2. **Composability**: Decorators should work well together
3. **Performance**: Minimize runtime overhead in decorator execution
4. **Type Safety**: Preserve and enhance TypeScript type information

### Error Handling
1. **Graceful Degradation**: Provide fallbacks when decorators fail
2. **Clear Error Messages**: Give meaningful error messages when validation fails
3. **Non-Breaking**: Decorators shouldn't break existing functionality
4. **Debug Information**: Include context in error messages

### Testing Considerations
1. **Test Decorator Logic**: Test decorators independently of the classes they decorate
2. **Mock External Dependencies**: Mock services, caches, and external APIs
3. **Test Edge Cases**: Test error conditions and boundary cases
4. **Integration Testing**: Test decorated classes in realistic scenarios

## Common Pitfalls

### 1. `this` Context Issues
**Problem**: Losing `this` context when replacing methods
**Solution**: Use `function` declarations, not arrow functions, and properly bind context

```typescript
// ❌ Wrong - loses this context
descriptor.value = (...args: any[]) => {
  return originalMethod.apply(this, args); // `this` is undefined
};

// ✅ Correct - preserves this context
descriptor.value = function (...args: any[]) {
  return originalMethod.apply(this, args); // `this` is correct
};
```

### 2. Decorator Execution Timing
**Problem**: Assuming decorators run when methods are called
**Solution**: Remember decorators execute when the class is defined, not when methods are called

### 3. Type Information Loss
**Problem**: TypeScript types lost during decoration
**Solution**: Use proper type annotations and generic constraints

```typescript
// ✅ Preserve types with generics
function logMethod<T extends (...args: any[]) => any>(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
  // Implementation
}
```

### 4. Memory Leaks
**Problem**: Caching or storing references without cleanup
**Solution**: Implement proper cleanup and use WeakMap when appropriate

```typescript
// ✅ Use WeakMap to avoid memory leaks
const cache = new WeakMap<Object, Map<string, any>>();
```

### 5. Side Effects in Decorators
**Problem**: Decorators causing unexpected side effects
**Solution**: Keep decorators pure and predictable

---

## Next Steps

After mastering these decorator fundamentals, next steps include:

1. **Practice with Exercises**: Apply these concepts in hands-on exercises
2. **Learn API Details**: Use the API reference for implementation specifics
3. **Explore Metadata**: Proceed to Part 2 for metadata integration
4. **Build Systems**: Create validation, caching, and authorization systems using decorators