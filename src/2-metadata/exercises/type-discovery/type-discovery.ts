import 'reflect-metadata';

/**
 * Exercise: Property Type Discovery
 * 
 * Use TypeScript's design-time type information to discover property types.
 * 
 * Requirements:
 * - Extract property types using design:type metadata
 * - Handle different TypeScript types (string, number, boolean, Date, custom classes)
 * - Create a type inspector utility
 * - Work with parameter types and return types
 * - Handle complex type scenarios
 */

// ===== TODO: IMPLEMENT THESE FUNCTIONS =====

/**
 * Get the design-time type of a property
 */
export function getPropertyType(target: any, propertyKey: string): Function | undefined {
  // TODO: Use Reflect.getMetadata with 'design:type' key
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get parameter types of a method
 */
export function getParameterTypes(target: any, methodKey: string): Function[] | undefined {
  // TODO: Use Reflect.getMetadata with 'design:paramtypes' key
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Get return type of a method
 */
export function getReturnType(target: any, methodKey: string): Function | undefined {
  // TODO: Use Reflect.getMetadata with 'design:returntype' key
  throw new Error('NOT_IMPLEMENTED');
}

/**
 * Convert a type constructor to a string representation
 */
export function typeToString(type: Function | undefined): string {
  // TODO: Convert type constructors to readable names
  if (!type) return 'unknown';
  
  // Handle common types
  if (type === String) return 'string';
  if (type === Number) return 'number';
  if (type === Boolean) return 'boolean';
  if (type === Date) return 'Date';
  if (type === Array) return 'Array';
  if (type === Object) return 'Object';
  
  // For custom classes, use the constructor name
  return type.name || 'unknown';
}

/**
 * Get all property information for a class
 */
export interface PropertyInfo {
  name: string;
  type: string;
  constructor: Function | undefined;
}

export function getAllProperties(target: any): PropertyInfo[] {
  // TODO: Get all property names and their types
  const properties: PropertyInfo[] = [];
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') continue;
    
    // TODO: Get type information for each property
    const typeConstructor = getPropertyType(target.prototype, propertyName);
    properties.push({
      name: propertyName,
      type: typeToString(typeConstructor),
      constructor: typeConstructor
    });
  }
  
  return properties;
}

/**
 * Get method signature information
 */
export interface MethodInfo {
  name: string;
  parameterTypes: string[];
  returnType: string;
  parameterConstructors: (Function | undefined)[];
  returnConstructor: Function | undefined;
}

export function getMethodInfo(target: any, methodName: string): MethodInfo | undefined {
  // TODO: Get complete method signature information
  const paramTypes = getParameterTypes(target.prototype, methodName);
  const returnType = getReturnType(target.prototype, methodName);
  
  if (!paramTypes) throw new Error('NOT_IMPLEMENTED');
  
  return {
    name: methodName,
    parameterTypes: paramTypes.map(typeToString),
    returnType: typeToString(returnType),
    parameterConstructors: paramTypes,
    returnConstructor: returnType
  };
}

/**
 * Type inspector utility class
 */
export class TypeInspector {
  constructor(private target: any) {}
  
  // TODO: Implement methods to inspect the target class
  
  getClassName(): string {
    return this.target.name || 'unknown';
  }
  
  getProperties(): PropertyInfo[] {
    return getAllProperties(this.target);
  }
  
  getMethods(): MethodInfo[] {
    // TODO: Get all methods and their signatures
    const methods: MethodInfo[] = [];
    const methodNames = Object.getOwnPropertyNames(this.target.prototype);
    
    for (const methodName of methodNames) {
      if (methodName === 'constructor') continue;
      
      const descriptor = Object.getOwnPropertyDescriptor(this.target.prototype, methodName);
      if (descriptor && typeof descriptor.value === 'function') {
        const methodInfo = getMethodInfo(this.target, methodName);
        if (methodInfo) {
          methods.push(methodInfo);
        }
      }
    }
    
    return methods;
  }
  
  printReport(): void {
    console.log(`=== Type Inspector Report for ${this.getClassName()} ===\n`);
    
    console.log('Properties:');
    const properties = this.getProperties();
    properties.forEach(prop => {
      console.log(`  ${prop.name}: ${prop.type}`);
    });
    
    console.log('\nMethods:');
    const methods = this.getMethods();
    methods.forEach(method => {
      const params = method.parameterTypes.length > 0 
        ? method.parameterTypes.join(', ') 
        : 'void';
      console.log(`  ${method.name}(${params}): ${method.returnType}`);
    });
  }
}

// ===== TEST CLASSES =====

export class Address {
  street: string = '';
  city: string = '';
  country: string = '';
  zipCode: number = 0;
  
  constructor(street: string, city: string, country: string) {
    this.street = street;
    this.city = city;
    this.country = country;
  }
  
  getFullAddress(): string {
    return `${this.street}, ${this.city}, ${this.country}`;
  }
  
  isValid(): boolean {
    return this.street.length > 0 && this.city.length > 0;
  }
}

export class User {
  id: number = 0;
  name: string = '';
  email: string = '';
  isActive: boolean = true;
  birthDate: Date = new Date();
  address: Address = new Address('', '', '');
  tags: string[] = [];
  
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
  
  updateProfile(name: string, email: string): void {
    this.name = name;
    this.email = email;
  }
  
  calculateAge(): number {
    const now = new Date();
    return now.getFullYear() - this.birthDate.getFullYear();
  }
  
  addTag(tag: string): void {
    this.tags.push(tag);
  }
  
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }
  
  static createGuest(): User {
    return new User('Guest', 'guest@example.com');
  }
}

export class Product {
  name: string = '';
  price: number = 0;
  inStock: boolean = true;
  createdAt: Date = new Date();
  category: string = '';
  
  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
  
  applyDiscount(percentage: number): number {
    return this.price * (1 - percentage / 100);
  }
  
  isExpensive(): boolean {
    return this.price > 100;
  }
}
