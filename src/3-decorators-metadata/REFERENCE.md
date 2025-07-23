# Part 3: Decorators + Metadata Integration - API Reference

## Quick API Lookup

This reference provides function signatures and essential information for decorator-metadata integration patterns. For conceptual understanding, see **THEORY.md**. For step-by-step implementation, see **EXERCISES.md**.

## Core Patterns

### Basic Decorator-Metadata Pattern
```typescript
// Store metadata in decorator
function MyDecorator(config: any) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('my:key', config, target, propertyKey);
  };
}

// Read metadata in business logic
function processMetadata(instance: any) {
  const target = instance.constructor.prototype;
  const metadata = Reflect.getMetadata('my:key', target, 'propertyName');
  // Process metadata...
}
```

### Metadata Aggregation Pattern
```typescript
// Add to existing metadata array
function addToMetadataArray(key: string, value: any, target: any, propertyKey?: string) {
  const existing: any[] = Reflect.getMetadata(key, target, propertyKey) || [];
  existing.push(value);
  Reflect.defineMetadata(key, existing, target, propertyKey);
}
```

## Validation System API

### Validation Decorators
```typescript
// Basic validation decorators
@Required(message?: string)
@MinLength(length: number, message?: string)
@MaxLength(length: number, message?: string)
@Email(message?: string)
@Range(min: number, max: number, message?: string)
@Pattern(regex: RegExp, message?: string)
@Custom(validator: (value: any, target: any) => boolean | string, message?: string)

// Conditional validation
@RequiredIf(condition: (target: any) => boolean)
@ValidateIf(condition: (target: any) => boolean)
```

### Validation Engine
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  property: string;
  message: string;
  value: any;
}

class Validator {
  static validate(instance: any): ValidationResult;
  static validateProperty(instance: any, propertyName: string): ValidationError[];
}
```

## HTTP Routing API

### Route Decorators
```typescript
// HTTP method decorators
@Get(path?: string)
@Post(path?: string)
@Put(path?: string)
@Delete(path?: string)
@Patch(path?: string)
@Head(path?: string)
@Options(path?: string)

// Controller decorator
@Controller(basePath?: string)

// Middleware decorators
@UseMiddleware(...middleware: Function[])
@UseBefore(middleware: Function)
@UseAfter(middleware: Function)
```

### Route Registration
```typescript
interface RouteMetadata {
  method: string;
  path: string;
  middleware?: Function[];
  description?: string;
}

function registerRoutes(controllerClass: any, app: any): void;
function extractRoutes(controllerClass: any): RouteMetadata[];
```

## Performance Optimization API

### Caching System
```typescript
class MetadataCache {
  constructor(maxSize?: number, ttl?: number);
  get<T>(key: string, factory: () => T): T;
  set(key: string, value: any): void;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

// Cache decorators
@Cached(ttl?: number, key?: string)
@InvalidateCache(keys: string[])
@CacheWarm(factory: () => any)
```

### Performance Monitoring
```typescript
class PerformanceMonitor {
  static measure<T>(operation: string, fn: () => T): T;
  static getMetrics(): Map<string, PerformanceMetrics>;
  static clearMetrics(): void;
}

interface PerformanceMetrics {
  calls: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  lastCall: number;
}
```

### Lazy Loading
```typescript
@LazyLoad(loader: () => Promise<any>)
@LazyInit(initializer: () => any)

class LazyMetadataLoader {
  static load<T>(key: string, loader: () => Promise<T>): Promise<T>;
  static preload(keys: string[]): Promise<void>;
}
```

## Metadata Inheritance API

### Inheritance Utilities
```typescript
class MetadataInheritanceManager {
  static getInheritedMetadata<T>(
    key: string,
    target: any,
    propertyKey?: string,
    strategy?: 'override' | 'merge' | 'concat'
  ): T | undefined;
  
  static getAllInheritedMetadata<T>(
    key: string,
    target: any,
    propertyKey?: string
  ): T[];
  
  static clearCache(): void;
}

// Inheritance strategy decorators
@InheritMetadata(strategy: 'override' | 'merge' | 'concat')
@NoInherit()
@InheritOnly(keys: string[])
```

### Merge Strategies
```typescript
type MergeStrategy = 'override' | 'merge' | 'concat';

interface InheritanceOptions {
  strategy: MergeStrategy;
  keys?: string[];
  condition?: (metadata: any) => boolean;
}
```

## Advanced Patterns API

### Event-Driven Decorators
```typescript
@EventHandler(eventName: string, priority?: number)
@EventEmitter(eventName: string)
@EventListener(events: string[], options?: ListenerOptions)

interface ListenerOptions {
  once?: boolean;
  priority?: number;
  condition?: (event: any) => boolean;
}
```

### Plugin System
```typescript
@Plugin(metadata: PluginMetadata)
@PluginHook(name: string, priority?: number)
@ExtensionPoint(name: string, options?: ExtensionOptions)

interface PluginMetadata {
  name: string;
  version: string;
  dependencies?: string[];
  provides?: string[];
  requires?: string[];
}
```

### Configuration Management
```typescript
@ConfigProperty(options: ConfigPropertyOptions)
@Configuration(prefix?: string)

interface ConfigPropertyOptions {
  key?: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  default?: any;
  validation?: (value: any) => boolean | string;
}

class ConfigLoader {
  static load<T>(ConfigClass: new() => T, source?: Record<string, any>): T;
  static validate<T>(ConfigClass: new() => T, config: T): ValidationResult;
}
```

## Utility Functions

### Metadata Helpers
```typescript
// Common metadata operations
function defineMetadata(key: string, value: any, target: any, propertyKey?: string): void;
function getMetadata<T>(key: string, target: any, propertyKey?: string): T | undefined;
function hasMetadata(key: string, target: any, propertyKey?: string): boolean;
function deleteMetadata(key: string, target: any, propertyKey?: string): boolean;
function getMetadataKeys(target: any, propertyKey?: string): string[];

// Property discovery
function getDecoratedProperties(target: any, metadataKey?: string): string[];
function getDecoratedMethods(target: any, metadataKey?: string): string[];
function getAllDecoratedMembers(target: any): { properties: string[]; methods: string[] };
```

### Type Utilities
```typescript
// Design-time type metadata
function getDesignType(target: any, propertyKey: string): any;
function getDesignParamTypes(target: any, propertyKey: string): any[];
function getDesignReturnType(target: any, propertyKey: string): any;

// Runtime type checking
function isValidType(value: any, expectedType: any): boolean;
function convertType(value: any, targetType: any): any;
function getTypeInfo(value: any): TypeInfo;

interface TypeInfo {
  type: string;
  constructor: Function;
  isArray: boolean;
  isObject: boolean;
  isPrimitive: boolean;
}
```

### Reflection Utilities
```typescript
// Class introspection
function getClassName(target: any): string;
function getClassMetadata<T>(target: any, key: string): T | undefined;
function getInheritanceChain(target: any): Function[];
function getImplementedInterfaces(target: any): Function[];

// Property introspection
function getPropertyDescriptor(target: any, propertyKey: string): PropertyDescriptor | undefined;
function getPropertyMetadata<T>(target: any, propertyKey: string, key: string): T | undefined;
function isMethodProperty(target: any, propertyKey: string): boolean;
function isDataProperty(target: any, propertyKey: string): boolean;
```

## Framework Integration

### Express.js Integration
```typescript
// Express route registration
function registerExpressRoutes(app: Express, controllers: Function[]): void;
function createExpressMiddleware(decoratorMetadata: any): RequestHandler;
```

### Validation Integration
```typescript
// class-validator compatibility
function createClassValidatorDecorator(validator: any): PropertyDecorator;
function convertToClassValidator(metadata: ValidationMetadata): any;
```

### Database Integration
```typescript
// TypeORM compatibility
function createTypeORMDecorator(options: any): PropertyDecorator;
function convertToTypeORM(metadata: EntityMetadata): any;
```

## Error Handling

### Common Error Types
```typescript
class MetadataError extends Error {
  constructor(message: string, key: string, target: any);
}

class ValidationError extends Error {
  constructor(message: string, property: string, value: any);
}

class InheritanceError extends Error {
  constructor(message: string, target: any, parent: any);
}

class ConfigurationError extends Error {
  constructor(message: string, configKey: string, value: any);
}
```

### Error Handling Utilities
```typescript
function handleMetadataError(error: Error, context: any): void;
function isMetadataError(error: Error): boolean;
function createErrorHandler(options: ErrorHandlerOptions): Function;

interface ErrorHandlerOptions {
  logErrors?: boolean;
  throwOnError?: boolean;
  defaultValue?: any;
  customHandler?: (error: Error) => any;
}
```

## TypeScript Support

### Type-Safe Decorators
```typescript
// Generic decorator types
type PropertyDecorator<T = any> = (target: any, propertyKey: string) => void;
type MethodDecorator<T = any> = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor | void;
type ClassDecorator<T = any> = <TFunction extends Function>(target: TFunction) => TFunction | void;
type ParameterDecorator<T = any> = (target: any, propertyKey: string, parameterIndex: number) => void;

// Metadata type constraints
interface MetadataConstraints<T> {
  key: string;
  type: new() => T;
  required?: boolean;
  validator?: (value: T) => boolean;
}
```

### Compile-Time Validation
```typescript
// Type-safe metadata access
function getTypedMetadata<T>(
  key: string,
  type: new() => T,
  target: any,
  propertyKey?: string
): T | undefined;

function setTypedMetadata<T>(
  key: string,
  value: T,
  type: new() => T,
  target: any,
  propertyKey?: string
): void;
```

## Resources

- **reflect-metadata documentation**: [GitHub](https://github.com/rbuckton/reflect-metadata)
- **TypeScript Decorators**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/decorators.html)
- **Design-time type information**: [TypeScript Handbook - Metadata](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata)
- **Real-world examples**: Study NestJS, Angular, TypeORM, and class-validator source code

## Performance Considerations

### Best Practices
- Cache metadata lookups for frequently accessed data
- Use lazy loading for expensive metadata operations
- Minimize metadata storage size and complexity
- Batch metadata operations when possible
- Clear unused metadata to prevent memory leaks

### Optimization Techniques
- Implement LRU caching for metadata access
- Use weak references for temporary metadata
- Compress large metadata objects
- Index metadata for faster lookups
- Profile metadata performance in production

This reference covers the essential APIs and patterns for decorator-metadata integration. Use it alongside the practical exercises to build robust, metadata-driven applications.