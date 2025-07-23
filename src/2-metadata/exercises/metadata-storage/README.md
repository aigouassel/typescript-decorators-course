# Metadata Storage Exercise

**🔨 BUILD FROM SCRATCH - Architectural patterns**

## Overview
This exercise teaches you where and how to store metadata effectively. You'll learn the critical differences between class, prototype, and instance metadata storage, and build utilities that demonstrate these patterns.

## Learning Objectives
- Understand class vs prototype vs instance metadata storage
- Build static utility classes for metadata operations
- Implement array-based metadata collection patterns
- Create practical utilities for entity configuration and instance tracking
- Master metadata inheritance behavior

## Current State
**✅ Already There**:
- Test classes (`BaseEntity`, `User`) with basic structure
- Function signatures with descriptive comments
- Console.log placeholders showing intent

**🔨 Need Implementation (everything!)**:
- `MetadataStore` class - All static methods throw `NOT_IMPLEMENTED`
- `ArrayMetadataStore` class - All methods throw `NOT_IMPLEMENTED`
- `configureEntity()` - Only has console.log, no actual metadata storage
- `trackInstanceState()` - Only has console.log, no actual metadata storage
- `findInstancesWithMetadata()` - Returns empty array, no filtering logic

## Step-by-Step Implementation

### Step 1: Understand Storage Targets (~15 minutes)

Before implementing, understand WHERE metadata can be stored:

```typescript
class User {
  name: string = '';
  
  getName(): string { return this.name; }
}

// CLASS METADATA - stored on constructor (shared by all instances)
Reflect.defineMetadata('table', 'users', User);

// PROPERTY METADATA - stored on prototype (shared by all instances)
Reflect.defineMetadata('column', 'varchar', User.prototype, 'name');

// METHOD METADATA - stored on prototype (shared by all instances)  
Reflect.defineMetadata('cached', true, User.prototype, 'getName');

// INSTANCE METADATA - stored on specific instance (unique per object)
const user1 = new User();
Reflect.defineMetadata('id', '123', user1);
```

### Step 2: Implement `MetadataStore` Class (~45 minutes)

**Location**: Lines 11-35 in `metadata-storage.ts`

This class provides static methods for simple key-value metadata operations.

#### 2a. Implement `set()` method
```typescript
static set(key: string, value: any, target: any, propertyKey?: string): void {
  // Use Reflect.defineMetadata to store the metadata
  // Parameters: key, value, target, propertyKey (optional)
}
```

#### 2b. Implement `get()` method
```typescript
static get<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // Use Reflect.getMetadata to retrieve the metadata
  // Return type T or undefined if not found
}
```

#### 2c. Implement `has()` method
```typescript
static has(key: string, target: any, propertyKey?: string): boolean {
  // Use Reflect.hasMetadata to check existence
  // Return boolean indicating if metadata exists
}
```

#### 2d. Implement `delete()` method
```typescript
static delete(key: string, target: any, propertyKey?: string): boolean {
  // Use Reflect.deleteMetadata to remove metadata
  // Return boolean indicating if metadata was deleted
}
```

#### 2e. Implement `getKeys()` method
```typescript
static getKeys(target: any, propertyKey?: string): any[] {
  // Use Reflect.getMetadataKeys to get all keys
  // Return array of metadata keys
}
```

**Test it**: Run `npm test metadata-storage` - the MetadataStore tests should pass.

### Step 3: Implement `ArrayMetadataStore` Class (~60 minutes)

**Location**: Lines 37-61 in `metadata-storage.ts`

This class handles array-based metadata collections (like validation rules, middleware, etc.).

#### 3a. Implement `push()` method
```typescript
static push<T>(key: string, item: T, target: any, propertyKey?: string): void {
  // 1. Get existing array: Reflect.getMetadata(key, target, propertyKey) || []
  // 2. Push the new item to the array
  // 3. Store the updated array back: Reflect.defineMetadata(key, array, target, propertyKey)
}
```

#### 3b. Implement `getArray()` method
```typescript
static getArray<T>(key: string, target: any, propertyKey?: string): T[] {
  // Get the metadata array, return empty array if not found
  // Use Reflect.getMetadata and provide [] as fallback
}
```

#### 3c. Implement `remove()` method
```typescript
static remove<T>(key: string, item: T, target: any, propertyKey?: string): boolean {
  // 1. Get existing array
  // 2. Find index of item to remove
  // 3. If found, remove it with splice()
  // 4. Store updated array back
  // 5. Return true if item was removed, false otherwise
}
```

**Implementation hints**:
```typescript
// Finding and removing item
const existing: T[] = Reflect.getMetadata(key, target, propertyKey) || [];
const index = existing.indexOf(item);
if (index > -1) {
  existing.splice(index, 1);
  Reflect.defineMetadata(key, existing, target, propertyKey);
  return true;
}
return false;
```

**Test it**: The ArrayMetadataStore tests should pass.

### Step 4: Implement `configureEntity()` Utility (~30 minutes)

**Location**: Line 64 in `metadata-storage.ts`

This utility demonstrates class-level metadata configuration.

**What it should do**: Store entity configuration metadata on the class constructor

```typescript
export function configureEntity(entityClass: any, config: EntityConfig): void {
  // Store the configuration on the CLASS (constructor)
  // Use a key like 'entity:config' to namespace it
  // This metadata will be shared by all instances of the class
}
```

**Implementation approach**:
```typescript
export function configureEntity(entityClass: any, config: EntityConfig): void {
  // Store config metadata on the constructor (class-level)
  Reflect.defineMetadata('entity:config', config, entityClass);
  
  // Store table name separately for easy access
  Reflect.defineMetadata('entity:table', config.tableName, entityClass);
  
  // Remove the console.log - replace with actual implementation
}
```

**Test it**: The entity configuration tests should pass.

### Step 5: Implement `trackInstanceState()` Utility (~30 minutes)

**Location**: Line 68 in `metadata-storage.ts`

This utility demonstrates instance-level metadata storage.

**What it should do**: Store state metadata on specific object instances

```typescript
export function trackInstanceState(instance: any, state: InstanceState): void {
  // Store the state on the INSTANCE (not class or prototype)
  // Use a key like 'instance:state' to namespace it
  // This metadata will be unique to this specific instance
}
```

**Implementation approach**:
```typescript
export function trackInstanceState(instance: any, state: InstanceState): void {
  // Store state metadata directly on the instance
  Reflect.defineMetadata('instance:state', state, instance);
  
  // Store created timestamp separately
  Reflect.defineMetadata('instance:created', state.createdAt, instance);
  
  // Remove the console.log - replace with actual implementation
}
```

**Test it**: The instance tracking tests should pass.

### Step 6: Implement `findInstancesWithMetadata()` Utility (~45 minutes)

**Location**: Line 72 in `metadata-storage.ts`

This utility demonstrates filtering objects based on metadata.

**What it should do**: Find instances that have specific metadata values

```typescript
export function findInstancesWithMetadata(instances: any[], key: string, value?: any): any[] {
  // Filter instances based on metadata
  // If value is provided, match exact value
  // If value is undefined, just check if metadata exists
}
```

**Implementation approach**:
```typescript
export function findInstancesWithMetadata(instances: any[], key: string, value?: any): any[] {
  return instances.filter(instance => {
    // Check if instance has the metadata key
    if (!Reflect.hasMetadata(key, instance)) {
      return false;
    }
    
    // If no specific value required, return true
    if (value === undefined) {
      return true;
    }
    
    // Check if metadata value matches
    const metadata = Reflect.getMetadata(key, instance);
    return metadata === value;
  });
}
```

**Test it**: The filtering tests should pass.

## Testing Your Implementation

### Run Tests
```bash
# Test just this exercise
npm test metadata-storage

# Run with watch mode
npm test -- --watch metadata-storage

# Run specific test suites
npm test -- metadata-storage --grep "MetadataStore"
npm test -- metadata-storage --grep "ArrayMetadataStore"
npm test -- metadata-storage --grep "entity configuration"
```

### Expected Test Results
After implementing all components:
- ✅ MetadataStore basic operations tests passing
- ✅ ArrayMetadataStore collection tests passing
- ✅ Entity configuration tests passing
- ✅ Instance tracking tests passing
- ✅ Metadata filtering tests passing
- ✅ Class vs instance metadata tests passing

## Key Concepts to Understand

### Storage Locations
```typescript
// CLASS metadata - shared by all instances
MetadataStore.set('table', 'users', User);

// PROPERTY metadata - shared by all instances  
MetadataStore.set('column', 'varchar', User.prototype, 'name');

// INSTANCE metadata - unique per object
const user = new User();
MetadataStore.set('id', '123', user);
```

### Array Collections
```typescript
// Adding multiple validation rules
ArrayMetadataStore.push('validation', { type: 'required' }, User.prototype, 'name');
ArrayMetadataStore.push('validation', { type: 'minLength', value: 2 }, User.prototype, 'name');

// Getting all rules
const rules = ArrayMetadataStore.getArray('validation', User.prototype, 'name');
// Returns: [{ type: 'required' }, { type: 'minLength', value: 2 }]
```

### Practical Usage Patterns
```typescript
// Configure an entity class
configureEntity(User, {
  tableName: 'users',
  primaryKey: 'id',
  timestamps: true
});

// Track individual instance state
const user = new User();
trackInstanceState(user, {
  createdAt: new Date(),
  version: 1,
  dirty: false
});

// Find instances with specific metadata
const dirtyInstances = findInstancesWithMetadata(allUsers, 'instance:state', { dirty: true });
```

## Common Mistakes to Avoid

1. **Wrong storage target**: Remember class metadata goes on constructor, property metadata on prototype
2. **Array mutation**: Don't modify arrays in-place, create new arrays for immutability
3. **Key collisions**: Use namespaced keys like `'entity:config'` to avoid conflicts
4. **Instance vs prototype**: Be clear about whether metadata should be shared or unique
5. **Undefined handling**: Always provide fallbacks for missing metadata

## Real-World Applications

This exercise teaches patterns used in:

**ORM Systems**:
```typescript
// Class-level configuration
configureEntity(User, { tableName: 'users', primaryKey: 'id' });

// Property-level column metadata
MetadataStore.set('column:type', 'varchar', User.prototype, 'name');
```

**Validation Systems**:
```typescript
// Multiple validation rules per property
ArrayMetadataStore.push('validation', { type: 'required' }, User.prototype, 'email');
ArrayMetadataStore.push('validation', { type: 'email' }, User.prototype, 'email');
```

**State Management**:
```typescript
// Track entity state changes
trackInstanceState(user, { dirty: true, version: 2 });

// Find entities needing persistence
const unsavedEntities = findInstancesWithMetadata(entities, 'instance:state', { dirty: true });
```

## What's Next?

After completing this exercise, you'll have:
- ✅ Deep understanding of metadata storage patterns
- ✅ Experience with class vs instance metadata
- ✅ Practical utilities for real-world applications
- ✅ Ready for **Metadata Keys** exercise (advanced namespacing)

This knowledge is fundamental for building any metadata-driven system like ORMs, validation frameworks, or dependency injection containers.

## Reference Links

- [THEORY.md](../../THEORY.md) - Metadata storage patterns section
- [REFERENCE.md](../../REFERENCE.md) - Quick API reference