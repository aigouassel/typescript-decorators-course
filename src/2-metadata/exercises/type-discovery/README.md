# Type Discovery Exercise

**🔄 GOOD SECOND CHOICE - Build on solid foundation**

## Overview
This exercise teaches you how to extract TypeScript's design-time type information at runtime. It has a solid foundation with working utilities, but the core type extraction functions need implementation.

## Learning Objectives
- Extract property types using `design:type` metadata
- Handle method parameter types with `design:paramtypes`
- Work with return types using `design:returntype`
- Build comprehensive type inspection systems
- Understand TypeScript's automatic metadata emission

## Current State
**✅ Already Implemented (study these)**:
- `typeToString()` - Complete type name conversion utility
- Test classes (`Address`, `User`, `Product`) with proper TypeScript annotations
- `TypeInspector` class structure with `getClassName()` method

**🔨 Need Implementation**:
- `getPropertyType()` - Extract property type information
- `getParameterTypes()` - Extract method parameter types
- `getReturnType()` - Extract method return types
- `TypeInspector.getMethods()` - Complete type inspection system

## Step-by-Step Implementation

### Step 1: Study What's Already Built (~15 minutes)

Before implementing, understand the existing code:

**1. Read `typeToString()` function** (lines 8-20):
```typescript
// This function converts type constructors to readable names
typeToString(String) // returns "string"
typeToString(Number) // returns "number"
typeToString(Array)  // returns "array"
// etc.
```

**2. Examine the test classes** (lines 65-100):
```typescript
class User {
  name: string = '';        // design:type will be String
  age: number = 0;          // design:type will be Number
  isActive: boolean = true; // design:type will be Boolean
  
  updateProfile(data: any): boolean { // paramtypes: [Object], returntype: Boolean
    return true;
  }
}
```

**3. Understand TypeScript's metadata emission**:
When `emitDecoratorMetadata: true` is enabled, TypeScript automatically stores:
- `design:type` - Property types
- `design:paramtypes` - Method parameter types array
- `design:returntype` - Method return types

### Step 2: Implement `getPropertyType()` (~30 minutes)

**Location**: Line 22 in `type-discovery.ts`

**What it should do**: Extract property type using `design:type` metadata key

**Expected signature**:
```typescript
function getPropertyType(target: any, propertyKey: string): string
```

**Implementation approach**:
```typescript
export function getPropertyType(target: any, propertyKey: string): string {
  // 1. Use Reflect.getMetadata to get the 'design:type' for the property
  // 2. Convert the type constructor to a readable string using typeToString()
  // 3. Handle cases where metadata might not exist
}
```

**Step-by-step**:
1. Get the type constructor: `const type = Reflect.getMetadata('design:type', target, propertyKey)`
2. Convert to string: `return typeToString(type)`
3. Handle undefined case: Return 'unknown' if no metadata found

**Test it**: Run `npm test type-discovery` - the property type tests should pass.

### Step 3: Implement `getParameterTypes()` (~30 minutes)

**Location**: Line 26 in `type-discovery.ts`

**What it should do**: Extract method parameter types using `design:paramtypes` metadata key

**Expected signature**:
```typescript
function getParameterTypes(target: any, methodName: string): string[]
```

**Implementation approach**:
```typescript
export function getParameterTypes(target: any, methodName: string): string[] {
  // 1. Use Reflect.getMetadata to get 'design:paramtypes' for the method
  // 2. This returns an array of type constructors
  // 3. Convert each type to a string using typeToString()
  // 4. Handle cases where metadata might not exist
}
```

**Step-by-step**:
1. Get parameter types: `const paramTypes = Reflect.getMetadata('design:paramtypes', target, methodName)`
2. Handle undefined: `if (!paramTypes) return []`
3. Map to strings: `return paramTypes.map(typeToString)`

**Test it**: The parameter type tests should pass.

### Step 4: Implement `getReturnType()` (~30 minutes)

**Location**: Line 30 in `type-discovery.ts`

**What it should do**: Extract method return type using `design:returntype` metadata key

**Expected signature**:
```typescript
function getReturnType(target: any, methodName: string): string
```

**Implementation approach**:
```typescript
export function getReturnType(target: any, methodName: string): string {
  // 1. Use Reflect.getMetadata to get 'design:returntype' for the method
  // 2. Convert the type constructor to a readable string
  // 3. Handle cases where metadata might not exist
}
```

**Step-by-step**:
1. Get return type: `const returnType = Reflect.getMetadata('design:returntype', target, methodName)`
2. Convert to string: `return typeToString(returnType)`
3. Handle undefined: Return 'unknown' if no metadata found

**Test it**: The return type tests should pass.

### Step 5: Implement `TypeInspector.getMethods()` (~45 minutes)

**Location**: Line 59 in `type-discovery.ts` (inside TypeInspector class)

**What it should do**: Return detailed information about all methods in a class

**Expected signature**:
```typescript
getMethods(): MethodInfo[]
```

**Implementation approach**:
```typescript
getMethods(): MethodInfo[] {
  // 1. Get all property names from the prototype
  // 2. Filter to only methods (functions)
  // 3. For each method, use getMethodInfo() to get detailed information
  // 4. Return array of MethodInfo objects
}
```

**Step-by-step**:
1. Get property names: `const propertyNames = Object.getOwnPropertyNames(this.target.prototype)`
2. Filter methods: Check if `typeof this.target.prototype[name] === 'function'`
3. Skip constructor: `if (name === 'constructor') continue`
4. Get method info: `const info = getMethodInfo(this.target.prototype, name)`
5. Collect results: Build array of MethodInfo objects

**Note**: This depends on `getMethodInfo()` which should work once you implement the previous functions.

**Test it**: The TypeInspector tests should pass.

## Testing Your Implementation

### Run Tests
```bash
# Test just this exercise
npm test type-discovery

# Run with watch mode
npm test -- --watch type-discovery

# Run specific test suites
npm test -- type-discovery --grep "property types"
npm test -- type-discovery --grep "parameter types"
```

### Expected Test Results
After implementing all functions:
- ✅ Property type extraction tests passing
- ✅ Method parameter type tests passing  
- ✅ Return type extraction tests passing
- ✅ TypeInspector integration tests passing
- ✅ Complex type handling tests passing

## Key Concepts to Understand

### TypeScript Metadata Keys
```typescript
// Property type metadata (automatic with emitDecoratorMetadata: true)
Reflect.getMetadata('design:type', User.prototype, 'name') // Returns String constructor

// Method parameter types (array of type constructors)
Reflect.getMetadata('design:paramtypes', User.prototype, 'updateProfile') // Returns [Object]

// Method return type (single type constructor)
Reflect.getMetadata('design:returntype', User.prototype, 'updateProfile') // Returns Boolean
```

### Type Constructor to String Mapping
```typescript
String     -> 'string'
Number     -> 'number'  
Boolean    -> 'boolean'
Array      -> 'array'
Date       -> 'Date'
Object     -> 'Object'
MyClass    -> 'MyClass'
undefined  -> 'unknown'
```

### Using the Results
```typescript
const inspector = new TypeInspector(User);

// Get all method information
const methods = inspector.getMethods();
// Returns: [{ name: 'updateProfile', parameterTypes: ['Object'], returnType: 'boolean' }]

// Get specific property type
const nameType = getPropertyType(User.prototype, 'name');
// Returns: 'string'
```

## Common Mistakes to Avoid

1. **Wrong metadata key**: Use exact strings `'design:type'`, `'design:paramtypes'`, `'design:returntype'`
2. **Target confusion**: Property metadata is on `prototype`, not constructor
3. **Undefined handling**: Always check if metadata exists before using it
4. **Array mapping**: `design:paramtypes` returns an array that needs mapping
5. **Method filtering**: Make sure to only process actual methods, not properties

## Debugging Tips

```typescript
// Debug metadata availability
console.log('Available keys:', Reflect.getMetadataKeys(User.prototype, 'name'));

// Debug type constructors
const type = Reflect.getMetadata('design:type', User.prototype, 'name');
console.log('Type constructor:', type); // Should be String

// Debug parameter types
const paramTypes = Reflect.getMetadata('design:paramtypes', User.prototype, 'updateProfile');
console.log('Parameter types:', paramTypes); // Should be array of constructors
```

## What's Next?

After completing this exercise, you'll have:
- ✅ Mastery of TypeScript's design-time type metadata
- ✅ Experience building type inspection systems
- ✅ Understanding of automatic metadata emission
- ✅ Ready for **Metadata Storage** exercise

This knowledge is crucial for building systems like ORMs, validation frameworks, and serialization libraries that need to understand your code's type structure at runtime.

## Reference Links

- [REFERENCE.md](../../REFERENCE.md) - Design-time type metadata reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata) - Decorator metadata documentation