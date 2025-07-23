import 'reflect-metadata';

/**
 * Exercise 3: Metadata Inheritance
 * Difficulty: ⭐⭐⭐⭐☆
 * 
 * Handle metadata in class hierarchies with proper inheritance rules.
 * 
 * Requirements:
 * - Implement metadata inheritance from parent classes
 * - Support metadata overriding in child classes
 * - Handle multiple inheritance scenarios
 * - Provide metadata merging strategies
 * - Optimize metadata lookup performance
 */

// ===== SOLUTION =====

interface MetadataConfig {
  key: string;
  target: any;
  propertyKey?: string;
  inherited?: boolean;
  strategy?: 'override' | 'merge' | 'append';
}

interface InheritanceOptions {
  strategy: 'override' | 'merge' | 'append';
  deep?: boolean;
}

const INHERITANCE_CONFIG_KEY = 'metadata:inheritance:config';
const METADATA_CACHE = new Map<string, any>();

// Metadata inheritance decorators
export function Inheritable(options: InheritanceOptions = { strategy: 'override' }) {
  return function (target: any, propertyKey?: string) {
    const key = INHERITANCE_CONFIG_KEY;
    const existingConfig: InheritanceOptions[] = Reflect.getMetadata(key, target, propertyKey) || [];
    existingConfig.push(options);
    Reflect.defineMetadata(key, existingConfig, target, propertyKey);
  };
}

export function MetadataInheritance(key: string, strategy: 'override' | 'merge' | 'append' = 'override') {
  return function (target: any, propertyKey?: string) {
    const config: MetadataConfig = {
      key,
      target,
      propertyKey,
      inherited: true,
      strategy
    };
    
    const configKey = `metadata:config:${key}`;
    Reflect.defineMetadata(configKey, config, target, propertyKey);
  };
}

// Main inheritance manager
export class MetadataInheritanceManager {
  
  // Get metadata with inheritance support
  static getInheritedMetadata<T = any>(
    key: string, 
    target: any, 
    propertyKey?: string,
    strategy: 'override' | 'merge' | 'append' = 'override'
  ): T | undefined {
    const cacheKey = this.generateCacheKey(key, target, propertyKey, strategy);
    
    if (METADATA_CACHE.has(cacheKey)) {
      return METADATA_CACHE.get(cacheKey);
    }
    
    const result = this.computeInheritedMetadata<T>(key, target, propertyKey, strategy);
    METADATA_CACHE.set(cacheKey, result);
    
    return result;
  }
  
  private static computeInheritedMetadata<T>(
    key: string,
    target: any,
    propertyKey?: string,
    strategy: 'override' | 'merge' | 'append' = 'override'
  ): T | undefined {
    const metadataChain = this.collectMetadataChain<T>(key, target, propertyKey);
    
    if (metadataChain.length === 0) {
      return undefined;
    }
    
    if (metadataChain.length === 1) {
      return metadataChain[0];
    }
    
    return this.mergeMetadata<T>(metadataChain, strategy);
  }
  
  // Collect metadata from the entire inheritance chain
  private static collectMetadataChain<T>(
    key: string,
    target: any,
    propertyKey?: string
  ): T[] {
    const metadataChain: T[] = [];
    let currentTarget = target;
    
    // For property metadata, start with the prototype
    if (propertyKey && currentTarget.prototype) {
      currentTarget = currentTarget.prototype;
    }
    
    while (currentTarget && currentTarget !== Object.prototype) {
      const metadata = Reflect.getOwnMetadata(key, currentTarget, propertyKey);
      if (metadata !== undefined) {
        metadataChain.push(metadata);
      }
      
      currentTarget = Object.getPrototypeOf(currentTarget);
    }
    
    return metadataChain.reverse(); // Reverse to have base class first
  }
  
  // Merge metadata according to strategy
  private static mergeMetadata<T>(
    metadataChain: T[],
    strategy: 'override' | 'merge' | 'append'
  ): T {
    if (metadataChain.length === 0) {
      return undefined as any;
    }
    
    if (metadataChain.length === 1) {
      return metadataChain[0];
    }
    
    switch (strategy) {
      case 'override':
        return metadataChain[metadataChain.length - 1]; // Return most derived
      
      case 'merge':
        return this.mergeObjects(metadataChain);
      
      case 'append':
        return this.appendArrays(metadataChain);
      
      default:
        return metadataChain[metadataChain.length - 1];
    }
  }
  
  private static mergeObjects<T>(objects: T[]): T {
    if (objects.length === 0) return undefined as any;
    if (objects.length === 1) return objects[0];
    
    const result = {} as T;
    
    for (const obj of objects) {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        Object.assign(result, obj);
      }
    }
    
    return result;
  }
  
  private static appendArrays<T>(arrays: T[]): T {
    const result: any[] = [];
    
    for (const item of arrays) {
      if (Array.isArray(item)) {
        result.push(...item);
      } else if (item !== undefined) {
        result.push(item);
      }
    }
    
    return result as any;
  }
  
  // Get all inherited properties with metadata
  static getInheritedPropertiesMetadata<T = any>(
    key: string,
    target: any,
    strategy: 'override' | 'merge' | 'append' = 'override'
  ): Map<string, T> {
    const result = new Map<string, T>();
    const processedProperties = new Set<string>();
    let currentTarget = target.prototype || target;
    
    while (currentTarget && currentTarget !== Object.prototype) {
      const propertyNames = Object.getOwnPropertyNames(currentTarget);
      
      for (const propertyName of propertyNames) {
        if (propertyName === 'constructor' || processedProperties.has(propertyName)) {
          continue;
        }
        
        const metadata = this.getInheritedMetadata<T>(key, target, propertyName, strategy);
        if (metadata !== undefined) {
          result.set(propertyName, metadata);
          processedProperties.add(propertyName);
        }
      }
      
      currentTarget = Object.getPrototypeOf(currentTarget);
    }
    
    return result;
  }
  
  // Clear metadata cache
  static clearCache(): void {
    METADATA_CACHE.clear();
  }
  
  // Generate cache key
  private static generateCacheKey(
    key: string,
    target: any,
    propertyKey?: string,
    strategy?: string
  ): string {
    const targetName = target.name || target.constructor?.name || 'unknown';
    return `${key}:${targetName}:${propertyKey || 'class'}:${strategy || 'default'}`;
  }
  
  // Debug: Show inheritance chain
  static debugInheritanceChain(target: any, propertyKey?: string): string[] {
    const chain: string[] = [];
    let currentTarget = propertyKey ? target.prototype || target : target;
    
    while (currentTarget && currentTarget !== Object.prototype) {
      const name = currentTarget.constructor?.name || currentTarget.name || 'Unknown';
      chain.push(name);
      currentTarget = Object.getPrototypeOf(currentTarget);
    }
    
    return chain;
  }
}

// Utility decorators for common metadata inheritance patterns
export function InheritableColumn(options: any, inheritanceStrategy: 'override' | 'merge' | 'append' = 'merge') {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('column', options, target, propertyKey);
    MetadataInheritance('column', inheritanceStrategy)(target, propertyKey);
  };
}

export function InheritableValidation(rules: any[], inheritanceStrategy: 'override' | 'merge' | 'append' = 'append') {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('validation', rules, target, propertyKey);
    MetadataInheritance('validation', inheritanceStrategy)(target, propertyKey);
  };
}

export function InheritableRoute(route: string, inheritanceStrategy: 'override' | 'merge' | 'append' = 'override') {
  return function (target: any, propertyKey?: string) {
    Reflect.defineMetadata('route', route, target, propertyKey);
    MetadataInheritance('route', inheritanceStrategy)(target, propertyKey);
  };
}

// ===== EXAMPLES =====

// Example 1: Basic inheritance with different strategies
class BaseEntity {
  @InheritableColumn({ type: 'int', primary: true }, 'merge')
  id: number;
  
  @InheritableColumn({ type: 'datetime', default: 'NOW()' }, 'merge')
  createdAt: Date;
  
  @InheritableValidation([{ type: 'required' }], 'append')
  name: string;
  
  constructor() {
    this.id = 0;
    this.createdAt = new Date();
    this.name = '';
  }
}

class User extends BaseEntity {
  @InheritableColumn({ type: 'varchar', length: 255, unique: true }, 'merge')
  email: string;
  
  @InheritableColumn({ type: 'varchar', length: 100 }, 'merge')
  name: string; // Overrides base name column metadata
  
  @InheritableValidation([{ type: 'email' }], 'append')
  email2: string; // Will inherit and append validation rules
  
  constructor() {
    super();
    this.email = '';
    this.email2 = '';
  }
}

class AdminUser extends User {
  @InheritableColumn({ type: 'varchar', length: 50, default: 'admin' }, 'merge')
  role: string;
  
  @InheritableColumn({ nullable: false }, 'merge') // Merges with inherited metadata
  name: string;
  
  @InheritableValidation([{ type: 'minLength', value: 8 }], 'append')
  name2: string;
  
  constructor() {
    super();
    this.role = 'admin';
    this.name2 = '';
  }
}

// Example 2: Multiple inheritance simulation with mixins
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
}

function TimestampedMixin<T extends new (...args: any[]) => {}>(Base: T) {
  class TimestampedClass extends Base implements Timestamped {
    @InheritableColumn({ type: 'datetime', default: 'NOW()' }, 'merge')
    createdAt: Date = new Date();
    
    @InheritableColumn({ type: 'datetime', onUpdate: 'NOW()' }, 'merge')
    updatedAt: Date = new Date();
  }
  
  return TimestampedClass;
}

function AuditableMixin<T extends new (...args: any[]) => {}>(Base: T) {
  class AuditableClass extends Base implements Auditable {
    @InheritableColumn({ type: 'varchar', length: 100 }, 'merge')
    createdBy: string = '';
    
    @InheritableColumn({ type: 'varchar', length: 100 }, 'merge')
    updatedBy: string = '';
  }
  
  return AuditableClass;
}

class Product extends AuditableMixin(TimestampedMixin(BaseEntity)) {
  @InheritableColumn({ type: 'varchar', length: 255 }, 'merge')
  name: string;
  
  @InheritableColumn({ type: 'decimal', precision: 10, scale: 2 }, 'merge')
  price: number;
  
  constructor() {
    super();
    this.name = '';
    this.price = 0;
  }
}

// Example 3: Complex inheritance with custom strategies
interface ValidationRule {
  type: string;
  value?: any;
  message?: string;
}

interface ColumnOptions {
  type: string;
  length?: number;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary?: boolean;
}

class ComplexBase {
  @Reflect.metadata('validation:rules', [
    { type: 'required', message: 'Base: Field is required' }
  ])
  baseField: string = '';
}

class ComplexMiddle extends ComplexBase {
  @Reflect.metadata('validation:rules', [
    { type: 'minLength', value: 5, message: 'Middle: Min 5 characters' }
  ])
  baseField: string = '';
  
  @Reflect.metadata('column:options', { type: 'varchar', length: 100 })
  middleField: string = '';
}

class ComplexDerived extends ComplexMiddle {
  @Reflect.metadata('validation:rules', [
    { type: 'pattern', value: /^[A-Z]/, message: 'Derived: Must start with uppercase' }
  ])
  baseField: string = '';
  
  @Reflect.metadata('column:options', { nullable: false, unique: true })
  middleField: string = '';
  
  @Reflect.metadata('permissions', ['read', 'write'])
  derivedField: string = '';
}

// ===== DEMO USAGE =====

function demonstrateMetadataInheritance() {
  console.log('=== Metadata Inheritance Demo ===\n');
  
  // Test 1: Basic inheritance with merge strategy
  console.log('1. AdminUser column metadata (merge strategy):');
  const adminUserNameColumn = MetadataInheritanceManager.getInheritedMetadata(
    'column', 
    AdminUser, 
    'name', 
    'merge'
  );
  console.log('AdminUser.name column metadata:', adminUserNameColumn);
  console.log();
  
  // Test 2: Validation rules with append strategy
  console.log('2. Validation rules inheritance (append strategy):');
  const validationRules = MetadataInheritanceManager.getInheritedMetadata<ValidationRule[]>(
    'validation:rules',
    ComplexDerived,
    'baseField',
    'append'
  );
  console.log('ComplexDerived.baseField validation rules:', validationRules);
  console.log();
  
  // Test 3: All properties metadata
  console.log('3. All inherited properties with column metadata:');
  const allColumns = MetadataInheritanceManager.getInheritedPropertiesMetadata<ColumnOptions>(
    'column',
    AdminUser,
    'merge'
  );
  console.log('AdminUser all columns:');
  allColumns.forEach((metadata, property) => {
    console.log(`  ${property}:`, metadata);
  });
  console.log();
  
  // Test 4: Multiple inheritance with mixins
  console.log('4. Product with mixed-in metadata:');
  const productColumns = MetadataInheritanceManager.getInheritedPropertiesMetadata<ColumnOptions>(
    'column',
    Product,
    'merge'
  );
  console.log('Product all columns (including mixins):');
  productColumns.forEach((metadata, property) => {
    console.log(`  ${property}:`, metadata);
  });
  console.log();
  
  // Test 5: Inheritance chain debugging
  console.log('5. Inheritance chain debugging:');
  const adminChain = MetadataInheritanceManager.debugInheritanceChain(AdminUser);
  const productChain = MetadataInheritanceManager.debugInheritanceChain(Product);
  console.log('AdminUser inheritance chain:', adminChain);
  console.log('Product inheritance chain:', productChain);
  console.log();
  
  // Test 6: Override vs merge vs append strategies
  console.log('6. Different inheritance strategies comparison:');
  
  const overrideResult = MetadataInheritanceManager.getInheritedMetadata(
    'column:options',
    ComplexDerived,
    'middleField',
    'override'
  );
  
  const mergeResult = MetadataInheritanceManager.getInheritedMetadata(
    'column:options',
    ComplexDerived,
    'middleField',
    'merge'
  );
  
  console.log('ComplexDerived.middleField - Override strategy:', overrideResult);
  console.log('ComplexDerived.middleField - Merge strategy:', mergeResult);
  console.log();
  
  // Test 7: Performance with caching
  console.log('7. Performance test with caching:');
  
  const startTime = Date.now();
  for (let i = 0; i < 1000; i++) {
    MetadataInheritanceManager.getInheritedMetadata('column', AdminUser, 'name', 'merge');
  }
  const endTime = Date.now();
  
  console.log(`1000 metadata lookups took ${endTime - startTime}ms (with caching)`);
  
  // Clear cache and test again
  MetadataInheritanceManager.clearCache();
  const startTime2 = Date.now();
  for (let i = 0; i < 100; i++) { // Fewer iterations for uncached
    MetadataInheritanceManager.getInheritedMetadata('column', AdminUser, 'name', 'merge');
  }
  const endTime2 = Date.now();
  
  console.log(`100 metadata lookups took ${endTime2 - startTime2}ms (without caching)`);
}

// Uncomment to run the demo
// demonstrateMetadataInheritance();