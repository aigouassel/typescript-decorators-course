# Part 3: Decorators + Metadata Integration Exercises

This directory contains practical exercises demonstrating how decorators and metadata work together to create powerful, declarative programming patterns used in professional frameworks.

## Prerequisites

Prerequisites for these exercises include:
- Completion of Part 1 (Decorators Fundamentals)
- Completion of Part 2 (Metadata Operations)
- Understanding of TypeScript generics and advanced types
- Familiarity with design patterns (Observer, Factory, Decorator)
- Reading the **THEORY.md** file for integration concepts

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
# Install reflect-metadata (should already be installed)
yarn add reflect-metadata
```

Each exercise file includes `import 'reflect-metadata';` at the top.

## Exercise Structure

Each exercise contains implementation files and comprehensive test suites. The specific files vary by exercise - check each exercise's README.md for the exact structure.

## Learning Progression

The exercises build upon each other in complexity and sophistication:

```
Foundation → Core Patterns → Web APIs → Performance → Advanced Theory
  (Basic)     (Practical)   (Familiar)   (Optimize)      (Master)
```

**Recommended Order**:
1. **Simple Metadata Integration** (Foundation) - Basic decorator-metadata patterns
2. **Validation Decorators** (Core) - Real-world validation system
3. **HTTP Routing** (Web APIs) - Familiar web framework patterns
4. **Performance Decorators** (Optimization) - Production-ready patterns
5. **Metadata Inheritance** (Theory) - Advanced inheritance concepts

## Exercise Overview

### 1. Simple Metadata Integration ⭐ FOUNDATION
**Directory**: `simple-metadata-integration/`
**Learning Focus**: Basic decorator-metadata patterns and integration
**Implementation Status**: Partial - Good foundation for hands-on learning

**Why Start Here**: This provides an introduction to how decorators store metadata and business logic reads it. Simple, clear examples of integration patterns.

**What This Builds**:
- Basic validation decorators that store rules as metadata
- Simple ORM-style decorators for database mapping
- Business logic that reads metadata to drive behavior
- Understanding of the decorator → metadata → execution flow

**Key Concepts**:
- Decorators as metadata writers
- Business logic as metadata readers
- Multiple decorators per property
- Metadata-driven validation patterns

**Time Estimate**: 2-3 hours

### 2. Validation Decorators 🔍 CORE PATTERN
**Directory**: `validation-decorators/`
**Learning Focus**: Build a complete validation system using decorators and metadata
**Implementation Status**: Well-implemented with comprehensive decorator system

**Why Do This Second**: This builds directly on the foundation exercise but creates a complete, real-world validation framework. This represents the most practical pattern in common use.

**What This Builds**:
- Comprehensive validation decorators (@Required, @MinLength, @Email, etc.)
- Metadata-driven validation engine that processes all rules
- Custom validation messages and error handling
- Support for conditional validation and custom validators

**Key Concepts**:
- Rule-based validation systems
- Metadata aggregation and processing
- Error handling and reporting
- Conditional validation logic

**Real-World Applications**: class-validator, Angular forms, custom validation frameworks

**Time Estimate**: 3-4 hours

### 3. HTTP Routing 🌐 WEB APIS
**Directory**: `http-routing/`
**Learning Focus**: Create HTTP route decorators for web APIs
**Implementation Status**: Complete implementation with route registration

**Why Do This Third**: This covers a familiar domain (REST APIs) with clear, practical applications. Shows how frameworks like NestJS and Express work internally.

**What This Builds**:
- HTTP method decorators (@Get, @Post, @Put, @Delete)
- Controller decorators for organizing routes
- Route registration system that reads metadata
- Path parameter and middleware integration

**Key Concepts**:
- Method decorators for HTTP routes
- Class decorators for controllers
- Route metadata extraction and registration
- Framework-style API design

**Real-World Applications**: NestJS, Express decorators, custom web frameworks

**Time Estimate**: 2-3 hours

### 4. Performance Decorators ⚡ OPTIMIZATION
**Directory**: `performance-decorators/`
**Learning Focus**: Study advanced metadata optimization patterns
**Implementation Status**: Nearly complete (775 lines) - Study reference implementation

**Why Study This Fifth**: This demonstrates how to optimize the patterns learned in exercises 1-4 for production use. Critical for understanding real-world performance concerns.

**What This Covers**:
- Metadata caching strategies and LRU cache implementation
- Lazy loading patterns for expensive metadata operations
- Performance monitoring and metrics collection for decorator systems
- Batch processing and memory optimization techniques

**Key Concepts**:
- Metadata performance optimization
- Caching strategies and cache invalidation
- Lazy loading and dependency tracking
- Production performance monitoring

**Real-World Applications**: Angular's metadata caching, framework optimization patterns

**Time Estimate**: 3-4 hours (studying + extending)

### 5. Metadata Inheritance 🧬 ADVANCED THEORY
**Directory**: `metadata-inheritance/`
**Learning Focus**: Handle metadata inheritance in complex class hierarchies  
**Implementation Status**: Complete with sophisticated inheritance strategies

**Why Do This Last**: This represents the most advanced exercise requiring deep understanding of JavaScript's prototype system and complex metadata resolution.

**What This Covers**:
- Metadata inheritance from parent classes to children
- Merge strategies (override, merge, concatenate) for inherited metadata
- Performance optimization for inheritance chains
- Complex metadata resolution with caching

**Key Concepts**:
- Prototype chain metadata resolution
- Inheritance strategy patterns
- Performance optimization for deep hierarchies
- Advanced caching and memoization

**Real-World Applications**: Angular component inheritance, framework base classes, complex ORM hierarchies

**Time Estimate**: 4-5 hours

## Running Tests

### All Exercises
```bash
npm test src/3-decorators-metadata/exercises/
```

### Individual Exercise
```bash
npm test src/3-decorators-metadata/exercises/validation-decorators/validation-decorators.test.ts
```

### Watch Mode (for development)
```bash
npm test -- --watch src/3-decorators-metadata/exercises/validation-decorators/
```

### TypeScript Compilation Check
```bash
npx tsc --noEmit src/3-decorators-metadata/exercises/validation-decorators/validation-decorators.ts
```

## Common Integration Patterns

### Basic Decorator-Metadata Pattern
```typescript
import 'reflect-metadata';

// Decorator stores metadata
function ConfigProperty(key: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('config:key', key, target, propertyKey);
  };
}

// Business logic reads metadata
function loadConfiguration(instance: any) {
  const constructor = instance.constructor;
  const properties = Object.getOwnPropertyNames(constructor.prototype);
  
  for (const prop of properties) {
    const configKey = Reflect.getMetadata('config:key', constructor.prototype, prop);
    if (configKey) {
      instance[prop] = process.env[configKey];
    }
  }
}
```

### Validation System Pattern
```typescript
// Store validation rules
function Required(target: any, propertyKey: string) {
  const rules = Reflect.getMetadata('validation:rules', target, propertyKey) || [];
  rules.push({ type: 'required' });
  Reflect.defineMetadata('validation:rules', rules, target, propertyKey);
}

// Execute validation
function validate(instance: any): ValidationResult {
  const errors: ValidationError[] = [];
  const properties = Object.getOwnPropertyNames(instance.constructor.prototype);
  
  for (const prop of properties) {
    const rules = Reflect.getMetadata('validation:rules', instance.constructor.prototype, prop);
    if (rules) {
      // Execute validation rules and collect errors
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Real-World Inspiration

After completing these 6 core exercises, consider exploring these additional patterns in your own projects:

### **Configuration Management** 🔧
*Pattern seen in frameworks like NestJS configuration modules*
- Environment variable binding with type conversion
- Nested configuration objects with validation
- Hot-reload configuration with metadata updates

### **Event-Driven Systems** 📡
*Pattern seen in frameworks like Angular's event handling*
- Event handler registration with metadata
- Event filtering and priority systems
- Async event processing with error handling

### **Data Serialization** 🔄
*Pattern seen in libraries like class-transformer*
- JSON serialization with metadata-driven transformations
- Serialization groups and conditional serialization
- Custom transformers and validation integration

### **API Documentation Generation** 📚
*Pattern seen in tools like NestJS/Swagger integration*
- Automatic OpenAPI spec generation from decorators
- Parameter and response type extraction
- Documentation metadata and example generation

### **Dependency Injection Systems** 🏗️
*Pattern seen in frameworks like Angular and NestJS*
- Service registration and resolution with metadata
- Constructor and property injection patterns
- Scoped services and circular dependency detection

### **Plugin Architecture** 🔌
*Pattern seen in extensible frameworks*
- Plugin discovery and registration via metadata
- Plugin lifecycle management and dependencies
- Hot-swappable plugin systems with metadata

### **Data Transformation Pipelines** ⚙️
*Pattern seen in data processing frameworks*
- Pipeline stage definition with decorators
- Data flow control and transformation chains
- Error handling and recovery in pipelines

### **Advanced Caching Systems** 🚀
*Pattern seen in production optimization*
- Method-level caching with metadata configuration
- Cache invalidation strategies based on metadata
- Distributed caching with decorator-driven keys

## Best Practices During Implementation

### Decorator Design
1. **Single Responsibility**: Each decorator should have one clear purpose
2. **Composability**: Design decorators to work well together
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

## Testing Strategy

Each exercise includes comprehensive tests that verify:
- **Decorator Functionality**: Decorators work correctly and store proper metadata
- **Integration Patterns**: Decorators and metadata work together seamlessly
- **Edge Cases**: Error conditions and boundary cases are handled
- **Performance**: Systems perform well under load
- **Type Safety**: TypeScript types are preserved and enforced

## Next Steps

After mastering decorator-metadata integration, next steps include:
1. **Build Real Applications**: Applying these patterns to actual projects
2. **Create Frameworks**: Building custom decorator-based frameworks and libraries
3. **Contribute to Open Source**: Contributing to existing metadata-driven libraries
4. **Advanced TypeScript**: Exploring advanced TypeScript features for better decorator typing

## Additional Resources

- **Theory Guide**: See `THEORY.md` for comprehensive conceptual understanding
- **API Reference**: See `REFERENCE.md` for quick lookup during implementation  
- **TypeScript Handbook**: [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- **Framework Examples**: Study NestJS, Angular, and TypeORM for real-world examples

These exercises provide hands-on experience with the most powerful aspects of TypeScript decorators and metadata, preparing you to build sophisticated, declarative applications and frameworks.