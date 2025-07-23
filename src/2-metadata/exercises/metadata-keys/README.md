# Metadata Keys Exercise

**⚡ ADVANCED ARCHITECTURE - Production-ready patterns**

## Overview
This exercise teaches you to build sophisticated, production-ready metadata key management systems. This implements namespacing, collision avoidance, validation, and type-safe metadata access patterns used in real frameworks.

## Learning Objectives
- Build namespaced key systems (`namespace:key:subkey`)
- Implement production-ready key validation and parsing
- Create metadata registries for key definitions
- Build type-safe metadata accessors with validation
- Master collision avoidance and namespace management

## Current State
**✅ Already Built**:
- `TypedMetadataAccessor.get()` - Basic metadata retrieval
- `TypedMetadataAccessor.has()` - Metadata existence checking
- `TypedMetadataAccessor.delete()` - Metadata removal
- `MetadataCollection` class - Complete array operations utility

**🔨 Need Implementation (80%)**:
- All `MetadataKeys` methods - Key parsing, validation, namespace management
- All `MetadataRegistry` methods - Registry system for key definitions
- `TypedMetadataAccessor.set()` validation logic - Relies on registry
- `TypedMetadataAccessor` constructor - Validation setup

## Step-by-Step Implementation

### Step 1: Understand the Key Architecture (~20 minutes)

Study the intended key format and architecture:

**Key Format**: `namespace:key:subkey`
```typescript
// Examples of properly formatted keys
'validation:required'           // namespace: validation, key: required
'column:type:varchar'          // namespace: column, key: type, subkey: varchar
'route:method:GET'             // namespace: route, key: method, subkey: GET
'cache:ttl:3600'              // namespace: cache, key: ttl, subkey: 3600
```

**Architecture Components**:
- `MetadataKeys` - Key formatting, parsing, and validation utilities
- `MetadataRegistry` - Central registry for key definitions and validation
- `TypedMetadataAccessor` - Type-safe metadata operations with validation

### Step 2: Implement `MetadataKeys.create()` (~45 minutes)

**Location**: Line 13 in `metadata-keys.ts`

**What it should do**: Format components into a namespaced key string

```typescript
static create(namespace: string, key: string, subkey?: string): string {
  // Format: "namespace:key" or "namespace:key:subkey"
  // Validate components are non-empty strings
  // Return properly formatted key
}
```

**Implementation approach**:
```typescript
static create(namespace: string, key: string, subkey?: string): string {
  // Validate inputs
  if (!namespace || typeof namespace !== 'string' || namespace.trim() === '') {
    throw new Error('Namespace must be a non-empty string');
  }
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new Error('Key must be a non-empty string');
  }
  
  // Clean inputs (trim whitespace)
  const cleanNamespace = namespace.trim();
  const cleanKey = key.trim();
  
  // Build key string
  let metadataKey = `${cleanNamespace}:${cleanKey}`;
  
  if (subkey && typeof subkey === 'string' && subkey.trim() !== '') {
    metadataKey += `:${subkey.trim()}`;
  }
  
  return metadataKey;
}
```

**Test it**: Run `npm test metadata-keys` - the key creation tests should pass.

### Step 3: Implement `MetadataKeys.parse()` (~45 minutes)

**Location**: Line 17 in `metadata-keys.ts`

**What it should do**: Parse a key string back into its components

```typescript
static parse(key: string): { namespace: string; key: string; subkey?: string } {
  // Parse "namespace:key:subkey" back into components
  // Handle cases with and without subkey
  // Validate the key format
}
```

**Implementation approach**:
```typescript
static parse(key: string): { namespace: string; key: string; subkey?: string } {
  // Validate input
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }
  
  // Split by colon
  const parts = key.split(':');
  
  // Must have at least namespace and key
  if (parts.length < 2) {
    throw new Error('Key must have format "namespace:key" or "namespace:key:subkey"');
  }
  
  // Extract components
  const namespace = parts[0];
  const keyPart = parts[1];
  const subkey = parts.length > 2 ? parts.slice(2).join(':') : undefined;
  
  // Validate components
  if (!namespace || !keyPart) {
    throw new Error('Namespace and key cannot be empty');
  }
  
  return {
    namespace,
    key: keyPart,
    subkey
  };
}
```

**Test it**: The key parsing tests should pass.

### Step 4: Implement `MetadataKeys.isValid()` (~30 minutes)

**Location**: Line 21 in `metadata-keys.ts`

**What it should do**: Validate key format and components

```typescript
static isValid(key: string): boolean {
  // Check if key follows proper format
  // Return true/false without throwing errors
}
```

**Implementation approach**:
```typescript
static isValid(key: string): boolean {
  try {
    // Try to parse the key
    const parsed = this.parse(key);
    
    // Additional validation checks
    if (parsed.namespace.includes(' ') || parsed.key.includes(' ')) {
      return false; // No spaces allowed in namespace/key
    }
    
    return true;
  } catch (error) {
    return false; // Invalid format
  }
}
```

**Test it**: The key validation tests should pass.

### Step 5: Implement `MetadataKeys.getKeysForNamespace()` (~45 minutes)

**Location**: Line 25 in `metadata-keys.ts`

**What it should do**: Filter all keys to find those in a specific namespace

```typescript
static getKeysForNamespace(target: any, namespace: string, propertyKey?: string): string[] {
  // Get all metadata keys from target
  // Filter to only those matching the namespace
  // Return filtered array
}
```

**Implementation approach**:
```typescript
static getKeysForNamespace(target: any, namespace: string, propertyKey?: string): string[] {
  // Get all metadata keys
  const allKeys = Reflect.getMetadataKeys(target, propertyKey) || [];
  
  // Filter to namespace matches
  return allKeys.filter(key => {
    if (typeof key !== 'string') return false;
    
    try {
      const parsed = this.parse(key);
      return parsed.namespace === namespace;
    } catch (error) {
      return false; // Invalid key format
    }
  });
}
```

**Test it**: The namespace filtering tests should pass.

### Step 6: Implement `MetadataRegistry` System (~90 minutes)

**Location**: Lines 30-50 in `metadata-keys.ts`

This is a sophisticated registry system for managing key definitions.

#### 6a. Set up the registry storage
```typescript
class MetadataRegistry {
  private static definitions = new Map<string, KeyDefinition>();
  
  // ... methods will be implemented here
}
```

#### 6b. Implement `register()` method
```typescript
static register(definition: KeyDefinition): void {
  // Store the key definition in the registry
  // Use the full key (namespace:key) as the map key
  const fullKey = `${definition.namespace}:${definition.key}`;
  this.definitions.set(fullKey, definition);
}
```

#### 6c. Implement `getDefinition()` method
```typescript
static getDefinition(namespace: string, key: string): KeyDefinition | undefined {
  // Look up a key definition in the registry
  const fullKey = `${namespace}:${key}`;
  return this.definitions.get(fullKey);
}
```

#### 6d. Implement `isRegistered()` method
```typescript
static isRegistered(namespace: string, key: string): boolean {
  // Check if a key is registered
  return this.getDefinition(namespace, key) !== undefined;
}
```

#### 6e. Implement `validateValue()` method
```typescript
static validateValue(namespace: string, key: string, value: any): boolean {
  // Get the definition and validate the value against it
  const definition = this.getDefinition(namespace, key);
  if (!definition) return true; // Allow unregistered keys
  
  // Type validation
  if (definition.type && typeof value !== definition.type) {
    return false;
  }
  
  // Custom validator
  if (definition.validator && !definition.validator(value)) {
    return false;
  }
  
  return true;
}
```

#### 6f. Implement `getByNamespace()` method
```typescript
static getByNamespace(namespace: string): KeyDefinition[] {
  // Return all definitions for a namespace
  const result: KeyDefinition[] = [];
  
  for (const [fullKey, definition] of this.definitions) {
    if (definition.namespace === namespace) {
      result.push(definition);
    }
  }
  
  return result;
}
```

**Test it**: All MetadataRegistry tests should pass.

### Step 7: Complete `TypedMetadataAccessor` (~60 minutes)

#### 7a. Implement the constructor
**Location**: Line 67 in `metadata-keys.ts`

```typescript
constructor(private target: any, private propertyKey?: string) {
  this.target = target;
  this.propertyKey = propertyKey;
}
```

#### 7b. Fix `set()` method validation
**Location**: Line 76 in `metadata-keys.ts`

The `set()` method has validation logic but relies on the registry:

```typescript
set<T>(namespace: string, key: string, value: T, subkey?: string): void {
  // Validate the value using the registry
  if (!MetadataRegistry.validateValue(namespace, key, value)) {
    throw new Error(`Invalid value for ${namespace}:${key}`);
  }
  
  // Create the metadata key
  const metadataKey = MetadataKeys.create(namespace, key, subkey);
  
  // Store the metadata
  Reflect.defineMetadata(metadataKey, value, this.target, this.propertyKey);
}
```

**Test it**: All TypedMetadataAccessor tests should pass.

## Testing Your Implementation

### Run Tests
```bash
# Test just this exercise
npm test metadata-keys

# Run with watch mode
npm test -- --watch metadata-keys

# Run specific test suites
npm test -- metadata-keys --grep "MetadataKeys"
npm test -- metadata-keys --grep "MetadataRegistry"
npm test -- metadata-keys --grep "TypedMetadataAccessor"
```

### Expected Test Results
After implementing all components:
- ✅ MetadataKeys creation and parsing tests passing
- ✅ Key validation and namespace filtering tests passing
- ✅ MetadataRegistry definition and validation tests passing
- ✅ TypedMetadataAccessor integration tests passing
- ✅ Complex integration scenarios passing

## Key Concepts to Understand

### Namespaced Keys
```typescript
// Avoid collisions between different systems
const validationKey = MetadataKeys.create('validation', 'required');    // 'validation:required'
const columnKey = MetadataKeys.create('column', 'type', 'varchar');     // 'column:type:varchar'
const routeKey = MetadataKeys.create('route', 'method', 'GET');         // 'route:method:GET'
```

### Registry Definitions
```typescript
// Register key definitions with validation
MetadataRegistry.register({
  namespace: 'validation',
  key: 'required',
  type: 'boolean',
  description: 'Marks field as required',
  validator: (value) => typeof value === 'boolean'
});
```

### Type-Safe Access
```typescript
// Type-safe metadata operations with validation
const accessor = new TypedMetadataAccessor(User.prototype, 'name');

accessor.set('validation', 'required', true);  // ✅ Valid
accessor.set('validation', 'required', 'yes'); // ❌ Throws error (wrong type)

const isRequired = accessor.get<boolean>('validation', 'required'); // Type-safe retrieval
```

## Common Mistakes to Avoid

1. **Key format consistency**: Always use the exact format `namespace:key:subkey`
2. **Empty component validation**: Don't allow empty namespaces or keys
3. **Type validation**: Validate values against registered type definitions
4. **Error handling**: Provide clear, helpful error messages
5. **Registry dependency**: Make sure registry methods are implemented before using them

## Real-World Applications

This exercise teaches patterns used in:

**Framework Systems**:
```typescript
// Angular-style metadata
MetadataKeys.create('component', 'selector', 'app-user');
MetadataKeys.create('injectable', 'scope', 'singleton');
```

**ORM Systems**:
```typescript
// TypeORM-style column metadata
MetadataKeys.create('column', 'type', 'varchar');
MetadataKeys.create('column', 'length', '255');
MetadataKeys.create('relation', 'type', 'one-to-many');
```

**Validation Systems**:
```typescript
// Class-validator-style validation
MetadataKeys.create('validation', 'length', 'min:2,max:50');
MetadataKeys.create('validation', 'pattern', 'email');
```

## Performance Considerations

- **Registry lookups**: The registry uses Map for O(1) lookups
- **Key parsing**: Parse keys only when needed, cache results if used frequently
- **Validation**: Registry validation is optional - unregistered keys are allowed
- **Memory**: Registry stores definitions globally, clean up if needed

## What's Next?

After completing this exercise, you'll have:
- ✅ Production-ready key management system
- ✅ Understanding of namespace collision avoidance
- ✅ Experience with type-safe metadata patterns
- ✅ Ready to **study Performance** exercise (reference implementation)

This advanced knowledge prepares you to build frameworks and libraries that need sophisticated metadata management without conflicts.

## Reference Links

- [THEORY.md](../../THEORY.md) - Metadata keys and design section
- [REFERENCE.md](../../REFERENCE.md) - Quick API reference
- [Performance Exercise](../performance/) - See these patterns in action