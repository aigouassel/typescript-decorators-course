import 'reflect-metadata';

/**
 * Exercise: Simple Metadata Decorator
 * 
 * Create your first decorator that works with metadata.
 * 
 * Requirements:
 * - Build a decorator that stores configuration metadata
 * - Access the metadata later to configure behavior
 * - Handle multiple decorators on the same target
 * - Create a simple validation system using metadata
 */

// ===== METADATA KEYS =====

export const METADATA_KEYS = {
  VALIDATION_REQUIRED: 'validation:required',
  VALIDATION_MIN_LENGTH: 'validation:minLength',
  VALIDATION_MAX_LENGTH: 'validation:maxLength',
  VALIDATION_PATTERN: 'validation:pattern',
  COLUMN_INFO: 'column:info',
  ENTITY_TABLE: 'entity:table',
} as const;

// ===== TODO: IMPLEMENT THESE DECORATORS =====

/**
 * Decorator to mark a property as required
 */
export function Required(target: any, propertyKey: string): void {
  // TODO: Store metadata indicating this property is required
  // Use METADATA_KEYS.VALIDATION_REQUIRED
  console.log(`@Required applied to ${propertyKey}`);
}

/**
 * Decorator factory to set minimum length validation
 */
export function MinLength(length: number) {
  return function (target: any, propertyKey: string): void {
    // TODO: Store minimum length metadata
    // Use METADATA_KEYS.VALIDATION_MIN_LENGTH
    console.log(`@MinLength(${length}) applied to ${propertyKey}`);
  };
}

/**
 * Decorator factory to set maximum length validation
 */
export function MaxLength(length: number) {
  return function (target: any, propertyKey: string): void {
    // TODO: Store maximum length metadata
    // Use METADATA_KEYS.VALIDATION_MAX_LENGTH
    console.log(`@MaxLength(${length}) applied to ${propertyKey}`);
  };
}

/**
 * Decorator factory to set pattern validation
 */
export function Pattern(regex: RegExp, message?: string) {
  return function (target: any, propertyKey: string): void {
    // TODO: Store pattern validation metadata
    // Store both regex and optional message
    console.log(`@Pattern applied to ${propertyKey}`);
  };
}

/**
 * Decorator factory for database column configuration
 */
export interface ColumnOptions {
  name?: string;
  type?: string;
  length?: number;
  nullable?: boolean;
  unique?: boolean;
}

export function Column(options: ColumnOptions = {}) {
  return function (target: any, propertyKey: string): void {
    // TODO: Store column configuration metadata
    // Use METADATA_KEYS.COLUMN_INFO
    const columnInfo = {
      name: options.name || propertyKey,
      type: options.type || 'varchar',
      length: options.length,
      nullable: options.nullable ?? true,
      unique: options.unique ?? false,
      propertyName: propertyKey
    };
    
    console.log(`@Column applied to ${propertyKey} with options:`, columnInfo);
  };
}

/**
 * Class decorator for entity table name
 */
export function Entity(tableName: string) {
  return function <T extends new(...args: any[]) => {}>(constructor: T): T {
    // TODO: Store table name metadata on the class
    // Use METADATA_KEYS.ENTITY_TABLE
    console.log(`@Entity('${tableName}') applied to ${constructor.name}`);
    return constructor;
  };
}

// ===== TODO: IMPLEMENT VALIDATION FUNCTIONS =====

export interface ValidationError {
  property: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate an object using stored metadata
 */
export function validate(instance: any): ValidationResult {
  const errors: ValidationError[] = [];
  const target = instance.constructor.prototype;
  
  // TODO: Get all property names and check their validation metadata
  const propertyNames = Object.getOwnPropertyNames(target);
  
  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') continue;
    
    const value = instance[propertyName];
    
    // TODO: Check required validation
    const isRequired = Reflect.getMetadata(METADATA_KEYS.VALIDATION_REQUIRED, target, propertyName);
    if (isRequired && (value === undefined || value === null || value === '')) {
      errors.push({
        property: propertyName,
        message: `${propertyName} is required`,
        value
      });
    }
    
    // TODO: Check min length validation
    const minLength = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, target, propertyName);
    if (minLength && typeof value === 'string' && value.length < minLength) {
      errors.push({
        property: propertyName,
        message: `${propertyName} must be at least ${minLength} characters`,
        value
      });
    }
    
    // TODO: Check max length validation
    const maxLength = Reflect.getMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, target, propertyName);
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
      errors.push({
        property: propertyName,
        message: `${propertyName} must be no more than ${maxLength} characters`,
        value
      });
    }
    
    // TODO: Check pattern validation
    const patternData = Reflect.getMetadata(METADATA_KEYS.VALIDATION_PATTERN, target, propertyName);
    if (patternData && typeof value === 'string') {
      const { regex, message = `${propertyName} format is invalid` } = patternData;
      if (!regex.test(value)) {
        errors.push({
          property: propertyName,
          message,
          value
        });
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get column information from metadata
 */
export function getColumnInfo(target: any, propertyKey: string): ColumnOptions | undefined {
  // TODO: Retrieve column metadata for the property
  return Reflect.getMetadata(METADATA_KEYS.COLUMN_INFO, target, propertyKey);
}

/**
 * Get entity table name from metadata
 */
export function getTableName(entityClass: any): string | undefined {
  // TODO: Retrieve table name metadata from the class
  return Reflect.getMetadata(METADATA_KEYS.ENTITY_TABLE, entityClass);
}

/**
 * Get all properties with validation metadata
 */
export function getValidatedProperties(target: any): string[] {
  const properties: string[] = [];
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') continue;
    
    // Check if property has any validation metadata
    const hasRequired = Reflect.hasMetadata(METADATA_KEYS.VALIDATION_REQUIRED, target.prototype, propertyName);
    const hasMinLength = Reflect.hasMetadata(METADATA_KEYS.VALIDATION_MIN_LENGTH, target.prototype, propertyName);
    const hasMaxLength = Reflect.hasMetadata(METADATA_KEYS.VALIDATION_MAX_LENGTH, target.prototype, propertyName);
    const hasPattern = Reflect.hasMetadata(METADATA_KEYS.VALIDATION_PATTERN, target.prototype, propertyName);
    
    if (hasRequired || hasMinLength || hasMaxLength || hasPattern) {
      properties.push(propertyName);
    }
  }
  
  return properties;
}

// ===== TEST CLASSES =====

@Entity('users')
export class User {
  @Required
  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  @MinLength(2)
  @MaxLength(50)
  name: string = '';
  
  @Required
  @Column({ name: 'email_address', type: 'varchar', length: 255, unique: true })
  @Pattern(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, 'Invalid email format')
  email: string = '';
  
  @Column({ name: 'age', type: 'integer' })
  age: number = 0;
  
  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean = true;
  
  constructor(name: string = '', email: string = '') {
    this.name = name;
    this.email = email;
  }
}

@Entity('products')
export class Product {
  @Required
  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  @MinLength(1)
  @MaxLength(100)
  name: string = '';
  
  @Required
  @Column({ name: 'price', type: 'decimal' })
  price: number = 0;
  
  @Column({ name: 'description', type: 'text', nullable: true })
  @MaxLength(1000)
  description: string = '';
  
  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string = '';
  
  constructor(name: string = '', price: number = 0) {
    this.name = name;
    this.price = price;
  }
}

// ===== DEMONSTRATION FUNCTIONS =====

export function demonstrateValidation(): void {
  console.log('=== Validation Demonstration ===\n');
  
  // Test valid user
  console.log('1. Valid User:');
  const validUser = new User('John Doe', 'john@example.com');
  const validResult = validate(validUser);
  console.log('Valid user result:', validResult);
  
  // Test invalid user
  console.log('\n2. Invalid User:');
  const invalidUser = new User('', 'invalid-email');
  const invalidResult = validate(invalidUser);
  console.log('Invalid user result:', invalidResult);
  
  // Test partially valid user
  console.log('\n3. Partially Valid User:');
  const partialUser = new User('A', 'user@example.com'); // Name too short
  const partialResult = validate(partialUser);
  console.log('Partial user result:', partialResult);
}

export function demonstrateColumnMetadata(): void {
  console.log('=== Column Metadata Demonstration ===\n');
  
  // Get table names
  console.log('1. Entity Table Names:');
  console.log('User table:', getTableName(User));
  console.log('Product table:', getTableName(Product));
  
  // Get column information
  console.log('\n2. Column Information:');
  console.log('User.name column:', getColumnInfo(User.prototype, 'name'));
  console.log('User.email column:', getColumnInfo(User.prototype, 'email'));
  console.log('Product.name column:', getColumnInfo(Product.prototype, 'name'));
  console.log('Product.price column:', getColumnInfo(Product.prototype, 'price'));
  
  // Get validated properties
  console.log('\n3. Validated Properties:');
  console.log('User validated properties:', getValidatedProperties(User));
  console.log('Product validated properties:', getValidatedProperties(Product));
}

export function demonstrateMetadataDecorators(): void {
  console.log('=== Simple Metadata Decorators ===\n');
  
  demonstrateValidation();
  console.log('');
  demonstrateColumnMetadata();
}

// Uncomment to run the demonstration
// demonstrateMetadataDecorators();