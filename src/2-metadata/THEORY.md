# Part 2: Metadata Theory and Concepts

## Table of Contents
1. [Understanding Metadata](#understanding-metadata)
2. [Class vs Instance Metadata](#class-vs-instance-metadata)
3. [Metadata Keys and Design](#metadata-keys-and-design)
4. [Metadata Storage Patterns](#metadata-storage-patterns)
5. [Metadata Inheritance](#metadata-inheritance)
6. [Performance Considerations](#performance-considerations)

## Understanding Metadata

Metadata is "data about data" - information that describes other data. In TypeScript, metadata allows us to attach additional information to classes, methods, properties, and parameters at design time, which can then be accessed at runtime.

### What is Metadata?
```typescript
// Conceptual example - metadata attached to class elements
class User {
  // Metadata could describe that 'name' is a string column with max length 100
  name: string;
  
  // Metadata could describe that 'email' is a unique string column
  email: string;
  
  // Metadata could describe method parameters and return types
  updateProfile(data: UserData): Promise<void> {}
}
```

### Why Use Metadata?
- **Runtime Introspection**: Examine type and structure information at runtime
- **Framework Integration**: Enable libraries to understand your code structure
- **Configuration Storage**: Attach configuration data to classes and methods
- **Type Safety**: Bridge compile-time types with runtime behavior

## Class vs Instance Metadata

Understanding the difference between class-level and instance-level metadata is crucial.

### Class Metadata
Stored on the constructor function, shared across all instances:

```typescript
import 'reflect-metadata';

class UserClass {
  name: string = '';
  email: string = '';
}

// Set class-level metadata
Reflect.defineMetadata('table:name', 'users', UserClass);
Reflect.defineMetadata('table:schema', 'public', UserClass);

// Get class metadata
const tableName = Reflect.getMetadata('table:name', UserClass);
const schema = Reflect.getMetadata('table:schema', UserClass);

console.log(tableName); // 'users'
console.log(schema);    // 'public'

// All instances share the same class metadata
const user1 = new UserClass();
const user2 = new UserClass();

// Both instances belong to the same 'users' table
const table1 = Reflect.getMetadata('table:name', user1.constructor);
const table2 = Reflect.getMetadata('table:name', user2.constructor);

console.log(table1 === table2); // true
```

### Instance Metadata
Stored on individual instances, unique per object:

```typescript
import 'reflect-metadata';

class Document {
  title: string;
  
  constructor(title: string) {
    this.title = title;
  }
}

// Create instances
const doc1 = new Document('Document 1');
const doc2 = new Document('Document 2');

// Set instance-specific metadata
Reflect.defineMetadata('created:at', new Date(), doc1);
Reflect.defineMetadata('instance:id', Math.random().toString(36), doc1);

Reflect.defineMetadata('created:at', new Date(), doc2);
Reflect.defineMetadata('instance:id', Math.random().toString(36), doc2);

// Each instance has its own metadata
const doc1Created = Reflect.getMetadata('created:at', doc1);
const doc2Created = Reflect.getMetadata('created:at', doc2);
const doc1Id = Reflect.getMetadata('instance:id', doc1);
const doc2Id = Reflect.getMetadata('instance:id', doc2);

console.log(doc1Created !== doc2Created); // true
console.log(doc1Id !== doc2Id); // true
```

### Property Metadata
Stored on the prototype, describes class properties:

```typescript
import 'reflect-metadata';

class Product {
  name: string = '';
  price: number = 0;
  category: string = '';
}

// Set property metadata
Reflect.defineMetadata('type', 'string', Product.prototype, 'name');
Reflect.defineMetadata('required', true, Product.prototype, 'name');

Reflect.defineMetadata('type', 'number', Product.prototype, 'price');
Reflect.defineMetadata('min', 0, Product.prototype, 'price');

Reflect.defineMetadata('type', 'string', Product.prototype, 'category');
Reflect.defineMetadata('enum', ['electronics', 'books', 'clothing'], Product.prototype, 'category');

// Get property metadata
const nameType = Reflect.getMetadata('type', Product.prototype, 'name');
const nameRequired = Reflect.getMetadata('required', Product.prototype, 'name');
const priceMin = Reflect.getMetadata('min', Product.prototype, 'price');
const categoryEnum = Reflect.getMetadata('enum', Product.prototype, 'category');

console.log(nameType);     // 'string'
console.log(nameRequired); // true
console.log(priceMin);     // 0
console.log(categoryEnum); // ['electronics', 'books', 'clothing']
```

## Metadata Keys and Design

Designing good metadata keys is essential for maintainable systems.

### Key Naming Conventions
```typescript
// Use namespaced keys to avoid conflicts
const METADATA_KEYS = {
  // Type information
  TYPE: 'type:design',
  PARAM_TYPES: 'type:params',
  RETURN_TYPE: 'type:return',
  
  // Validation metadata
  VALIDATION_RULES: 'validation:rules',
  VALIDATION_REQUIRED: 'validation:required',
  VALIDATION_TYPE: 'validation:type',
  
  // Configuration metadata
  CONFIG_KEY: 'config:key',
  CONFIG_DEFAULT: 'config:default',
  CONFIG_REQUIRED: 'config:required',
  
  // Custom application metadata
  APP_PERMISSIONS: 'app:permissions',
  APP_CACHE_TTL: 'app:cache:ttl',
  APP_ROUTE_INFO: 'app:route:info'
};
```

### Structured Metadata Values
```typescript
// Use interfaces to define metadata structure
interface ValidationMetadata {
  required: boolean;
  type: string;
  rules: ValidationRule[];
}

interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message?: string;
}

interface ConfigMetadata {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  default?: any;
  required: boolean;
  description?: string;
}

// Store structured data
const validationMeta: ValidationMetadata = {
  required: true,
  type: 'string',
  rules: [
    { type: 'min', value: 2, message: 'Too short' },
    { type: 'max', value: 50, message: 'Too long' }
  ]
};

Reflect.defineMetadata(METADATA_KEYS.VALIDATION_RULES, validationMeta, target, propertyKey);
```

### Metadata Aggregation Utilities
```typescript
// Helper function to collect all metadata of a specific type
function getPropertiesMetadata<T>(
  target: any,
  metadataKey: string
): Map<string, T> {
  const properties = new Map<string, T>();
  
  // Get all property names from prototype
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') continue;
    
    const metadata = Reflect.getMetadata(metadataKey, target.prototype, propertyName);
    if (metadata) {
      properties.set(propertyName, metadata);
    }
  }
  
  return properties;
}

// Usage
class User {
  name: string = '';
  email: string = '';
  age: number = 0;
}

// Set metadata
Reflect.defineMetadata('column:type', 'varchar', User.prototype, 'name');
Reflect.defineMetadata('column:type', 'varchar', User.prototype, 'email');
Reflect.defineMetadata('column:type', 'integer', User.prototype, 'age');

// Get all column metadata
const columnMetadata = getPropertiesMetadata<string>(User, 'column:type');
console.log(columnMetadata);
// Map {
//   'name' => 'varchar',
//   'email' => 'varchar',
//   'age' => 'integer'
// }
```

## Metadata Storage Patterns

### Simple Key-Value Storage
```typescript
import 'reflect-metadata';

class SimpleMetadataStore {
  static set(key: string, value: any, target: any, propertyKey?: string): void {
    Reflect.defineMetadata(key, value, target, propertyKey);
  }
  
  static get<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
    return Reflect.getMetadata(key, target, propertyKey);
  }
  
  static has(key: string, target: any, propertyKey?: string): boolean {
    return Reflect.hasMetadata(key, target, propertyKey);
  }
  
  static delete(key: string, target: any, propertyKey?: string): boolean {
    return Reflect.deleteMetadata(key, target, propertyKey);
  }
  
  static getKeys(target: any, propertyKey?: string): any[] {
    return Reflect.getMetadataKeys(target, propertyKey);
  }
}

// Usage
class Example {
  property: string = '';
}

SimpleMetadataStore.set('custom:data', { value: 'test' }, Example);
SimpleMetadataStore.set('prop:info', { type: 'string' }, Example.prototype, 'property');

const classData = SimpleMetadataStore.get('custom:data', Example);
const propInfo = SimpleMetadataStore.get('prop:info', Example.prototype, 'property');

console.log(classData);  // { value: 'test' }
console.log(propInfo);   // { type: 'string' }
```

### Array-Based Metadata Storage
```typescript
import 'reflect-metadata';

class ArrayMetadataStore {
  static push<T>(key: string, item: T, target: any, propertyKey?: string): void {
    const existing: T[] = Reflect.getMetadata(key, target, propertyKey) || [];
    existing.push(item);
    Reflect.defineMetadata(key, existing, target, propertyKey);
  }
  
  static getArray<T>(key: string, target: any, propertyKey?: string): T[] {
    return Reflect.getMetadata(key, target, propertyKey) || [];
  }
  
  static remove<T>(key: string, item: T, target: any, propertyKey?: string): boolean {
    const existing: T[] = Reflect.getMetadata(key, target, propertyKey) || [];
    const index = existing.indexOf(item);
    
    if (index > -1) {
      existing.splice(index, 1);
      Reflect.defineMetadata(key, existing, target, propertyKey);
      return true;
    }
    
    return false;
  }
}

// Usage
class ValidationExample {
  property: string = '';
}

ArrayMetadataStore.push('validation:rules', { type: 'required' }, ValidationExample.prototype, 'property');
ArrayMetadataStore.push('validation:rules', { type: 'minLength', value: 2 }, ValidationExample.prototype, 'property');

const rules = ArrayMetadataStore.getArray('validation:rules', ValidationExample.prototype, 'property');
console.log(rules);
// [
//   { type: 'required' },
//   { type: 'minLength', value: 2 }
// ]
```

### Map-Based Metadata Storage
```typescript
import 'reflect-metadata';

class MapMetadataStore {
  static setMap<K, V>(key: string, mapKey: K, value: V, target: any, propertyKey?: string): void {
    const map: Map<K, V> = Reflect.getMetadata(key, target, propertyKey) || new Map();
    map.set(mapKey, value);
    Reflect.defineMetadata(key, map, target, propertyKey);
  }
  
  static getFromMap<K, V>(key: string, mapKey: K, target: any, propertyKey?: string): V | undefined {
    const map: Map<K, V> = Reflect.getMetadata(key, target, propertyKey);
    return map?.get(mapKey);
  }
  
  static getMap<K, V>(key: string, target: any, propertyKey?: string): Map<K, V> {
    return Reflect.getMetadata(key, target, propertyKey) || new Map();
  }
  
  static hasInMap<K>(key: string, mapKey: K, target: any, propertyKey?: string): boolean {
    const map: Map<K, any> = Reflect.getMetadata(key, target, propertyKey);
    return map?.has(mapKey) || false;
  }
}

// Usage
class ConfigExample {
  property: string = '';
}

MapMetadataStore.setMap('config:options', 'type', 'string', ConfigExample.prototype, 'property');
MapMetadataStore.setMap('config:options', 'required', true, ConfigExample.prototype, 'property');
MapMetadataStore.setMap('config:options', 'default', 'default value', ConfigExample.prototype, 'property');

const configMap = MapMetadataStore.getMap('config:options', ConfigExample.prototype, 'property');
console.log(configMap);
// Map {
//   'type' => 'string',
//   'required' => true,
//   'default' => 'default value'
// }

const isRequired = MapMetadataStore.getFromMap('config:options', 'required', ConfigExample.prototype, 'property');
console.log(isRequired); // true
```

## Metadata Inheritance

Understanding how metadata behaves with class inheritance.

### Basic Inheritance Behavior
```typescript
import 'reflect-metadata';

class BaseEntity {
  id: number = 0;
  createdAt: Date = new Date();
}

// Set metadata on base class
Reflect.defineMetadata('entity:table', 'base_entities', BaseEntity);
Reflect.defineMetadata('column:type', 'integer', BaseEntity.prototype, 'id');
Reflect.defineMetadata('column:type', 'datetime', BaseEntity.prototype, 'createdAt');

class User extends BaseEntity {
  name: string = '';
  email: string = '';
}

// Set metadata on derived class
Reflect.defineMetadata('entity:table', 'users', User);
Reflect.defineMetadata('column:type', 'varchar', User.prototype, 'name');
Reflect.defineMetadata('column:type', 'varchar', User.prototype, 'email');

// Get metadata with inheritance (includes parent metadata)
const userIdType = Reflect.getMetadata('column:type', User.prototype, 'id');
console.log(userIdType); // 'integer' (inherited from BaseEntity)

const userTable = Reflect.getMetadata('entity:table', User);
console.log(userTable); // 'users' (overrides BaseEntity)

// Get own metadata only (excludes parent metadata)
const userOwnIdType = Reflect.getOwnMetadata('column:type', User.prototype, 'id');
console.log(userOwnIdType); // undefined (not defined on User directly)

const userOwnTable = Reflect.getOwnMetadata('entity:table', User);
console.log(userOwnTable); // 'users' (defined on User)
```

### Collecting Inherited Metadata
```typescript
import 'reflect-metadata';

function getAllPropertyMetadata<T>(
  target: any,
  metadataKey: string
): Map<string, T> {
  const metadata = new Map<string, T>();
  let currentTarget = target.prototype || target;
  
  while (currentTarget && currentTarget !== Object.prototype) {
    const propertyNames = Object.getOwnPropertyNames(currentTarget);
    
    for (const propertyName of propertyNames) {
      if (propertyName === 'constructor') continue;
      
      // Only add if not already collected (child takes precedence)
      if (!metadata.has(propertyName)) {
        const propMetadata = Reflect.getOwnMetadata(metadataKey, currentTarget, propertyName);
        if (propMetadata !== undefined) {
          metadata.set(propertyName, propMetadata);
        }
      }
    }
    
    currentTarget = Object.getPrototypeOf(currentTarget);
  }
  
  return metadata;
}

// Usage with inheritance
class BaseUser {
  id: number = 0;
  createdAt: Date = new Date();
}

class AdminUser extends BaseUser {
  role: string = 'admin';
  permissions: string[] = [];
}

// Set metadata
Reflect.defineMetadata('column', { type: 'int', primary: true }, BaseUser.prototype, 'id');
Reflect.defineMetadata('column', { type: 'datetime' }, BaseUser.prototype, 'createdAt');
Reflect.defineMetadata('column', { type: 'varchar' }, AdminUser.prototype, 'role');
Reflect.defineMetadata('column', { type: 'json' }, AdminUser.prototype, 'permissions');

// Get all column metadata including inherited
const allColumns = getAllPropertyMetadata(AdminUser, 'column');
console.log(allColumns);
// Map {
//   'role' => { type: 'varchar' },
//   'permissions' => { type: 'json' },
//   'id' => { type: 'int', primary: true },
//   'createdAt' => { type: 'datetime' }
// }
```

## Performance Considerations

Metadata operations can impact performance if not used carefully.

### Metadata Caching
```typescript
import 'reflect-metadata';

class MetadataCache {
  private static cache = new Map<string, any>();
  
  static getMetadata<T = any>(
    key: string,
    target: any,
    propertyKey?: string
  ): T | undefined {
    const cacheKey = this.generateCacheKey(key, target, propertyKey);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const metadata = Reflect.getMetadata(key, target, propertyKey);
    this.cache.set(cacheKey, metadata);
    
    return metadata;
  }
  
  private static generateCacheKey(
    key: string,
    target: any,
    propertyKey?: string
  ): string {
    const targetName = target.name || target.constructor?.name || 'unknown';
    return `${key}:${targetName}:${propertyKey || 'class'}`;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
  
  static getCacheSize(): number {
    return this.cache.size;
  }
}
```

### Lazy Metadata Loading
```typescript
import 'reflect-metadata';

class LazyMetadataLoader {
  private static loaded = new Set<string>();
  
  static ensureLoaded(target: any, loader: () => void): void {
    const key = target.name || target.constructor?.name || 'unknown';
    
    if (this.loaded.has(key)) {
      return; // Already loaded
    }
    
    loader();
    this.loaded.add(key);
  }
  
  static isLoaded(target: any): boolean {
    const key = target.name || target.constructor?.name || 'unknown';
    return this.loaded.has(key);
  }
}

// Usage
class LazyExample {
  property: string = '';
}

function loadLazyMetadata(): void {
  // Expensive metadata setup
  console.log('Loading metadata for LazyExample...');
  Reflect.defineMetadata('lazy:data', { expensive: 'computation' }, LazyExample);
}

// Metadata is only loaded when first accessed
LazyMetadataLoader.ensureLoaded(LazyExample, loadLazyMetadata);

const metadata = Reflect.getMetadata('lazy:data', LazyExample);
console.log(metadata); // { expensive: 'computation' }

// Subsequent calls don't reload
LazyMetadataLoader.ensureLoaded(LazyExample, loadLazyMetadata); // No output
```

### Memory Optimization
```typescript
import 'reflect-metadata';

class MetadataMemoryManager {
  private static readonly MAX_CACHE_SIZE = 1000;
  private static cache = new Map<string, { value: any; timestamp: number; hits: number }>();
  
  static getOptimizedMetadata<T = any>(
    key: string,
    target: any,
    propertyKey?: string
  ): T | undefined {
    const cacheKey = this.generateKey(key, target, propertyKey);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      cached.hits++;
      cached.timestamp = Date.now();
      return cached.value;
    }
    
    const metadata = Reflect.getMetadata(key, target, propertyKey);
    
    if (metadata !== undefined) {
      this.addToCache(cacheKey, metadata);
    }
    
    return metadata;
  }
  
  private static addToCache(key: string, value: any): void {
    // Clean up if cache is too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 1
    });
  }
  
  private static evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.hits < leastHits || (entry.hits === leastHits && entry.timestamp < oldestTime)) {
        leastUsedKey = key;
        leastHits = entry.hits;
        oldestTime = entry.timestamp;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
  
  private static generateKey(key: string, target: any, propertyKey?: string): string {
    const targetName = target.name || target.constructor?.name || 'unknown';
    return `${key}:${targetName}:${propertyKey || 'class'}`;
  }
  
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}
```

## Best Practices

### Key Management
1. **Namespace Your Keys**: Use prefixed keys like `'validation:required'`
2. **Avoid Collisions**: Use unique prefixes for different libraries/modules
3. **Document Schema**: Keep track of what metadata keys mean and their expected values

### Performance
1. **Cache Lookups**: Cache expensive metadata operations for better performance
2. **Lazy Loading**: Load metadata only when needed
3. **Batch Operations**: Group multiple metadata operations when possible
4. **Monitor Usage**: Track metadata access patterns in production

### Error Handling
1. **Validate Metadata**: Check that expected metadata exists before using it
2. **Provide Defaults**: Have sensible fallbacks when metadata is missing
3. **Handle Edge Cases**: Consider null, undefined, and unexpected value types
4. **Graceful Degradation**: Design systems to work even when metadata is missing

## Common Pitfalls

### 1. Wrong Target for Metadata
**Problem**: Metadata not found when expected
**Solution**: Understand the difference between:
- `target` (constructor for class metadata)
- `target.prototype` (prototype for property metadata)
- `instance` (specific object instance)

### 2. Metadata Timing Issues
**Problem**: Metadata not available when expected
**Solution**: Ensure decorators have executed before accessing metadata

### 3. Key Collisions
**Problem**: Different libraries overwriting each other's metadata
**Solution**: Use namespaced keys and proper key management

### 4. Performance Issues
**Problem**: Slow metadata lookups in production
**Solution**: Implement caching and lazy loading strategies

---

## Next Steps

After mastering these metadata fundamentals, next steps include:

1. **Practice with Exercises**: Apply these concepts in hands-on exercises
2. **Learn API Details**: Use the API reference for implementation
3. **Build Integration**: Proceed to Part 3 for decorator-metadata integration
4. **Create Systems**: Build validation, ORM, and DI systems using metadata