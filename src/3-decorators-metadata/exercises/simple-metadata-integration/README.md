# Simple Metadata Integration Exercise

## Overview

This exercise introduces the fundamental pattern of decorator-metadata integration: decorators store configuration metadata, and business logic reads that metadata to drive behavior. This is the foundational pattern used by all major frameworks like Angular, NestJS, TypeORM, and class-validator.

## Learning Objectives

This exercise demonstrates:
- The basic decorator → metadata → business logic flow
- How to store and retrieve metadata using reflect-metadata
- Building simple validation and ORM-style decorators
- Implementing metadata-driven business logic
- Handling multiple decorators on a single property

## Prerequisites

- Complete Part 1 (Decorators Fundamentals)
- Complete Part 2 (Metadata Operations)
- Read `../THEORY.md` for integration concepts
- Have `reflect-metadata` installed and imported

## Exercise Structure

```
simple-metadata-integration/
├── simple-metadata-integration.ts        # Main implementation file
├── simple-metadata-integration.test.ts   # Test suite
├── beginner-integration.ts              # Additional beginner examples
├── class-instance-patterns.ts           # Class vs instance patterns
├── key-management.ts                    # Metadata key management
└── README.md                            # This file
```

## Step-by-Step Implementation Guide

### Step 1: Understand the Current Implementation (5 minutes)

First, examine the existing code to understand what's already implemented:

1. **Read the main file**: Open `simple-metadata-integration.ts`
2. **Check the tests**: Look at the test file to understand expected behavior
3. **Identify gaps**: Note what needs to be implemented vs. what's already there

### Step 2: Implement Basic Validation Decorators (15 minutes)

Create decorators that store validation rules as metadata:

```typescript
// Example decorator structure
function Required(target: any, propertyKey: string) {
  // Store metadata indicating this property is required
  Reflect.defineMetadata('validation:required', true, target, propertyKey);
}

function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    // Store the minimum length requirement
    Reflect.defineMetadata('validation:minLength', length, target, propertyKey);
  };
}
```

**Implementation Tasks**:
1. Implement `@Required` decorator
2. Implement `@MinLength(n)` decorator factory
3. Implement `@Email` decorator for email validation
4. Test that metadata is stored correctly

**Key Concepts**:
- Use `Reflect.defineMetadata(key, value, target, propertyKey)` to store data
- Use consistent metadata key naming (e.g., `'validation:required'`)
- Property decorators receive `target` and `propertyKey` parameters

### Step 3: Build Validation Engine (20 minutes)

Create business logic that reads metadata and performs validation:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validate(instance: any): ValidationResult {
  // Your implementation here
  // 1. Get all property names from the instance
  // 2. For each property, check for validation metadata
  // 3. Execute validation rules and collect errors
  // 4. Return result
}
```

**Implementation Tasks**:
1. Implement the `validate` function
2. Handle all three validation types (required, minLength, email)
3. Provide meaningful error messages
4. Test with various valid and invalid inputs

**Key Concepts**:
- Use `Object.getOwnPropertyNames(instance.constructor.prototype)` to get properties
- Use `Reflect.getMetadata(key, target, propertyKey)` to read metadata
- Validate actual property values from the instance
- Handle cases where metadata doesn't exist (no validation needed)

### Step 4: Implement Multiple Decorators Support (10 minutes)

Enhance your system to handle multiple decorators on the same property:

```typescript
class User {
  @Required
  @MinLength(2)
  @Email
  email: string = '';
}
```

**Implementation Tasks**:
1. Ensure multiple decorators work together
2. Test that all validation rules are applied
3. Verify error messages are collected from all failed validations

**Key Concepts**:
- Each decorator stores its own metadata independently
- The validation engine should check for all possible metadata keys
- Multiple validation errors should be collected, not just the first one

### Step 5: Create Simple ORM-Style Decorators (25 minutes)

Implement basic database mapping decorators:

```typescript
// Example usage
@Table('users')
class User {
  @Column({ type: 'int', primary: true })
  id: number = 0;
  
  @Column({ type: 'varchar', length: 100 })
  name: string = '';
}
```

**Implementation Tasks**:
1. Implement `@Table(name)` class decorator
2. Implement `@Column(options)` property decorator
3. Create a function that generates SQL CREATE TABLE statements
4. Test SQL generation with various column types and options

**Key Concepts**:
- Class decorators use `Reflect.defineMetadata(key, value, constructor)`
- Store both individual column metadata and a list of all columns
- Business logic reads metadata to generate SQL or perform operations

### Step 6: Build Schema Generation Logic (15 minutes)

Create business logic that reads ORM metadata:

```typescript
function generateCreateTableSQL(entityClass: any): string {
  // Your implementation here
  // 1. Get table name from class metadata
  // 2. Get all column names and their metadata
  // 3. Generate SQL column definitions
  // 4. Combine into CREATE TABLE statement
}
```

**Implementation Tasks**:
1. Implement SQL generation function
2. Handle various column options (type, length, primary key, etc.)
3. Test with different entity classes
4. Ensure proper SQL syntax

### Step 7: Test Integration Patterns (15 minutes)

Create comprehensive tests that verify the decorator-metadata-business logic flow:

**Implementation Tasks**:
1. Test validation system with complex scenarios
2. Test ORM system with various entity configurations
3. Test error handling (missing metadata, invalid values)
4. Test edge cases (empty classes, no decorators)

### Step 8: Add Error Handling and Edge Cases (10 minutes)

Improve robustness of your implementation:

**Implementation Tasks**:
1. Handle missing metadata gracefully
2. Provide helpful error messages for misconfigurations
3. Validate decorator parameters (e.g., minLength > 0)
4. Test with inheritance scenarios

## Expected Implementation Timeline

- **Step 1**: 5 minutes - Understanding existing code
- **Step 2**: 15 minutes - Basic validation decorators
- **Step 3**: 20 minutes - Validation engine
- **Step 4**: 10 minutes - Multiple decorators
- **Step 5**: 25 minutes - ORM decorators
- **Step 6**: 15 minutes - Schema generation
- **Step 7**: 15 minutes - Integration testing
- **Step 8**: 10 minutes - Error handling

**Total Time**: ~2 hours

## Testing the Implementation

Run the test suite to verify your implementation:

```bash
# Run tests for this exercise
npm test src/3-decorators-metadata/exercises/simple-metadata-integration/

# Run in watch mode during development
npm test -- --watch src/3-decorators-metadata/exercises/simple-metadata-integration/

# Type checking
npx tsc --noEmit src/3-decorators-metadata/exercises/simple-metadata-integration/simple-metadata-integration.ts
```

## Common Challenges and Solutions

### Challenge 1: Metadata Not Found
**Problem**: `Reflect.getMetadata` returns `undefined`
**Solution**: 
- Ensure `import 'reflect-metadata';` is at the top of your file
- Check that decorators are executing before metadata is read
- Verify metadata keys match exactly between decorator and reader

### Challenge 2: TypeScript Compilation Errors
**Problem**: TypeScript errors related to decorators
**Solution**: 
- Ensure `"experimentalDecorators": true` in tsconfig.json
- Add `"emitDecoratorMetadata": true` for design-time type info
- Check parameter types in decorator functions

### Challenge 3: Property Values vs. Metadata
**Problem**: Confusing property values with metadata
**Solution**: 
- Metadata is stored separately from property values
- Use `instance[propertyKey]` to get the actual value
- Use `Reflect.getMetadata(...)` to get the stored configuration

### Challenge 4: Multiple Decorators Not Working
**Problem**: Only the last decorator's metadata is preserved
**Solution**: 
- Each decorator should use a unique metadata key
- Don't overwrite existing metadata; add to it if needed
- Read all relevant metadata keys in business logic

## Key Concepts to Master

1. **Separation of Concerns**: Decorators store configuration, business logic uses configuration
2. **Metadata Keys**: Use consistent, namespaced keys (e.g., `'validation:required'`)
3. **Reflection API**: Understanding `defineMetadata` vs. `getMetadata`
4. **Property vs. Class Metadata**: Different targets for different decorator types
5. **Error Handling**: Graceful handling of missing or invalid metadata

## Next Steps

After completing this exercise, next steps include:

1. **Review Implementation** - Compare with reference solutions
2. **Experiment with Variations** - Try different metadata structures
3. **Read Real Framework Code** - Study how class-validator or TypeORM work
4. **Move to Exercise 2** - Build on these patterns with more complex validation

## Real-World Applications

The patterns you've learned are used in:

- **class-validator**: Validation decorators like `@IsEmail`, `@MinLength`
- **TypeORM**: Entity decorators like `@Entity`, `@Column`
- **NestJS**: Controller decorators like `@Controller`, `@Get`
- **Angular**: Component decorators like `@Component`, `@Injectable`

Understanding this foundational pattern prepares you to work with any metadata-driven framework and to build your own decorator-based APIs.