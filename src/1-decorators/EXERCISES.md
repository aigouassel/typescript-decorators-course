# Part 1: Decorator Exercises

This directory contains practical exercises for learning TypeScript decorators, progressing from simple concepts to more advanced patterns.

## Prerequisites

Prerequisites for these exercises include:
- Basic TypeScript knowledge
- Understanding of classes and inheritance
- Familiarity with ES6+ features
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

## Exercise Structure

Each exercise follows this pattern:
```
exercise-name/
├── exercise-name.ts        # Implementation file with TODO sections
├── exercise-name.test.ts   # Comprehensive test suite
└── decorators.ts          # Pre-built decorator utilities
```

## Exercise Overview

### 1. Simple Log
**Directory**: `simple-log/`
**Learning Focus**: Create a `@log` decorator that logs method calls
**Implementation Status**: Needs implementation - TODO sections for core logging functionality

**What You'll Learn**:
- Basic method decorator structure and syntax
- Property descriptor modification and method wrapping
- Console output and method execution tracking
- Handling different method signatures and return values

**Key Concepts**:
- Method decorators receive `target`, `propertyName`, and `descriptor` parameters
- Replacing `descriptor.value` to wrap the original method
- Preserving `this` context when wrapping methods

### 2. Class Info
**Directory**: `class-info/`
**Learning Focus**: Create a `@classInfo` decorator that adds static metadata to classes
**Implementation Status**: Needs implementation - TODO sections for metadata attachment

**What You'll Learn**:
- Class decorator patterns and constructor modification
- Adding static properties to class constructors
- Accessing class information at runtime without inheritance
- Extending class functionality through decoration

**Key Concepts**:
- Class decorators receive the constructor function as parameter
- Modifying or replacing the constructor to add functionality
- Storing metadata on the constructor for later access

### 3. Property Logger
**Directory**: `property-logger/`
**Learning Focus**: Create a `@track` decorator that logs property access and changes
**Implementation Status**: Needs implementation - TODO sections for property interception

**What You'll Learn**:
- Property decorator implementation using `Object.defineProperty`
- Creating custom getters and setters for property interception
- Monitoring property access patterns and value changes
- Implementing property validation and transformation

**Key Concepts**:
- Property decorators receive `target` and `propertyName` parameters
- Using `Object.defineProperty` to replace property with getter/setter
- Storing property values and intercepting access

### 4. Method Wrapper
**Directory**: `method-wrapper/`
**Learning Focus**: Create a `@wrapper` decorator that adds before/after functionality
**Implementation Status**: Needs implementation - TODO sections for execution wrapping

**What You'll Learn**:
- Advanced method decoration with before/after hooks
- Modifying method arguments and return values
- Error handling and exception management in decorators
- Function composition and execution control

**Key Concepts**:
- Implementing pre-execution and post-execution logic
- Handling both synchronous and asynchronous methods
- Error boundary patterns in method decorators

### 5. Validation
**Directory**: `validation/`
**Learning Focus**: Create property validation decorators like `@notEmpty`
**Implementation Status**: Needs implementation - TODO sections for validation rules

**What You'll Learn**:
- Property validation using decorators
- Error handling and meaningful error messages
- Supporting multiple validation rules on single properties
- Building reusable validation patterns

**Key Concepts**:
- Property decorators for validation rule storage
- Validation execution during property assignment
- Combining multiple decorators for complex validation

### 6. Timing
**Directory**: `timing/`
**Learning Focus**: Create a configurable `@timing` decorator for performance measurement
**Implementation Status**: Needs implementation - TODO sections for decorator factories

**What You'll Learn**:
- Decorator factories with configuration parameters
- Performance monitoring and measurement techniques
- Handling both synchronous and asynchronous method timing
- Configurable timing thresholds and reporting

**Key Concepts**:
- Decorator factories return decorators based on parameters
- Using `performance.now()` for accurate timing measurements
- Supporting different time units and formatting options

## Learning Progression

The exercises are designed to build upon each other:

```
Simple Log → Class Info → Property Logger → Method Wrapper → Validation → Timing
(Foundation) (Metadata)  (Interception)   (Advanced)      (Real-world) (Factories)
```

**Recommended Order**:
1. **Simple Log** - Basic method decorator concepts and syntax
2. **Class Info** - Class-level decoration and metadata attachment
3. **Property Logger** - Property interception and monitoring patterns
4. **Method Wrapper** - Advanced method manipulation and error handling
5. **Validation** - Real-world property validation applications
6. **Timing** - Decorator factories and configuration patterns

## Running Tests

### All Exercises
```bash
npm run test:decorators
```

### Individual Exercise
```bash
npm test -- --run src/1-decorators/exercises/simple-log/simple-log.test.ts
```

### Watch Mode (for development)
```bash
npm test -- --watch src/1-decorators/exercises/simple-log/
```

## Working on Exercises

### Step-by-Step Approach
1. **Read THEORY.md**: Understand decorator concepts before implementing
2. **Read the Implementation File**: Each exercise has clear requirements and TODO sections
3. **Study the Tests**: Tests demonstrate expected behavior and usage patterns
4. **Find TODO Sections**: Look for `// TODO:` comments indicating implementation tasks
5. **Implement Step by Step**: Fill in the TODO sections incrementally
6. **Run Tests Frequently**: Use tests to verify your implementation
7. **Experiment**: Try variations and edge cases to deepen understanding

### Testing Your Work
Each exercise includes comprehensive tests that verify:
- **Basic functionality** works correctly
- **Edge cases** are handled properly
- **Error conditions** are managed gracefully
- **Integration** with decorated classes
- **Type preservation** in TypeScript

### Common Implementation Patterns

#### Method Decorators
```typescript
function methodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    // Before logic
    const result = originalMethod.apply(this, args);
    // After logic
    return result;
  };
  
  return descriptor;
}
```

#### Class Decorators
```typescript
function classDecorator<T extends new(...args: any[]) => {}>(constructor: T) {
  // Add static properties or modify class
  (constructor as any).metadata = { /* ... */ };
  return constructor;
}
```

#### Property Decorators
```typescript
function propertyDecorator(target: any, propertyKey: string) {
  let value: any;
  
  Object.defineProperty(target, propertyKey, {
    get() { return value; },
    set(newValue: any) { 
      // Validation or logging logic
      value = newValue; 
    },
    enumerable: true,
    configurable: true
  });
}
```

#### Decorator Factories
```typescript
function configurableDecorator(options: Options = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Use options to customize behavior
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // Custom logic using options
      return originalMethod.apply(this, args);
    };
  };
}
```

## Debugging Tips

1. **Console Logging**: Use console.log in your decorators to understand execution flow
2. **Type Inspection**: Use `typeof` and `instanceof` to understand parameter types
3. **Breakpoints**: Set breakpoints in both decorator and method code
4. **Test Isolation**: Run individual tests to isolate problems
5. **Check Descriptor**: Examine the PropertyDescriptor to understand method structure

### Common Debug Patterns
```typescript
function debugDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log('Decorator applied to:', target.constructor.name, propertyKey);
  console.log('Descriptor:', descriptor);
  console.log('Original method:', descriptor.value);
  
  // Your implementation here
}
```

## Common Pitfalls

### 1. Losing `this` Context
**Problem**: Using arrow functions in method decorators
**Solution**: Use `function` declarations to preserve `this`

```typescript
// ❌ Wrong - loses this context
descriptor.value = (...args: any[]) => {
  return originalMethod.apply(this, args);
};

// ✅ Correct - preserves this context
descriptor.value = function (...args: any[]) {
  return originalMethod.apply(this, args);
};
```

### 2. Decorator Execution Timing
**Problem**: Expecting decorators to run when methods are called
**Solution**: Remember decorators execute when classes are defined

### 3. Property Descriptor Modification
**Problem**: Not returning modified descriptor
**Solution**: Return the descriptor from method decorators when modified

### 4. Type Safety Issues
**Problem**: Losing TypeScript type information
**Solution**: Use proper type annotations and generic constraints

### 5. Side Effects in Decorators
**Problem**: Decorators causing unexpected side effects during class definition
**Solution**: Keep decorator logic minimal and side-effect free

## Test Features

- **Comprehensive Coverage**: Each exercise has thorough tests covering normal cases, edge cases, and error conditions
- **Test Isolation**: Each test file runs independently with no cross-dependencies
- **Mocking**: Console methods and external dependencies are properly mocked
- **Type Safety**: Tests verify TypeScript type preservation
- **Real-world Scenarios**: Tests simulate practical usage patterns

## Best Practices During Implementation

### Code Organization
1. **Single Responsibility**: Each decorator should have one clear purpose
2. **Composability**: Design decorators to work well together
3. **Type Safety**: Preserve TypeScript type information
4. **Error Handling**: Provide meaningful error messages

### Performance Considerations
1. **Minimize Overhead**: Keep decorator logic lightweight
2. **Avoid Memory Leaks**: Clean up resources and references
3. **Cache When Appropriate**: Cache expensive computations
4. **Profile Impact**: Measure decorator performance impact

### Testing Strategy
1. **Test Decorators Independently**: Test decorator logic separately from decorated classes
2. **Mock External Dependencies**: Mock console, timers, and external services
3. **Test Edge Cases**: Include error conditions and boundary cases
4. **Integration Testing**: Test decorated classes in realistic scenarios

## Tips for Success

1. **Use TypeScript Features**: Take advantage of strong typing and interfaces
2. **Handle Edge Cases**: Consider null values, undefined parameters, and error conditions
3. **Test Thoroughly**: Run tests frequently during development
4. **Read Console Output**: Many exercises use console.log - check the output
5. **Understand Decorator Timing**: Remember when decorators execute vs when methods run
6. **Practice Incrementally**: Master each exercise before moving to the next

## Integration with Part 2

These decorator exercises prepare you for Part 2 metadata integration:

```typescript
// Part 1: Basic decorator (just logging)
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`);
    return originalMethod.apply(this, args);
  };
}

// Part 2 will add: Storing metadata about the logging configuration
// Part 3 will add: Using metadata to drive logging behavior
```

## Next Steps

After completing these exercises:
1. **Part 2**: Learn metadata fundamentals with `reflect-metadata`
2. **Part 3**: Build advanced systems combining decorators and metadata
3. **Real Projects**: Apply decorator patterns to your own applications

## Additional Resources

- **API Reference**: See `REFERENCE.md` for quick decorator API lookups
- **Theory Guide**: See `THEORY.md` for comprehensive conceptual understanding
- **TypeScript Handbook**: [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

These exercises provide a solid foundation in TypeScript decorators, preparing you for advanced metadata-driven programming patterns.