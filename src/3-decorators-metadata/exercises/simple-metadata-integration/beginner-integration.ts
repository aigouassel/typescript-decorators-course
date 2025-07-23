/**
 * Exercise 3: Simple Metadata Decorator
 * 
 * Create your first decorator that works with metadata.
 * 
 * Requirements:
 * - Build a decorator that stores configuration metadata
 * - Access the metadata later to configure behavior
 * - Handle multiple decorators on the same target
 */

import 'reflect-metadata';

// Configuration interfaces
interface DisplayConfig {
  label?: string;
  hidden?: boolean;
  readonly?: boolean;
  group?: string;
}

interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface FormatConfig {
  type: 'currency' | 'percentage' | 'date' | 'phone' | 'email';
  options?: any;
}

// TODO: Implement metadata decorators
const DISPLAY_KEY = 'config:display';
const VALIDATION_KEY = 'config:validation';
const FORMAT_KEY = 'config:format';

/**
 * Decorator to configure display properties
 */
function Display(config: DisplayConfig) {
  return function (target: any, propertyKey: string) {
    // Your implementation here
  };
}

/**
 * Decorator to configure validation rules
 */
function Validation(config: ValidationConfig) {
  return function (target: any, propertyKey: string) {
    // Your implementation here
  };
}

/**
 * Decorator to configure formatting
 */
function Format(config: FormatConfig) {
  return function (target: any, propertyKey: string) {
    // Your implementation here
  };
}

// TODO: Implement configuration reader
class ConfigurationReader {
  /**
   * Get display configuration for a property
   */
  static getDisplayConfig(target: any, propertyKey: string): DisplayConfig | undefined {
    // Your implementation here
    return undefined;
  }
  
  /**
   * Get validation configuration for a property
   */
  static getValidationConfig(target: any, propertyKey: string): ValidationConfig | undefined {
    // Your implementation here
    return undefined;
  }
  
  /**
   * Get format configuration for a property
   */
  static getFormatConfig(target: any, propertyKey: string): FormatConfig | undefined {
    // Your implementation here
    return undefined;
  }
  
  /**
   * Get all configurations for a property
   */
  static getAllConfigs(target: any, propertyKey: string): {
    display?: DisplayConfig;
    validation?: ValidationConfig;
    format?: FormatConfig;
  } {
    // Your implementation here
    return {};
  }
  
  /**
   * Get all configured properties of a class
   */
  static getConfiguredProperties(target: Function): string[] {
    // Your implementation here
    return [];
  }
}

// TODO: Implement a simple form generator that uses the metadata
class FormGenerator {
  /**
   * Generate form field configuration from metadata
   */
  static generateField(target: any, propertyKey: string): FormFieldConfig {
    // Your implementation here
    // Use the configuration metadata to generate form field settings
    return {
      name: propertyKey,
      label: propertyKey,
      type: 'text',
      required: false,
      hidden: false,
      readonly: false
    };
  }
  
  /**
   * Generate complete form configuration
   */
  static generateForm(target: Function): FormConfig {
    // Your implementation here
    return {
      fields: [],
      groups: {}
    };
  }
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required: boolean;
  hidden: boolean;
  readonly: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  format?: {
    type: string;
    options?: any;
  };
  group?: string;
}

interface FormConfig {
  fields: FormFieldConfig[];
  groups: { [groupName: string]: FormFieldConfig[] };
}

// Test class with decorated properties
class UserProfile {
  @Display({ label: 'User ID', readonly: true, group: 'identity' })
  id: number;
  
  @Display({ label: 'Full Name', group: 'personal' })
  @Validation({ required: true, minLength: 2, maxLength: 50 })
  name: string;
  
  @Display({ label: 'Email Address', group: 'contact' })
  @Validation({ required: true, pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ })
  @Format({ type: 'email' })
  email: string;
  
  @Display({ label: 'Phone Number', group: 'contact' })
  @Validation({ pattern: /^\\+?[1-9]\\d{1,14}$/ })
  @Format({ type: 'phone' })
  phone: string;
  
  @Display({ label: 'Date of Birth', group: 'personal' })
  @Format({ type: 'date', options: { format: 'YYYY-MM-DD' } })
  birthDate: Date;
  
  @Display({ label: 'Salary', group: 'employment' })
  @Format({ type: 'currency', options: { currency: 'USD' } })
  salary: number;
  
  @Display({ label: 'Performance Score', group: 'employment' })
  @Format({ type: 'percentage' })
  @Validation({ required: false })
  performanceScore: number;
  
  @Display({ hidden: true })
  internalNotes: string;
  
  constructor() {
    this.id = 0;
    this.name = '';
    this.email = '';
    this.phone = '';
    this.birthDate = new Date();
    this.salary = 0;
    this.performanceScore = 0;
    this.internalNotes = '';
  }
}

// Test the implementation
console.log('=== Testing Simple Metadata Decorators ===');

const properties = ['id', 'name', 'email', 'phone', 'birthDate', 'salary', 'performanceScore', 'internalNotes'];

console.log('\\n--- Individual Property Configurations ---');
for (const prop of properties) {
  console.log(`\\n${prop}:`);
  
  const displayConfig = ConfigurationReader.getDisplayConfig(UserProfile.prototype, prop);
  if (displayConfig) {
    console.log('  Display:', displayConfig);
  }
  
  const validationConfig = ConfigurationReader.getValidationConfig(UserProfile.prototype, prop);
  if (validationConfig) {
    console.log('  Validation:', validationConfig);
  }
  
  const formatConfig = ConfigurationReader.getFormatConfig(UserProfile.prototype, prop);
  if (formatConfig) {
    console.log('  Format:', formatConfig);
  }
}

console.log('\\n--- All Configurations ---');
for (const prop of properties) {
  const allConfigs = ConfigurationReader.getAllConfigs(UserProfile.prototype, prop);
  if (Object.keys(allConfigs).length > 0) {
    console.log(`${prop}:`, allConfigs);
  }
}

console.log('\\n--- Configured Properties ---');
const configuredProps = ConfigurationReader.getConfiguredProperties(UserProfile);
console.log('Properties with metadata:', configuredProps);

console.log('\\n--- Form Generation ---');
// Test form field generation
console.log('\\nIndividual field configurations:');
for (const prop of ['name', 'email', 'salary']) {
  const fieldConfig = FormGenerator.generateField(UserProfile.prototype, prop);
  console.log(`${prop}:`, fieldConfig);
}

// Test complete form generation
console.log('\\nComplete form configuration:');
const formConfig = FormGenerator.generateForm(UserProfile);
console.log('Form fields:', formConfig.fields.length);
console.log('Form groups:', Object.keys(formConfig.groups));

// Display form structure
formConfig.fields.forEach(field => {
  console.log(`- ${field.label} (${field.name}): ${field.type}, required: ${field.required}, group: ${field.group || 'none'}`);
});

// Expected output should show:
// - Proper storage and retrieval of display, validation, and format metadata
// - Multiple decorators working on the same property
// - Form generation using the metadata to configure field behavior
// - Grouping and organization based on metadata