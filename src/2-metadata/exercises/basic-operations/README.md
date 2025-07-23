# Basic Operations Exercise

**⭐ START HERE - Perfect beginner exercise**

## Overview
This exercise teaches you the fundamentals of metadata operations by implementing simple wrapper functions around the Reflect API. Every function currently throws `NOT_IMPLEMENTED` errors, giving you a clean foundation to build upon.

## Learning Objectives
- Master the core Reflect API methods
- Understand metadata storage and retrieval patterns
- Learn the difference between inherited vs own metadata
- Build a solid foundation for all other exercises

## What This Builds
This implements 7 fundamental functions that wrap the Reflect API:

1. `setMetadata()` - Store metadata values
2. `getMetadata()` - Retrieve metadata values (with inheritance)
3. `hasMetadata()` - Check if metadata exists (with inheritance)
4. `deleteMetadata()` - Remove metadata
5. `getMetadataKeys()` - List all metadata keys (with inheritance)
6. `getInheritedMetadata()` - Same as getMetadata (demonstrates inheritance)
7. `getOwnMetadata()` - Get metadata without inheritance

## Step-by-Step Implementation

### Step 1: Implement `setMetadata()` (~15 minutes)

**Location**: Line 8 in `basic-operations.ts`

**What it should do**: Store metadata using `Reflect.defineMetadata`

**Expected signature**:
```typescript
function setMetadata(key: string, value: any, target: any, propertyKey?: string): void
```

**Implementation hint**:
```typescript
export function setMetadata(key: string, value: any, target: any, propertyKey?: string): void {
  // Use Reflect.defineMetadata to store the metadata
  // Parameters: key, value, target, propertyKey (optional)
}
```

**Test it**: Run `npm test basic-operations` - the "should set metadata on class" and "should set metadata on property" tests should pass.

### Step 2: Implement `getMetadata()` (~15 minutes)

**Location**: Line 12 in `basic-operations.ts`

**What it should do**: Retrieve metadata using `Reflect.getMetadata` (includes inherited metadata)

**Expected signature**:
```typescript
function getMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined
```

**Implementation hint**:
```typescript
export function getMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // Use Reflect.getMetadata to retrieve the metadata
  // This includes metadata from parent classes (inheritance)
}
```

**Test it**: The "should get metadata from class" and "should get metadata from property" tests should pass.

### Step 3: Implement `hasMetadata()` (~10 minutes)

**Location**: Line 16 in `basic-operations.ts`

**What it should do**: Check if metadata exists using `Reflect.hasMetadata`

**Expected signature**:
```typescript
function hasMetadata(key: string, target: any, propertyKey?: string): boolean
```

**Implementation hint**:
```typescript
export function hasMetadata(key: string, target: any, propertyKey?: string): boolean {
  // Use Reflect.hasMetadata to check if metadata exists
  // Returns true if metadata exists, false otherwise
}
```

**Test it**: The "should check metadata existence" tests should pass.

### Step 4: Implement `deleteMetadata()` (~10 minutes)

**Location**: Line 20 in `basic-operations.ts`

**What it should do**: Remove metadata using `Reflect.deleteMetadata`

**Expected signature**:
```typescript
function deleteMetadata(key: string, target: any, propertyKey?: string): boolean
```

**Implementation hint**:
```typescript
export function deleteMetadata(key: string, target: any, propertyKey?: string): boolean {
  // Use Reflect.deleteMetadata to remove the metadata
  // Returns true if metadata was deleted, false if it didn't exist
}
```

**Test it**: The "should delete metadata" tests should pass.

### Step 5: Implement `getMetadataKeys()` (~10 minutes)

**Location**: Line 24 in `basic-operations.ts`

**What it should do**: List all metadata keys using `Reflect.getMetadataKeys`

**Expected signature**:
```typescript
function getMetadataKeys(target: any, propertyKey?: string): any[]
```

**Implementation hint**:
```typescript
export function getMetadataKeys(target: any, propertyKey?: string): any[] {
  // Use Reflect.getMetadataKeys to get all metadata keys
  // This includes keys from parent classes (inheritance)
}
```

**Test it**: The "should get all metadata keys" tests should pass.

### Step 6: Implement `getInheritedMetadata()` (~5 minutes)

**Location**: Line 28 in `basic-operations.ts`

**What it should do**: Same as `getMetadata()` - this demonstrates that `getMetadata` includes inheritance by default

**Expected signature**:
```typescript
function getInheritedMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined
```

**Implementation hint**:
```typescript
export function getInheritedMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // This should do exactly the same thing as getMetadata()
  // It's here to demonstrate that Reflect.getMetadata includes inheritance by default
}
```

**Test it**: The inheritance tests should pass.

### Step 7: Implement `getOwnMetadata()` (~10 minutes)

**Location**: Line 32 in `basic-operations.ts`

**What it should do**: Get metadata without inheritance using `Reflect.getOwnMetadata`

**Expected signature**:
```typescript
function getOwnMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined
```

**Implementation hint**:
```typescript
export function getOwnMetadata<T = any>(key: string, target: any, propertyKey?: string): T | undefined {
  // Use Reflect.getOwnMetadata to get metadata WITHOUT inheritance
  // This only returns metadata directly set on the target, not from parent classes
}
```

**Test it**: The "should get own metadata without inheritance" tests should pass.

## Testing Your Implementation

### Run Individual Tests
```bash
# Test just this exercise
npm test basic-operations

# Run with watch mode for development
npm test -- --watch basic-operations
```

### Expected Test Results
After implementing all functions, you should see:
- ✅ All basic operation tests passing
- ✅ Class metadata tests passing  
- ✅ Property metadata tests passing
- ✅ Inheritance tests passing
- ✅ Edge case tests passing

## Key Concepts to Understand

### Class vs Property Metadata
```typescript
// Class metadata - stored on the constructor
setMetadata('table', 'users', User);

// Property metadata - stored on the prototype
setMetadata('column', 'name', User.prototype, 'username');
```

### Inheritance vs Own Metadata
```typescript
// getMetadata() includes parent class metadata
const inherited = getMetadata('key', ChildClass);

// getOwnMetadata() only includes metadata directly on the class
const own = getOwnMetadata('key', ChildClass);
```

## Common Mistakes to Avoid

1. **Forgetting the import**: Make sure `import 'reflect-metadata'` is at the top
2. **Wrong parameters**: Check the order of parameters for each Reflect method
3. **Undefined handling**: Some Reflect methods return `undefined` when metadata doesn't exist
4. **Target confusion**: Remember the difference between `target` (constructor) and `target.prototype`

## What's Next?

After completing this exercise, you'll have:
- ✅ Solid foundation in Reflect API usage
- ✅ Understanding of metadata storage patterns
- ✅ Knowledge of inheritance behavior
- ✅ Ready for **Type Discovery** exercise

The test classes (`BaseEntity`, `User`, `Product`) in this exercise will be used in later exercises, so understanding how metadata works with inheritance here is crucial.

## Reference Links

- [REFERENCE.md](../../REFERENCE.md) - Quick API reference
- [reflect-metadata GitHub](https://github.com/rbuckton/reflect-metadata) - Complete documentation