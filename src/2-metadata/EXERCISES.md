# Part 2: Metadata Exercises

This directory contains practical exercises for learning metadata operations and the `reflect-metadata` library, building upon the decorator fundamentals from Part 1.

## Prerequisites

Prerequisites for these exercises include:
- Completion of Part 1 (Decorators Fundamentals)
- Basic understanding of TypeScript types and generics
- Familiarity with classes and inheritance
- Reading the **THEORY.md** file for conceptual understanding

## Setup Requirements

Your project needs the following configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "lib": ["ES2020", "DOM"]
  }
}
```

```bash
# Install reflect-metadata
yarn add reflect-metadata
```

Each exercise file includes `import 'reflect-metadata';` at the top.

## Exercise Structure

Each exercise follows this pattern:
```
exercise-name/
├── exercise-name.ts        # Implementation file with TODO sections
└── exercise-name.test.ts   # Comprehensive test suite
```

## Learning Progression

The exercises build upon each other based on **actual implementation status**:

```
Basic Operations → Type Discovery → Metadata Storage → Metadata Keys → Performance Study
   (0% - Build)     (35% - Complete)   (10% - Build)      (20% - Advanced)   (85% - Reference)
```

**Recommended Order** (from easiest to most complex):
1. **Basic Operations** (0% complete) - Start here! Build fundamental Reflect API wrappers
2. **Type Discovery** (35% complete) - Good foundation, complete the core type extraction functions
3. **Metadata Storage** (10% complete) - Build class vs instance storage patterns from scratch
4. **Metadata Keys** (20% complete) - Advanced architecture, implement namespacing and registry systems
5. **Performance** (85% complete) - Study as reference implementation, nearly production-ready

## Exercise Overview

### 1. Basic Operations ⭐ START HERE
**Directory**: `basic-operations/`
**Learning Focus**: Master fundamental metadata operations using the Reflect API
**Implementation Status**: 0% complete - Perfect starting point for beginners

**Why Start Here**: All functions are empty placeholders, giving you a clean foundation to build fundamental understanding of the Reflect API.

**What You'll Build**:
- Simple wrapper functions around Reflect API methods
- Basic CRUD operations for metadata storage and retrieval
- Understanding of metadata inheritance patterns
- Foundation for all other exercises

**Implementation Tasks** (7 functions, ~30 minutes each):
1. `setMetadata()` - Wrapper for `Reflect.defineMetadata`
2. `getMetadata()` - Wrapper for `Reflect.getMetadata` 
3. `hasMetadata()` - Wrapper for `Reflect.hasMetadata`
4. `deleteMetadata()` - Wrapper for `Reflect.deleteMetadata`
5. `getMetadataKeys()` - Wrapper for `Reflect.getMetadataKeys`
6. `getInheritedMetadata()` - Same as `getMetadata` (demonstrates inheritance)
7. `getOwnMetadata()` - Wrapper for `Reflect.getOwnMetadata` (no inheritance)

### 2. Type Discovery 🔄 GOOD SECOND CHOICE
**Directory**: `type-discovery/`
**Learning Focus**: Extract TypeScript design-time type information
**Implementation Status**: 35% complete - Solid foundation, core functions need work

**Why Do This Second**: Has working utilities and test classes, but core type extraction functions need implementation. Builds directly on Basic Operations knowledge.

**What's Already Built**:
- `typeToString()` - Complete type name conversion (study this!)
- Test classes with proper TypeScript type annotations
- Class inspection structure

**What You'll Build** (4 core functions, ~45 minutes each):
1. `getPropertyType()` - Extract types using `design:type` metadata key
2. `getParameterTypes()` - Extract method parameter types using `design:paramtypes`
3. `getReturnType()` - Extract return types using `design:returntype`
4. `TypeInspector.getMethods()` - Complete the type inspection system

**Key Learning**: Understanding TypeScript's automatic metadata emission for type information.

### 3. Metadata Storage 🔨 BUILD FROM SCRATCH
**Directory**: `metadata-storage/`
**Learning Focus**: Understand class vs instance metadata patterns
**Implementation Status**: 10% complete - Basic structure only, everything needs building

**Why Do This Third**: Requires solid understanding of where metadata gets stored (class vs prototype vs instance). More architectural than previous exercises.

**What's Already There**:
- Test classes (`BaseEntity`, `User`) with basic structure
- Function signatures and placeholder console.logs

**What You'll Build** (2 classes + 3 utilities, ~1 hour each):
1. **`MetadataStore`** - Static methods for simple key-value metadata operations
2. **`ArrayMetadataStore`** - Methods for array-based metadata collections  
3. **`configureEntity()`** - Utility for entity/class configuration
4. **`trackInstanceState()`** - Utility for instance-specific metadata
5. **`findInstancesWithMetadata()`** - Utility for metadata-based filtering

**Key Learning**: Where to store metadata (constructor vs prototype vs instance) and when to use each pattern.

### 4. Metadata Keys ⚡ ADVANCED ARCHITECTURE
**Directory**: `metadata-keys/`
**Learning Focus**: Implement production-ready key management systems
**Implementation Status**: 20% complete - Complex architecture, significant work needed

**Why Save This for Fourth**: Most sophisticated exercise requiring understanding of namespacing, registries, and type-safe patterns. Builds on all previous concepts.

**What's Already Built**:
- Some `TypedMetadataAccessor` methods (`get`, `has`, `delete`)
- Complete `MetadataCollection` class for array operations
- Basic validation structure

**What You'll Build** (2 major systems, ~2 hours each):
1. **`MetadataKeys` System** - Key parsing, validation, and namespace management
   - `create()` - Format namespaced keys (`namespace:key:subkey`)
   - `parse()` - Parse key components back out
   - `isValid()` - Comprehensive key validation
   - `getKeysForNamespace()` - Namespace-based filtering

2. **`MetadataRegistry` System** - Production-ready key management
   - Complete registry for key definitions and validation
   - Type-safe metadata registration and retrieval
   - Collision detection and namespace management

**Key Learning**: Production patterns for avoiding key collisions and building type-safe metadata systems.

### 5. Performance 📚 STUDY REFERENCE IMPLEMENTATION
**Directory**: `performance/`
**Learning Focus**: Study advanced metadata optimization patterns
**Implementation Status**: 85% complete ✅ - Nearly production-ready reference

**Why Study This Last**: This is a sophisticated, working implementation that demonstrates advanced patterns you can achieve after mastering the previous exercises.

**What's Fully Implemented** (study these systems):
- **`MetadataPerformanceMonitor`** - Complete timing and metrics tracking
- **`MetadataCache`** - Full LRU cache with TTL and eviction policies
- **`LazyMetadataLoader`** - Lazy loading with dependency tracking
- **`BatchMetadataProcessor`** - Batch operations for efficiency

**What to Do**:
1. **Read and understand** the implementation patterns
2. **Run the tests** to see how everything works together
3. **Experiment** with different cache configurations
4. **Apply patterns** to your implementations in exercises 1-4

**Key Learning**: How to build production-ready metadata systems with performance optimization, caching, and monitoring.

## Running Tests

### All Exercises
```bash
npm test src/2-metadata/exercises/
```

### Individual Exercise
```bash
npm test src/2-metadata/exercises/basic-operations/basic-operations.test.ts
```

### Watch Mode (for development)
```bash
npm test -- --watch src/2-metadata/exercises/basic-operations/
```

### TypeScript Compilation Check
```bash
npx tsc --noEmit src/2-metadata/exercises/basic-operations/basic-operations.ts
```

## Working on Exercises

### Step-by-Step Approach
1. **Read THEORY.md**: Understand the concepts before implementing
2. **Read the Exercise File**: Each file has clear objectives and requirements
3. **Study the Tests**: Tests show expected behavior and usage patterns
4. **Find TODO Sections**: Look for `// TODO:` comments indicating implementation tasks
5. **Implement Incrementally**: Fill in the TODO sections one by one
6. **Run Tests Frequently**: Use tests to verify your implementation
7. **Experiment**: Try variations and edge cases to deepen understanding

### Testing Your Work
Each exercise includes comprehensive tests that verify:
- **Basic functionality** works correctly
- **Edge cases** are handled properly
- **Error conditions** are managed gracefully
- **Integration** with other metadata operations
- **Performance characteristics** meet expectations

### Common Implementation Patterns

#### Basic Metadata Operations
```typescript
import 'reflect-metadata';

// Set metadata
Reflect.defineMetadata('custom:key', 'value', target, propertyKey);

// Get metadata
const value = Reflect.getMetadata('custom:key', target, propertyKey);

// Check existence
const exists = Reflect.hasMetadata('custom:key', target, propertyKey);

// Delete metadata  
const deleted = Reflect.deleteMetadata('custom:key', target, propertyKey);
```

#### Design-Time Type Information
```typescript
// Get property type
const type = Reflect.getMetadata('design:type', target, propertyKey);

// Get parameter types
const paramTypes = Reflect.getMetadata('design:paramtypes', target, methodKey);

// Get return type
const returnType = Reflect.getMetadata('design:returntype', target, methodKey);
```

#### Metadata Storage Patterns
```typescript
// Class metadata (shared across instances)
Reflect.defineMetadata('table:name', 'users', UserClass);

// Instance metadata (unique per object)
Reflect.defineMetadata('instance:id', uuid(), userInstance);

// Property metadata (attached to prototype)
Reflect.defineMetadata('column:type', 'varchar', UserClass.prototype, 'name');
```

#### Metadata Utilities
```typescript
// Get all properties with specific metadata
function getPropertiesWithMetadata<T>(target: any, key: string): Map<string, T> {
  const result = new Map();
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  for (const prop of propertyNames) {
    const metadata = Reflect.getMetadata(key, target.prototype, prop);
    if (metadata !== undefined) {
      result.set(prop, metadata);
    }
  }
  
  return result;
}
```

## Debugging Tips

1. **Use Console Logging**: Log metadata operations to understand timing and values
2. **Check Metadata Keys**: Use `Reflect.getMetadataKeys()` to see what's stored
3. **Verify Types**: Use `typeof` and `instanceof` to understand metadata values
4. **Test Inheritance**: Check how metadata behaves in class hierarchies
5. **Performance Profiling**: Use the performance utilities to measure impact

## Common Pitfalls

### 1. Forgetting to Import reflect-metadata
**Problem**: `Reflect.defineMetadata is not a function`
**Solution**: Import `'reflect-metadata'` at the top of your file

### 2. Wrong Target for Metadata
**Problem**: Metadata not found when expected
**Solution**: Understand the difference between:
- `target` (constructor for class metadata)
- `target.prototype` (prototype for property metadata)
- `instance` (specific object instance)

### 3. Metadata Timing Issues
**Problem**: Metadata not available when expected
**Solution**: Ensure decorators have executed before accessing metadata

### 4. Key Collisions
**Problem**: Different libraries overwriting each other's metadata
**Solution**: Use namespaced keys and proper key management

### 5. Performance Issues
**Problem**: Slow metadata lookups in production
**Solution**: Implement caching and lazy loading strategies

## Test Features

- **Comprehensive Coverage**: Each exercise has thorough tests covering normal cases, edge cases, and error conditions
- **Test Isolation**: Each test file runs independently with no cross-contamination
- **Mocking**: Console methods and external dependencies are properly mocked
- **Type Safety**: Tests verify TypeScript type preservation
- **Real-world Scenarios**: Tests simulate practical usage patterns
- **Performance Testing**: Advanced exercises include performance benchmarks

## Best Practices During Implementation

### Error Handling
1. **Validate Metadata**: Check that expected metadata exists before using it
2. **Provide Defaults**: Have sensible fallbacks when metadata is missing
3. **Handle Edge Cases**: Consider null, undefined, and unexpected value types
4. **Graceful Degradation**: Design systems to work even when metadata is missing

### Performance Considerations
1. **Cache Lookups**: Cache expensive metadata operations for better performance
2. **Lazy Loading**: Load metadata only when needed
3. **Batch Operations**: Group multiple metadata operations when possible
4. **Monitor Usage**: Track metadata access patterns

### Code Organization
1. **Use Type Safety**: Leverage TypeScript types and interfaces
2. **Separate Concerns**: Keep metadata storage separate from business logic
3. **Document Patterns**: Comment complex metadata operations
4. **Test Thoroughly**: Write tests for edge cases and error conditions

## Integration with Part 1

These metadata exercises integrate directly with Part 1 decorators:

```typescript
// Part 1: Decorator stores metadata
function Required(target: any, propertyKey: string) {
  Reflect.defineMetadata('validation:required', true, target, propertyKey);
}

// Part 2: Business logic reads metadata
function validate(instance: any): ValidationResult {
  const required = Reflect.getMetadata('validation:required', instance.constructor.prototype, 'name');
  // ... validation logic using metadata
}
```

## Next Steps

After mastering metadata fundamentals:
1. **Part 3**: Advanced decorator-metadata integration patterns
2. **Real Projects**: Apply metadata patterns to actual applications
3. **Framework Building**: Create your own decorator-based frameworks
4. **Performance Optimization**: Scale metadata usage for production systems

## Additional Resources

- **API Reference**: See `REFERENCE.md` for quick API lookups
- **Theory Guide**: See `THEORY.md` for conceptual understanding
- **TypeScript Handbook**: [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- **reflect-metadata**: [GitHub Repository](https://github.com/rbuckton/reflect-metadata)

These exercises provide a solid foundation in metadata programming, preparing you for advanced decorator-metadata integration patterns in Part 3.