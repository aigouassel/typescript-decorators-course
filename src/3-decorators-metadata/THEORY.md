# Part 3: Decorators as Metadata Handlers - Theory and Concepts

## Table of Contents
1. [Introduction](#introduction)
2. [Decorator-Metadata Integration](#decorator-metadata-integration)
3. [Building Decorator-Driven Systems](#building-decorator-driven-systems)
4. [Validation System with Decorators](#validation-system-with-decorators)
5. [HTTP Routing Systems](#http-routing-systems)
6. [Performance Optimization Patterns](#performance-optimization-patterns)
7. [Advanced Metadata Inheritance](#advanced-metadata-inheritance)
8. [Best Practices](#best-practices)

## Introduction

Part 3 builds upon the metadata fundamentals from Part 2 by demonstrating how decorators serve as elegant interfaces for managing and utilizing metadata. While Part 2 focused on pure metadata operations, Part 3 shows how decorators become the primary way to interact with metadata-driven systems.

### Key Concepts
- **Decorators as Metadata Writers**: Using decorators to store configuration and type information
- **Metadata-Driven Business Logic**: Building systems that execute behavior based on stored metadata
- **Declarative Programming**: Creating APIs where behavior is defined through decoration rather than imperative code
- **Runtime Reflection**: Using stored metadata to make runtime decisions about program behavior

### Learning Progression
This part assumes understanding of:
- Decorator syntax and types (from Part 1)
- Metadata operations using reflect-metadata (from Part 2)
- Basic TypeScript type system and generics

## Decorator-Metadata Integration

### Basic Decorator-Metadata Pattern

```typescript
import 'reflect-metadata';

// Decorator stores metadata, business logic reads it
function Required(target: any, propertyKey: string) {
  Reflect.defineMetadata('validation:required', true, target, propertyKey);
}

function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('validation:minLength', length, target, propertyKey);
  };
}

// Usage: Decorators store metadata
class User {
  @Required
  @MinLength(2)
  name: string = '';
  
  @Required
  email: string = '';
}

// Business logic: Metadata drives validation
function validate(instance: any): ValidationResult {
  const errors: string[] = [];
  const target = instance.constructor.prototype;
  
  for (const propertyName of Object.getOwnPropertyNames(target)) {
    if (propertyName === 'constructor') continue;
    
    const value = instance[propertyName];
    const isRequired = Reflect.getMetadata('validation:required', target, propertyName);
    const minLength = Reflect.getMetadata('validation:minLength', target, propertyName);
    
    if (isRequired && (value === undefined || value === null || value === '')) {
      errors.push(`${propertyName} is required`);
    }
    
    if (minLength && typeof value === 'string' && value.length < minLength) {
      errors.push(`${propertyName} must be at least ${minLength} characters`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Demo
const user = new User();
user.name = 'A'; // Too short
// user.email is missing

const result = validate(user);
console.log(result.valid); // false
console.log(result.errors); // ['email is required', 'name must be at least 2 characters']
```

### Advanced Decorator Factories

```typescript
import 'reflect-metadata';

// Complex decorator with multiple configuration options
interface ColumnOptions {
  type?: string;
  length?: number;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary?: boolean;
  generated?: boolean;
}

function Column(options: ColumnOptions = {}) {
  return function (target: any, propertyKey: string) {
    // Store comprehensive column metadata
    const columnInfo = {
      type: options.type || 'varchar',
      length: options.length,
      nullable: options.nullable ?? true,
      unique: options.unique ?? false,
      default: options.default,
      primary: options.primary ?? false,
      generated: options.generated ?? false,
      propertyName: propertyKey
    };
    
    Reflect.defineMetadata('orm:column', columnInfo, target, propertyKey);
    
    // Also maintain a list of all columns on the class
    const existingColumns: string[] = Reflect.getMetadata('orm:columns', target.constructor) || [];
    if (!existingColumns.includes(propertyKey)) {
      existingColumns.push(propertyKey);
      Reflect.defineMetadata('orm:columns', existingColumns, target.constructor);
    }
  };
}

function Table(name: string) {
  return function <T extends new(...args: any[]) => {}>(constructor: T) {
    Reflect.defineMetadata('orm:table', name, constructor);
    return constructor;
  };
}

// Usage
@Table('users')
class User {
  @Column({ type: 'int', primary: true, generated: true })
  id: number = 0;
  
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string = '';
  
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string = '';
  
  @Column({ type: 'timestamp', default: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

// Business logic: Generate SQL from metadata
function generateCreateTableSQL(entityClass: any): string {
  const tableName = Reflect.getMetadata('orm:table', entityClass);
  const columns: string[] = Reflect.getMetadata('orm:columns', entityClass) || [];
  
  if (!tableName) {
    throw new Error('No table metadata found');
  }
  
  const columnDefinitions: string[] = [];
  
  for (const columnName of columns) {
    const columnInfo = Reflect.getMetadata('orm:column', entityClass.prototype, columnName);
    if (!columnInfo) continue;
    
    let definition = `${columnName} ${columnInfo.type.toUpperCase()}`;
    
    if (columnInfo.length) {
      definition += `(${columnInfo.length})`;
    }
    
    if (!columnInfo.nullable) {
      definition += ' NOT NULL';
    }
    
    if (columnInfo.unique) {
      definition += ' UNIQUE';
    }
    
    if (columnInfo.primary) {
      definition += ' PRIMARY KEY';
    }
    
    if (columnInfo.generated) {
      definition += ' AUTO_INCREMENT';
    }
    
    if (columnInfo.default !== undefined) {
      definition += ` DEFAULT ${columnInfo.default}`;
    }
    
    columnDefinitions.push(definition);
  }
  
  return `CREATE TABLE ${tableName} (\n  ${columnDefinitions.join(',\n  ')}\n);`;
}

// Demo
const sql = generateCreateTableSQL(User);
console.log(sql);
// CREATE TABLE users (
//   id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
//   name VARCHAR(100) NOT NULL,
//   email VARCHAR(255) UNIQUE,
//   createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
```

## Building Decorator-Driven Systems

### Configuration Management System

```typescript
import 'reflect-metadata';

interface ConfigPropertyMetadata {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  default?: any;
  description?: string;
  validation?: (value: any) => boolean | string;
}

function ConfigProperty(options: Omit<ConfigPropertyMetadata, 'key'> & { key?: string }) {
  return function (target: any, propertyKey: string) {
    const metadata: ConfigPropertyMetadata = {
      key: options.key || propertyKey,
      type: options.type,
      required: options.required ?? false,
      default: options.default,
      description: options.description,
      validation: options.validation
    };
    
    Reflect.defineMetadata('config:property', metadata, target, propertyKey);
  };
}

function Configuration(prefix?: string) {
  return function <T extends new(...args: any[]) => {}>(constructor: T) {
    Reflect.defineMetadata('config:prefix', prefix || '', constructor);
    return constructor;
  };
}

// Configuration class with decorators
@Configuration('database')
class DatabaseConfig {
  @ConfigProperty({
    type: 'string',
    required: true,
    description: 'Database host address'
  })
  host: string = 'localhost';
  
  @ConfigProperty({
    type: 'number',
    default: 5432,
    validation: (port) => port > 0 && port < 65536 || 'Port must be between 1 and 65535'
  })
  port: number = 5432;
  
  @ConfigProperty({
    key: 'db_name',
    type: 'string',
    required: true
  })
  database: string = '';
  
  @ConfigProperty({
    type: 'boolean',
    default: false
  })
  ssl: boolean = false;
}

// Configuration loader that uses metadata
class ConfigLoader {
  static load<T>(ConfigClass: new() => T, source: Record<string, any> = process.env): T {
    const instance = new ConfigClass();
    const prefix = Reflect.getMetadata('config:prefix', ConfigClass);
    const errors: string[] = [];
    
    // Get all property names
    const propertyNames = Object.getOwnPropertyNames(ConfigClass.prototype);
    
    for (const propertyName of propertyNames) {
      if (propertyName === 'constructor') continue;
      
      const metadata: ConfigPropertyMetadata = Reflect.getMetadata(
        'config:property',
        ConfigClass.prototype,
        propertyName
      );
      
      if (!metadata) continue;
      
      const configKey = prefix ? `${prefix.toUpperCase()}_${metadata.key.toUpperCase()}` : metadata.key.toUpperCase();
      let value = source[configKey];
      
      // Type conversion and validation logic...
      // (Implementation details omitted for brevity)
      
      if (value !== undefined) {
        (instance as any)[propertyName] = value;
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }
    
    return instance;
  }
}
```

## Validation System with Decorators

### Comprehensive Validation Framework

```typescript
import 'reflect-metadata';

interface ValidationRule {
  type: string;
  message?: string;
  value?: any;
  condition?: (target: any) => boolean;
}

// Validation decorators
function Required(message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: 'required',
      message: message || `${propertyKey} is required`
    });
  };
}

function MinLength(length: number, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: 'minLength',
      value: length,
      message: message || `${propertyKey} must be at least ${length} characters`
    });
  };
}

function Email(message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: 'email',
      message: message || `${propertyKey} must be a valid email address`
    });
  };
}

function Custom(validator: (value: any, target: any) => boolean | string, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: 'custom',
      value: validator,
      message: message || `${propertyKey} validation failed`
    });
  };
}

// Helper function to add validation rules
function addValidationRule(target: any, propertyKey: string, rule: ValidationRule) {
  const existingRules: ValidationRule[] = Reflect.getMetadata('validation:rules', target, propertyKey) || [];
  existingRules.push(rule);
  Reflect.defineMetadata('validation:rules', existingRules, target, propertyKey);
}

// Validator class
class Validator {
  static validate(instance: any): ValidationResult {
    const errors: ValidationError[] = [];
    const target = instance.constructor.prototype;
    const propertyNames = Object.getOwnPropertyNames(target);
    
    for (const propertyName of propertyNames) {
      if (propertyName === 'constructor') continue;
      
      const rules: ValidationRule[] = Reflect.getMetadata('validation:rules', target, propertyName) || [];
      const value = instance[propertyName];
      
      for (const rule of rules) {
        if (rule.condition && !rule.condition(instance)) {
          continue;
        }
        
        const isValid = this.validateRule(value, rule, instance);
        
        if (!isValid) {
          errors.push({
            property: propertyName,
            message: rule.message || `Validation failed for ${propertyName}`,
            value
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private static validateRule(value: any, rule: ValidationRule, target: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
        
      case 'minLength':
        return typeof value === 'string' && value.length >= rule.value;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === 'string' && emailRegex.test(value);
        
      case 'custom':
        const result = rule.value(value, target);
        return result === true;
        
      default:
        return true;
    }
  }
}

interface ValidationError {
  property: string;
  message: string;
  value: any;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

## HTTP Routing Systems

### Building Route Decorators

```typescript
import 'reflect-metadata';

interface RouteMetadata {
  method: string;
  path: string;
  middleware?: Function[];
  description?: string;
}

// HTTP method decorators
function Get(path: string = '/') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('route:metadata', {
      method: 'GET',
      path,
    }, target, propertyKey);
  };
}

function Post(path: string = '/') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('route:metadata', {
      method: 'POST',
      path,
    }, target, propertyKey);
  };
}

function Controller(basePath: string = '') {
  return function <T extends new(...args: any[]) => {}>(constructor: T) {
    Reflect.defineMetadata('controller:basePath', basePath, constructor);
    return constructor;
  };
}

// Usage
@Controller('/users')
class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }
  
  @Get('/:id')
  getUserById() {
    return { user: {} };
  }
  
  @Post('/')
  createUser() {
    return { success: true };
  }
}

// Route registration system
function registerRoutes(controllerClass: any, app: any) {
  const basePath = Reflect.getMetadata('controller:basePath', controllerClass) || '';
  const prototype = controllerClass.prototype;
  const methodNames = Object.getOwnPropertyNames(prototype);
  
  for (const methodName of methodNames) {
    if (methodName === 'constructor') continue;
    
    const routeMetadata: RouteMetadata = Reflect.getMetadata('route:metadata', prototype, methodName);
    if (routeMetadata) {
      const fullPath = basePath + routeMetadata.path;
      const handler = prototype[methodName];
      
      // Register route with express-like framework
      app[routeMetadata.method.toLowerCase()](fullPath, handler);
      
      console.log(`Registered ${routeMetadata.method} ${fullPath} -> ${controllerClass.name}.${methodName}`);
    }
  }
}
```

## Performance Optimization Patterns

### Metadata Caching and Optimization

```typescript
import 'reflect-metadata';

// Performance monitoring for metadata operations
class MetadataPerformanceMonitor {
  private static metrics = new Map<string, {
    calls: number;
    totalTime: number;
    averageTime: number;
    lastCall: number;
  }>();
  
  static measure<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    const existing = this.metrics.get(operation) || {
      calls: 0,
      totalTime: 0,
      averageTime: 0,
      lastCall: 0
    };
    
    existing.calls++;
    existing.totalTime += duration;
    existing.averageTime = existing.totalTime / existing.calls;
    existing.lastCall = end;
    
    this.metrics.set(operation, existing);
    
    return result;
  }
  
  static getMetrics(): Map<string, any> {
    return new Map(this.metrics);
  }
}

// Optimized metadata cache with LRU eviction
class OptimizedMetadataCache {
  private cache = new Map<string, { value: any; timestamp: number; hits: number }>();
  private maxSize: number;
  private ttl: number;
  
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get<T>(key: string, factory: () => T): T {
    return MetadataPerformanceMonitor.measure(`cache.get.${key}`, () => {
      const now = Date.now();
      const cached = this.cache.get(key);
      
      // Check if cached value exists and is not expired
      if (cached && (now - cached.timestamp) < this.ttl) {
        cached.hits++;
        cached.timestamp = now; // Update access time
        return cached.value;
      }
      
      // Generate new value
      const value = MetadataPerformanceMonitor.measure(`factory.${key}`, factory);
      
      // Add to cache
      this.set(key, value);
      
      return value;
    });
  }
  
  private set(key: string, value: any): void {
    const now = Date.now();
    
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, { value, timestamp: now, hits: 1 });
  }
  
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Infinity;
    let lruHits = Infinity;
    
    for (const [key, entry] of this.cache) {
      // Evict based on least recently used and least hits
      if (entry.timestamp < lruTime || (entry.timestamp === lruTime && entry.hits < lruHits)) {
        lruKey = key;
        lruTime = entry.timestamp;
        lruHits = entry.hits;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}
```

## Advanced Metadata Inheritance

### Complex Inheritance Patterns

```typescript
import 'reflect-metadata';

// Advanced metadata inheritance utilities
class MetadataInheritanceManager {
  private static cache = new Map<string, any>();
  
  // Get metadata with inheritance, using merge strategies
  static getInheritedMetadata<T>(
    key: string,
    target: any,
    propertyKey?: string,
    strategy: 'override' | 'merge' | 'concat' = 'override'
  ): T | undefined {
    const cacheKey = `${key}:${target.name}:${propertyKey || 'class'}:${strategy}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const result = this.collectInheritedMetadata(key, target, propertyKey, strategy);
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private static collectInheritedMetadata<T>(
    key: string,
    target: any,
    propertyKey?: string,
    strategy: 'override' | 'merge' | 'concat' = 'override'
  ): T | undefined {
    const chain: any[] = [];
    let currentTarget = target;
    
    // Collect inheritance chain
    while (currentTarget && currentTarget !== Object.prototype) {
      const metadata = Reflect.getOwnMetadata(key, currentTarget, propertyKey);
      if (metadata !== undefined) {
        chain.push(metadata);
      }
      currentTarget = Object.getPrototypeOf(currentTarget);
    }
    
    if (chain.length === 0) return undefined;
    if (chain.length === 1) return chain[0];
    
    // Apply merge strategy
    switch (strategy) {
      case 'override':
        return chain[0]; // Child overrides parent
        
      case 'merge':
        return chain.reduceRight((acc, current) => ({ ...acc, ...current }));
        
      case 'concat':
        return chain.reduceRight((acc, current) => [...acc, ...current], []);
        
      default:
        return chain[0];
    }
  }
  
  // Clear cache when needed
  static clearCache(): void {
    this.cache.clear();
  }
}

// Example usage with inheritance
class BaseEntity {
  @Column({ nullable: false })
  id: number = 0;
  
  @Column({ type: 'datetime', default: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string = '';
  
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string = '';
}

// Get all column metadata including inherited
const allColumns = MetadataInheritanceManager.getInheritedMetadata('orm:columns', User, undefined, 'concat');
// Returns columns from both User and BaseEntity
```

## Best Practices

### Design Principles

1. **Single Responsibility**: Each decorator should have one clear purpose
2. **Composability**: Decorators should work well together
3. **Performance**: Minimize runtime overhead in decorator execution
4. **Type Safety**: Preserve and enhance TypeScript type information

### Metadata Management

1. **Namespace Keys**: Use prefixed keys like `'validation:required'`
2. **Avoid Collisions**: Use unique prefixes for different systems
3. **Document Schema**: Keep track of metadata structure and meaning
4. **Validate Data**: Validate metadata before using it

### Integration Patterns

1. **Separation of Concerns**: Keep decorator logic separate from business logic
2. **Error Handling**: Provide meaningful error messages and fallbacks
3. **Performance**: Cache metadata lookups for better performance
4. **Extensibility**: Design systems to be easily extended

### Common Pitfalls

1. **Metadata Timing Issues**: Ensure decorators execute before accessing metadata
2. **Type Information Loss**: Use proper type annotations and generic constraints
3. **Performance Issues**: Implement caching and lazy loading strategies
4. **Complex Dependencies**: Use dependency injection patterns and lifecycle management

---

## Next Steps

After mastering these integration concepts, next steps include:

1. **Practice with Exercises**: Apply these patterns in hands-on exercises
2. **Build Real Applications**: Create production-ready metadata-driven systems
3. **Contribute to Frameworks**: Understand and contribute to existing frameworks
4. **Design Your Own**: Create new decorator-based APIs and frameworks