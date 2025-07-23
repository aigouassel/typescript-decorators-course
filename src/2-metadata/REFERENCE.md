# Part 2: Metadata API Reference

This reference covers the metadata APIs available in TypeScript. For complete documentation, see the [reflect-metadata GitHub repository](https://github.com/rbuckton/reflect-metadata).

## Setup

```bash
yarn add reflect-metadata
```

```typescript
import 'reflect-metadata';
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Core Reflect Metadata API

### Basic Operations

#### `Reflect.defineMetadata(key, value, target, propertyKey?)`
Store metadata on a target object.

```typescript
// Class metadata
Reflect.defineMetadata('table:name', 'users', UserClass);

// Property metadata  
Reflect.defineMetadata('column:type', 'varchar', UserClass.prototype, 'name');

// Method metadata
Reflect.defineMetadata('route:method', 'GET', UserController.prototype, 'getUser');
```

#### `Reflect.getMetadata(key, target, propertyKey?)`
Retrieve metadata (includes inherited metadata).

```typescript
const tableName = Reflect.getMetadata('table:name', UserClass);
const columnType = Reflect.getMetadata('column:type', UserClass.prototype, 'name');
```

#### `Reflect.hasMetadata(key, target, propertyKey?)`
Check if metadata exists (includes inherited metadata).

```typescript
const hasTable = Reflect.hasMetadata('table:name', UserClass);
const hasColumn = Reflect.hasMetadata('column:type', UserClass.prototype, 'name');
```

#### `Reflect.deleteMetadata(key, target, propertyKey?)`
Remove metadata. Returns `true` if metadata was deleted.

```typescript
const deleted = Reflect.deleteMetadata('table:name', UserClass);
```

### Key Management

#### `Reflect.getMetadataKeys(target, propertyKey?)`
Get all metadata keys (includes inherited keys).

```typescript
const classKeys = Reflect.getMetadataKeys(UserClass);
const propertyKeys = Reflect.getMetadataKeys(UserClass.prototype, 'name');
```

#### `Reflect.getOwnMetadataKeys(target, propertyKey?)`
Get own metadata keys (excludes inherited keys).

```typescript
const ownKeys = Reflect.getOwnMetadataKeys(UserClass);
```

### Inheritance-Aware Operations

#### `Reflect.getOwnMetadata(key, target, propertyKey?)`
Get metadata without inheritance.

```typescript
const ownMetadata = Reflect.getOwnMetadata('table:name', UserClass);
```

#### `Reflect.hasOwnMetadata(key, target, propertyKey?)`
Check metadata existence without inheritance.

```typescript
const hasOwn = Reflect.hasOwnMetadata('table:name', UserClass);
```

## TypeScript Design-Time Types

When `emitDecoratorMetadata: true` is enabled, TypeScript automatically emits type metadata.

### Property Types

#### `design:type`
Get the property type.

```typescript
class User {
  name: string = '';
  age: number = 0;
  active: boolean = true;
  createdAt: Date = new Date();
  tags: string[] = [];
}

const nameType = Reflect.getMetadata('design:type', User.prototype, 'name');
console.log(nameType === String); // true

const ageType = Reflect.getMetadata('design:type', User.prototype, 'age');
console.log(ageType === Number); // true

const activeType = Reflect.getMetadata('design:type', User.prototype, 'active');
console.log(activeType === Boolean); // true

const createdAtType = Reflect.getMetadata('design:type', User.prototype, 'createdAt');
console.log(createdAtType === Date); // true

const tagsType = Reflect.getMetadata('design:type', User.prototype, 'tags');
console.log(tagsType === Array); // true
```

### Method Types

#### `design:paramtypes`
Get method parameter types.

```typescript
class UserService {
  createUser(name: string, age: number, active: boolean): User {
    return new User();
  }
}

const paramTypes = Reflect.getMetadata('design:paramtypes', UserService.prototype, 'createUser');
console.log(paramTypes); // [String, Number, Boolean]
```

#### `design:returntype`
Get method return type.

```typescript
const returnType = Reflect.getMetadata('design:returntype', UserService.prototype, 'createUser');
console.log(returnType === User); // true
```

### Constructor Types

```typescript
class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}
}

const constructorTypes = Reflect.getMetadata('design:paramtypes', UserService);
console.log(constructorTypes); // [UserRepository, Logger]
```

## Common Patterns

### Class Metadata
Store information about the entire class.

```typescript
// Entity configuration
Reflect.defineMetadata('entity:table', 'users', User);
Reflect.defineMetadata('entity:schema', 'public', User);

// Component registration
Reflect.defineMetadata('component:name', 'UserProfile', UserProfileComponent);
```

### Property Metadata
Store information about class properties.

```typescript
// Column definitions
Reflect.defineMetadata('column:type', 'varchar', User.prototype, 'name');
Reflect.defineMetadata('column:length', 100, User.prototype, 'name');
Reflect.defineMetadata('column:nullable', false, User.prototype, 'name');

// Validation rules
Reflect.defineMetadata('validation:required', true, User.prototype, 'email');
Reflect.defineMetadata('validation:pattern', /^[^@]+@[^@]+\.[^@]+$/, User.prototype, 'email');
```

### Method Metadata
Store information about methods.

```typescript
// Route definitions
Reflect.defineMetadata('route:method', 'GET', UserController.prototype, 'getUser');
Reflect.defineMetadata('route:path', '/users/:id', UserController.prototype, 'getUser');

// Caching configuration
Reflect.defineMetadata('cache:ttl', 3600, UserService.prototype, 'getUser');
Reflect.defineMetadata('cache:key', 'user:${id}', UserService.prototype, 'getUser');
```

### Array-Based Metadata
Store multiple values for the same key.

```typescript
// Multiple validation rules
function addValidationRule(target: any, propertyKey: string, rule: any) {
  const existingRules = Reflect.getMetadata('validation:rules', target, propertyKey) || [];
  existingRules.push(rule);
  Reflect.defineMetadata('validation:rules', existingRules, target, propertyKey);
}

addValidationRule(User.prototype, 'name', { type: 'required' });
addValidationRule(User.prototype, 'name', { type: 'minLength', value: 2 });
```

### Map-Based Metadata
Store key-value collections.

```typescript
// Configuration options
function setConfigOption(target: any, propertyKey: string, option: string, value: any) {
  const config = Reflect.getMetadata('config:options', target, propertyKey) || new Map();
  config.set(option, value);
  Reflect.defineMetadata('config:options', config, target, propertyKey);
}

setConfigOption(User.prototype, 'name', 'type', 'string');
setConfigOption(User.prototype, 'name', 'required', true);
setConfigOption(User.prototype, 'name', 'default', '');
```

## Metadata Storage Types

### Target Types
Understanding where metadata is stored:

```typescript
class User {
  name: string = '';
  
  getName(): string {
    return this.name;
  }
}

// Class metadata - stored on constructor
Reflect.defineMetadata('class:info', { table: 'users' }, User);

// Property metadata - stored on prototype
Reflect.defineMetadata('prop:info', { column: 'name' }, User.prototype, 'name');

// Method metadata - stored on prototype
Reflect.defineMetadata('method:info', { cached: true }, User.prototype, 'getName');

// Instance metadata - stored on specific instance
const user = new User();
Reflect.defineMetadata('instance:info', { id: '123' }, user);
```

### Inheritance Behavior

```typescript
class BaseEntity {
  id: number = 0;
}

class User extends BaseEntity {
  name: string = '';
}

// Set metadata on base class
Reflect.defineMetadata('entity:base', true, BaseEntity);
Reflect.defineMetadata('column:primary', true, BaseEntity.prototype, 'id');

// Set metadata on derived class
Reflect.defineMetadata('entity:table', 'users', User);

// getMetadata includes inherited metadata
const isBase = Reflect.getMetadata('entity:base', User); // true (inherited)
const table = Reflect.getMetadata('entity:table', User); // 'users' (own)
const isPrimary = Reflect.getMetadata('column:primary', User.prototype, 'id'); // true (inherited)

// getOwnMetadata excludes inherited metadata
const ownBase = Reflect.getOwnMetadata('entity:base', User); // undefined (not own)
const ownTable = Reflect.getOwnMetadata('entity:table', User); // 'users' (own)
```

## Utility Functions

### Get All Properties with Metadata
```typescript
function getPropertiesWithMetadata<T>(target: any, metadataKey: string): Map<string, T> {
  const result = new Map<string, T>();
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') continue;
    
    const metadata = Reflect.getMetadata(metadataKey, target.prototype, propertyName);
    if (metadata !== undefined) {
      result.set(propertyName, metadata);
    }
  }
  
  return result;
}
```

### Type-Safe Metadata Access
```typescript
interface ColumnMetadata {
  type: string;
  length?: number;
  nullable: boolean;
}

function getColumnMetadata(target: any, propertyKey: string): ColumnMetadata | undefined {
  return Reflect.getMetadata('column:info', target, propertyKey);
}

function setColumnMetadata(target: any, propertyKey: string, metadata: ColumnMetadata): void {
  Reflect.defineMetadata('column:info', metadata, target, propertyKey);
}
```

### Metadata Registry
```typescript
class MetadataRegistry {
  private static registry = new Map<string, any>();
  
  static register<T>(key: string, defaultValue: T): void {
    this.registry.set(key, defaultValue);
  }
  
  static get<T>(key: string, target: any, propertyKey?: string): T {
    const metadata = Reflect.getMetadata(key, target, propertyKey);
    return metadata !== undefined ? metadata : this.registry.get(key);
  }
  
  static has(key: string): boolean {
    return this.registry.has(key);
  }
}

// Usage
MetadataRegistry.register('column:nullable', true);
const nullable = MetadataRegistry.get('column:nullable', User.prototype, 'name'); // true (default)
```

## Performance Considerations

### Caching
```typescript
class MetadataCache {
  private static cache = new Map<string, any>();
  
  static get<T>(key: string, target: any, propertyKey?: string): T | undefined {
    const cacheKey = `${key}:${target.name}:${propertyKey || 'class'}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const metadata = Reflect.getMetadata(key, target, propertyKey);
    this.cache.set(cacheKey, metadata);
    
    return metadata;
  }
}
```

### Batch Operations
```typescript
function setMultipleMetadata(target: any, propertyKey: string | undefined, metadata: Record<string, any>): void {
  for (const [key, value] of Object.entries(metadata)) {
    Reflect.defineMetadata(key, value, target, propertyKey);
  }
}

// Usage
setMultipleMetadata(User.prototype, 'name', {
  'column:type': 'varchar',
  'column:length': 100,
  'column:nullable': false,
  'validation:required': true
});
```

## Error Handling

### Safe Metadata Access
```typescript
function safeGetMetadata<T>(key: string, target: any, propertyKey?: string, defaultValue?: T): T | undefined {
  try {
    const metadata = Reflect.getMetadata(key, target, propertyKey);
    return metadata !== undefined ? metadata : defaultValue;
  } catch (error) {
    console.warn(`Failed to get metadata ${key}:`, error);
    return defaultValue;
  }
}
```

### Metadata Validation
```typescript
function validateMetadata<T>(key: string, target: any, propertyKey: string, validator: (value: any) => value is T): T | undefined {
  const metadata = Reflect.getMetadata(key, target, propertyKey);
  
  if (metadata === undefined) {
    return undefined;
  }
  
  if (!validator(metadata)) {
    throw new Error(`Invalid metadata for ${key} on ${target.constructor.name}.${propertyKey}`);
  }
  
  return metadata;
}

// Usage
const columnType = validateMetadata(
  'column:type',
  User.prototype,
  'name',
  (value): value is string => typeof value === 'string'
);
```

## Quick Reference

| Operation | Method | Inheritance | Use Case |
|-----------|--------|-------------|----------|
| Set | `defineMetadata(key, value, target, prop?)` | N/A | Store metadata |
| Get | `getMetadata(key, target, prop?)` | ✅ | Retrieve with inheritance |
| Get Own | `getOwnMetadata(key, target, prop?)` | ❌ | Retrieve without inheritance |
| Check | `hasMetadata(key, target, prop?)` | ✅ | Test existence with inheritance |
| Check Own | `hasOwnMetadata(key, target, prop?)` | ❌ | Test existence without inheritance |
| Delete | `deleteMetadata(key, target, prop?)` | N/A | Remove metadata |
| List Keys | `getMetadataKeys(target, prop?)` | ✅ | Get all keys with inheritance |
| List Own Keys | `getOwnMetadataKeys(target, prop?)` | ❌ | Get own keys without inheritance |

## Links

- **reflect-metadata GitHub**: https://github.com/rbuckton/reflect-metadata
- **TypeScript Handbook - Decorators**: https://www.typescriptlang.org/docs/handbook/decorators.html
- **TC39 Decorator Metadata Proposal**: https://github.com/tc39/proposal-decorator-metadata