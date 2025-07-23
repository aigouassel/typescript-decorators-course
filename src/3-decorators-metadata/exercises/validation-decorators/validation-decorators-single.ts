import 'reflect-metadata';

/**
 * Exercise 1: Validation System
 * Difficulty: ⭐⭐⭐☆☆
 * 
 * Build a complete metadata-driven validation framework.
 * 
 * Requirements:
 * - Create validators using metadata decorators
 * - Support multiple validation rules per property
 * - Handle custom validation functions
 * - Provide detailed error messages with property paths
 * - Support async validation
 */

// ===== SOLUTION =====

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'custom' | 'async';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

interface ValidationError {
  property: string;
  value: any;
  constraint: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const VALIDATION_KEY = 'validation:rules';

// Base validation rule decorator
function addValidationRule(rule: ValidationRule) {
  return function (target: any, propertyKey: string) {
    const existingRules: ValidationRule[] = Reflect.getMetadata(VALIDATION_KEY, target, propertyKey) || [];
    existingRules.push(rule);
    Reflect.defineMetadata(VALIDATION_KEY, existingRules, target, propertyKey);
  };
}

// Validation decorators
export function Required(message?: string) {
  return addValidationRule({ 
    type: 'required', 
    message: message || 'This field is required' 
  });
}

export function MinLength(length: number, message?: string) {
  return addValidationRule({ 
    type: 'minLength', 
    value: length, 
    message: message || `Must be at least ${length} characters long` 
  });
}

export function MaxLength(length: number, message?: string) {
  return addValidationRule({ 
    type: 'maxLength', 
    value: length, 
    message: message || `Must be no more than ${length} characters long` 
  });
}

export function Pattern(regex: RegExp, message?: string) {
  return addValidationRule({ 
    type: 'pattern', 
    value: regex, 
    message: message || 'Invalid format' 
  });
}

export function Min(min: number, message?: string) {
  return addValidationRule({ 
    type: 'min', 
    value: min, 
    message: message || `Must be at least ${min}` 
  });
}

export function Max(max: number, message?: string) {
  return addValidationRule({ 
    type: 'max', 
    value: max, 
    message: message || `Must be no more than ${max}` 
  });
}

export function Custom(validator: (value: any) => boolean, message?: string) {
  return addValidationRule({ 
    type: 'custom', 
    validator, 
    message: message || 'Validation failed' 
  });
}

export function AsyncValidation(validator: (value: any) => Promise<boolean>, message?: string) {
  return addValidationRule({ 
    type: 'async', 
    validator, 
    message: message || 'Async validation failed' 
  });
}

// Main validator class
export class Validator {
  static async validate(obj: any, propertyPath = ''): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const target = obj.constructor.prototype;
    
    // Get all property names including inherited ones
    const propertyNames = this.getAllPropertyNames(obj);
    
    for (const propertyKey of propertyNames) {
      const rules: ValidationRule[] = Reflect.getMetadata(VALIDATION_KEY, target, propertyKey) || [];
      const value = obj[propertyKey];
      const fullPropertyPath = propertyPath ? `${propertyPath}.${propertyKey}` : propertyKey;
      
      for (const rule of rules) {
        const isValid = await this.validateRule(value, rule);
        if (!isValid) {
          errors.push({
            property: fullPropertyPath,
            value,
            constraint: rule.type,
            message: rule.message || `Validation failed for ${fullPropertyPath}`
          });
        }
      }
      
      // Recursively validate nested objects
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const nestedResult = await this.validate(value, fullPropertyPath);
        errors.push(...nestedResult.errors);
      }
      
      // Validate array elements
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (item && typeof item === 'object' && !(item instanceof Date)) {
            const nestedResult = await this.validate(item, `${fullPropertyPath}[${i}]`);
            errors.push(...nestedResult.errors);
          }
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  private static async validateRule(value: any, rule: ValidationRule): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
      
      case 'minLength':
        if (typeof value !== 'string' && !Array.isArray(value)) return true;
        return value.length >= rule.value;
      
      case 'maxLength':
        if (typeof value !== 'string' && !Array.isArray(value)) return true;
        return value.length <= rule.value;
      
      case 'pattern':
        if (typeof value !== 'string') return true;
        return rule.value.test(value);
      
      case 'min':
        if (typeof value !== 'number') return true;
        return value >= rule.value;
      
      case 'max':
        if (typeof value !== 'number') return true;
        return value <= rule.value;
      
      case 'custom':
        if (!rule.validator) return true;
        return rule.validator(value);
      
      case 'async':
        if (!rule.validator) return true;
        return await rule.validator(value);
      
      default:
        return true;
    }
  }
  
  private static getAllPropertyNames(obj: any): string[] {
    const propertyNames = new Set<string>();
    let currentObj = obj;
    
    do {
      Object.getOwnPropertyNames(currentObj).forEach(name => {
        if (name !== 'constructor') {
          propertyNames.add(name);
        }
      });
      currentObj = Object.getPrototypeOf(currentObj);
    } while (currentObj && currentObj !== Object.prototype);
    
    return Array.from(propertyNames);
  }
  
  // Synchronous validation for simple rules only
  static validateSync(obj: any, propertyPath = ''): ValidationResult {
    const errors: ValidationError[] = [];
    const target = obj.constructor.prototype;
    const propertyNames = this.getAllPropertyNames(obj);
    
    for (const propertyKey of propertyNames) {
      const rules: ValidationRule[] = Reflect.getMetadata(VALIDATION_KEY, target, propertyKey) || [];
      const value = obj[propertyKey];
      const fullPropertyPath = propertyPath ? `${propertyPath}.${propertyKey}` : propertyKey;
      
      for (const rule of rules) {
        // Skip async rules in sync validation
        if (rule.type === 'async') continue;
        
        const isValid = this.validateRuleSync(value, rule);
        if (!isValid) {
          errors.push({
            property: fullPropertyPath,
            value,
            constraint: rule.type,
            message: rule.message || `Validation failed for ${fullPropertyPath}`
          });
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  private static async validateRuleSync(value: any, rule: ValidationRule): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
      case 'minLength':
        if (typeof value !== 'string' && !Array.isArray(value)) return true;
        return value.length >= rule.value;
      case 'maxLength':
        if (typeof value !== 'string' && !Array.isArray(value)) return true;
        return value.length <= rule.value;
      case 'pattern':
        if (typeof value !== 'string') return true;
        return rule.value.test(value);
      case 'min':
        if (typeof value !== 'number') return true;
        return value >= rule.value;
      case 'max':
        if (typeof value !== 'number') return true;
        return value <= rule.value;
      case 'custom':
        if (!rule.validator) return true;
        return rule.validator(value);
      default:
        return true;
    }
  }
}

// ===== EXAMPLES =====

// Example 1: Basic validation
class User {
  @Required('Name is required')
  @MinLength(2, 'Name must be at least 2 characters')
  @MaxLength(50, 'Name must be no more than 50 characters')
  name: string;
  
  @Required('Email is required')
  @Pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
  email: string;
  
  @Min(18, 'Must be at least 18 years old')
  @Max(120, 'Age cannot exceed 120')
  age: number;
  
  constructor(name: string, email: string, age: number) {
    this.name = name;
    this.email = email;
    this.age = age;
  }
}

// Example 2: Custom validation
class Product {
  @Required()
  @Custom((value: string) => value.startsWith('PROD-'), 'Product code must start with PROD-')
  code: string;
  
  @Required()
  @Min(0, 'Price must be positive')
  price: number;
  
  @AsyncValidation(async (value: string) => {
    // Simulate async validation (e.g., checking if SKU exists in database)
    await new Promise(resolve => setTimeout(resolve, 100));
    return value.length >= 8;
  }, 'SKU must be at least 8 characters (async check)')
  sku: string;
  
  constructor(code: string, price: number, sku: string) {
    this.code = code;
    this.price = price;
    this.sku = sku;
  }
}

// Example 3: Nested object validation
class Address {
  @Required('Street is required')
  street: string;
  
  @Required('City is required')
  city: string;
  
  @Pattern(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
  zipCode: string;
  
  constructor(street: string, city: string, zipCode: string) {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
  }
}

class UserWithAddress {
  @Required()
  name: string;
  
  @Required()
  address: Address;
  
  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }
}

// ===== DEMO USAGE =====

async function demonstrateValidation() {
  console.log('=== Validation System Demo ===\n');
  
  // Test 1: Valid user
  console.log('1. Testing valid user:');
  const validUser = new User('John Doe', 'john@example.com', 25);
  const validResult = await Validator.validate(validUser);
  console.log('Valid:', validResult.isValid);
  console.log('Errors:', validResult.errors);
  console.log();
  
  // Test 2: Invalid user
  console.log('2. Testing invalid user:');
  const invalidUser = new User('', 'invalid-email', 15);
  const invalidResult = await Validator.validate(invalidUser);
  console.log('Valid:', invalidResult.isValid);
  console.log('Errors:', invalidResult.errors.map(e => `${e.property}: ${e.message}`));
  console.log();
  
  // Test 3: Custom validation
  console.log('3. Testing custom validation:');
  const product = new Product('ABC-123', -10, 'SHORT');
  const productResult = await Validator.validate(product);
  console.log('Valid:', productResult.isValid);
  console.log('Errors:', productResult.errors.map(e => `${e.property}: ${e.message}`));
  console.log();
  
  // Test 4: Nested validation
  console.log('4. Testing nested validation:');
  const address = new Address('', 'New York', 'invalid');
  const userWithAddress = new UserWithAddress('', address);
  const nestedResult = await Validator.validate(userWithAddress);
  console.log('Valid:', nestedResult.isValid);
  console.log('Errors:', nestedResult.errors.map(e => `${e.property}: ${e.message}`));
  console.log();
  
  // Test 5: Sync validation (skips async rules)
  console.log('5. Testing synchronous validation:');
  const syncResult = Validator.validateSync(product);
  console.log('Valid:', syncResult.isValid);
  console.log('Errors (sync only):', syncResult.errors.map(e => `${e.property}: ${e.message}`));
}

// Uncomment to run the demo
// demonstrateValidation().catch(console.error);