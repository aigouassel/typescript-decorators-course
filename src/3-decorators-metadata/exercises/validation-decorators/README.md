# Validation Decorators Exercise

## Overview

This exercise builds a comprehensive validation system using decorators and metadata - the same patterns used by libraries like class-validator, Angular forms, and NestJS validation pipes. You'll create a production-ready validation framework with sophisticated rule composition, conditional validation, and extensible error handling.

## Learning Objectives

This exercise demonstrates:
- Advanced validation decorator patterns
- Rule composition and conditional validation
- Building extensible validation engines with custom rules
- Handling complex validation scenarios (async validation, cross-property validation)
- Creating reusable validation utilities for real applications

## Prerequisites

- Complete Simple Metadata Integration exercise
- Understanding of TypeScript generics and advanced types
- Familiarity with Promise-based APIs
- Read `../THEORY.md` validation system section

## Exercise Structure

```
validation-decorators/
├── validation-decorators.ts        # Main implementation
├── validation-decorators.test.ts   # Comprehensive test suite
├── validation-decorators-single.ts # Single-file version
├── decorators.ts                   # Validation decorators
├── types.ts                        # TypeScript interfaces
└── README.md                       # This file
```

## Step-by-Step Implementation Guide

### Step 1: Analyze Existing Implementation (10 minutes)

First, understand what's already implemented:

1. **Examine the main file**: Check `validation-decorators.ts` for existing code
2. **Review test expectations**: Study the test file to understand required functionality
3. **Check types**: Look at type definitions to understand the system architecture

**Current Status**: The exercise has a well-implemented foundation with comprehensive decorator system. Your job is to understand and potentially extend it.

### Step 2: Understand Validation Rule Metadata (15 minutes)

Study how validation rules are stored and structured:

```typescript
interface ValidationRule {
  type: string;           // Rule type (required, minLength, etc.)
  message?: string;       // Custom error message
  value?: any;           // Rule configuration (length, pattern, etc.)
  condition?: (target: any) => boolean; // Conditional validation
  async?: boolean;       // Whether rule supports async validation
}
```

**Your Task**:
1. Understand how rules are added to metadata arrays
2. Study the rule ordering and priority system
3. Examine how conditional validation works
4. Review error message customization

**Key Concepts**:
- Multiple rules per property stored as arrays
- Each rule type has specific validation logic
- Rules can be conditional based on object state
- Custom error messages override defaults

### Step 3: Master Core Validation Decorators (20 minutes)

Study and extend the core validation decorators:

```typescript
// Examine existing decorators
@Required(message?: string)
@MinLength(length: number, message?: string)
@MaxLength(length: number, message?: string)
@Email(message?: string)
@Range(min: number, max: number, message?: string)
@Pattern(regex: RegExp, message?: string)
```

**Your Task**:
1. Understand how each decorator stores metadata
2. Test all core decorators with various inputs
3. Implement additional decorators if needed:
   - `@IsNumber` - validates numeric values
   - `@IsBoolean` - validates boolean values
   - `@IsDate` - validates date objects
   - `@IsArray` - validates array values

**Key Concepts**:
- Decorator factories return property decorators
- Consistent metadata key structure
- Error message templates with value interpolation
- Type-specific validation logic

### Step 4: Implement Advanced Validation Patterns (25 minutes)

Work with sophisticated validation scenarios:

```typescript
// Conditional validation
@RequiredIf((target) => target.accountType === 'premium')
@ValidateIf((target) => target.enableAdvancedFeatures)

// Cross-property validation
@MatchesProperty('password')
@DifferentFrom('username')

// Custom validation
@Custom((value, target) => {
  // Custom validation logic
  return value.length > 0 || 'Value cannot be empty';
})
```

**Your Task**:
1. Implement conditional validation decorators
2. Create cross-property validation decorators
3. Build custom validation decorator with user-defined logic
4. Test complex validation scenarios

**Key Concepts**:
- Conditional validation checks object state before validating
- Cross-property validation accesses other properties
- Custom validators can return boolean or error messages
- Validation context provides access to entire object

### Step 5: Build the Validation Engine (30 minutes)

Understand and enhance the core validation engine:

```typescript
class Validator {
  static validate(instance: any): ValidationResult;
  static validateProperty(instance: any, propertyName: string): ValidationError[];
  static validateAsync(instance: any): Promise<ValidationResult>;
}
```

**Your Task**:
1. Study how the validation engine processes rules
2. Understand error collection and aggregation
3. Implement async validation support
4. Add validation performance optimization

**Key Concepts**:
- Property discovery and metadata extraction
- Rule execution with proper error handling
- Async validation with Promise coordination
- Performance optimization with caching

### Step 6: Implement Async Validation (20 minutes)

Add support for asynchronous validation rules:

```typescript
@AsyncCustom(async (value, target) => {
  // Simulate API call for unique email check
  const exists = await checkEmailExists(value);
  return !exists || 'Email already exists';
})

@AsyncValidate(async (value, target) => {
  // Custom async validation logic
  return await someAsyncValidation(value);
})
```

**Your Task**:
1. Create async validation decorators
2. Implement async validation engine
3. Handle Promise resolution and error handling
4. Test with simulated async operations

**Key Concepts**:
- Async validation returns Promises
- Parallel execution of async validations
- Error handling for network/API failures
- Timeouts and cancellation support

### Step 7: Add Validation Groups and Scenarios (15 minutes)

Implement validation groups for different scenarios:

```typescript
@Required({ groups: ['create', 'update'] })
@MinLength(8, { groups: ['create'] })
@Email({ groups: ['registration'] })

// Validate specific groups
Validator.validateGroups(instance, ['create']);
Validator.validateGroups(instance, ['update', 'registration']);
```

**Your Task**:
1. Add group support to validation rules
2. Implement group-based validation
3. Test different validation scenarios
4. Add group inheritance and composition

**Key Concepts**:
- Groups allow conditional validation based on context
- Rules can belong to multiple groups
- Group validation improves performance
- Scenarios define which groups to validate

### Step 8: Create Validation Utilities (15 minutes)

Build helper utilities for common validation needs:

```typescript
// Validation utilities
class ValidationUtils {
  static validateEmail(email: string): boolean;
  static validatePassword(password: string): ValidationResult;
  static validateCreditCard(cardNumber: string): boolean;
  static validatePhoneNumber(phone: string, country?: string): boolean;
}
```

**Your Task**:
1. Implement common validation utilities
2. Create pre-built validation rule sets
3. Add internationalization support for error messages
4. Build validation rule composition helpers

### Step 9: Advanced Error Handling and Reporting (10 minutes)

Enhance error handling and reporting:

```typescript
interface ValidationError {
  property: string;
  message: string;
  value: any;
  rule: string;
  target: any;
  timestamp: Date;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  errorsByProperty: Map<string, ValidationError[]>;
  summary: ValidationSummary;
}
```

**Your Task**:
1. Enhance error objects with detailed information
2. Create error grouping and summary features
3. Add error formatting utilities
4. Implement error translation support

### Step 10: Performance Optimization and Testing (15 minutes)

Optimize and thoroughly test your validation system:

**Your Task**:
1. Add metadata caching for better performance
2. Implement validation short-circuiting (fail-fast)
3. Create comprehensive test scenarios
4. Benchmark validation performance

## Expected Implementation Timeline

- **Step 1**: 10 minutes - Analyze existing code
- **Step 2**: 15 minutes - Understand metadata structure
- **Step 3**: 20 minutes - Master core decorators
- **Step 4**: 25 minutes - Advanced validation patterns
- **Step 5**: 30 minutes - Validation engine
- **Step 6**: 20 minutes - Async validation
- **Step 7**: 15 minutes - Validation groups
- **Step 8**: 15 minutes - Utility functions
- **Step 9**: 10 minutes - Error handling
- **Step 10**: 15 minutes - Optimization and testing

**Total Time**: ~3 hours

## Testing the Implementation

Run comprehensive tests to verify your implementation:

```bash
# Run validation decorator tests
npm test src/3-decorators-metadata/exercises/validation-decorators/

# Run specific test suites
npm test -- --grep "async validation"
npm test -- --grep "conditional validation"
npm test -- --grep "cross-property validation"

# Watch mode for development
npm test -- --watch src/3-decorators-metadata/exercises/validation-decorators/

# Type checking
npx tsc --noEmit src/3-decorators-metadata/exercises/validation-decorators/validation-decorators.ts
```

## Example Implementation Patterns

### Basic Validation Class
```typescript
class CreateUserDto {
  @Required('Name is required')
  @MinLength(2, 'Name must be at least 2 characters')
  @MaxLength(50, 'Name cannot exceed 50 characters')
  name: string = '';

  @Required('Email is required')
  @Email('Please provide a valid email address')
  @AsyncCustom(async (email) => {
    const exists = await checkEmailExists(email);
    return !exists || 'Email already exists';
  })
  email: string = '';

  @Required('Password is required')
  @MinLength(8, 'Password must be at least 8 characters')
  @Pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
  password: string = '';

  @Required('Confirm password is required')
  @MatchesProperty('password', 'Passwords do not match')
  confirmPassword: string = '';
}
```

### Complex Validation Scenarios
```typescript
class PaymentDto {
  @Required()
  amount: number = 0;

  @RequiredIf((target) => target.amount > 100)
  @Pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
  creditCardNumber: string = '';

  @ValidateIf((target) => target.creditCardNumber.length > 0)
  @Range(1, 12)
  expiryMonth: number = 0;

  @ValidateIf((target) => target.creditCardNumber.length > 0)
  @Range(2024, 2034)
  expiryYear: number = 0;
}
```

## Common Challenges and Solutions

### Challenge 1: Async Validation Coordination
**Problem**: Managing multiple async validations efficiently
**Solution**: 
- Use `Promise.all()` for parallel execution
- Implement timeout handling for slow validations
- Cache async validation results when appropriate

### Challenge 2: Cross-Property Validation
**Problem**: Accessing other properties during validation
**Solution**: 
- Pass entire object instance to validation functions
- Use property paths for nested object access
- Handle circular dependencies in validation logic

### Challenge 3: Performance with Many Rules
**Problem**: Validation becomes slow with many decorators
**Solution**: 
- Implement fail-fast validation for required rules
- Cache metadata lookups between validations
- Use validation groups to validate only necessary rules

### Challenge 4: Complex Error Messages
**Problem**: Providing meaningful, contextual error messages
**Solution**: 
- Use message templates with value interpolation
- Support internationalization for multi-language apps
- Provide both technical and user-friendly error formats

## Key Concepts to Master

1. **Rule Composition**: Multiple validation rules working together seamlessly
2. **Conditional Logic**: Validation rules that depend on object state
3. **Async Coordination**: Managing asynchronous validation operations
4. **Error Aggregation**: Collecting and organizing validation errors
5. **Performance Optimization**: Making validation fast and efficient
6. **Extensibility**: Allowing custom validation rules and behaviors

## Real-World Applications

Your validation system follows patterns used by:

- **class-validator**: Comprehensive validation decorators for TypeScript
- **Angular Forms**: Reactive and template-driven form validation
- **NestJS Validation**: DTO validation with ValidationPipe
- **Express Validator**: Middleware-based request validation
- **Joi/Yup**: Schema-based validation libraries

## Next Steps

After completing this exercise,

1. **Study class-validator source code** - See how professionals implement validation
2. **Integrate with web frameworks** - Use your validators in Express/NestJS apps
3. **Add database integration** - Validate before saving to database
4. **Move to Exercise 3** - Apply these patterns to HTTP routing systems

This exercise provides deep experience with the validation patterns that power modern web applications. Master these concepts to build robust, user-friendly applications with comprehensive data validation.