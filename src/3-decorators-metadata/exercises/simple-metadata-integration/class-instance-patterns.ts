/**
 * Exercise 4: Class vs Instance Metadata
 * 
 * Understand the difference between class-level and instance-level metadata.
 * 
 * Requirements:
 * - Store metadata on class constructors
 * - Store metadata on individual instances
 * - Demonstrate inheritance behavior
 * - Show when to use each approach
 */

import 'reflect-metadata';

// TODO: Implement class metadata manager
class ClassMetadataManager {
  /**
   * Set metadata that applies to all instances of a class
   */
  static setClassMetadata(target: Function, key: string, value: any): void {
    // Your implementation here
  }
  
  /**
   * Get metadata that applies to all instances of a class
   */
  static getClassMetadata(target: Function, key: string): any {
    // Your implementation here
  }
  
  /**
   * Set metadata on a specific instance
   */
  static setInstanceMetadata(instance: any, key: string, value: any): void {
    // Your implementation here
  }
  
  /**
   * Get metadata from a specific instance
   */
  static getInstanceMetadata(instance: any, key: string): any {
    // Your implementation here
  }
  
  /**
   * Check if an instance has specific metadata (checks instance first, then class)
   */
  static hasMetadata(instance: any, key: string): boolean {
    // Your implementation here
    return false;
  }
  
  /**
   * Get metadata with fallback (instance metadata overrides class metadata)
   */
  static getMetadataWithFallback(instance: any, key: string): any {
    // Your implementation here
  }
  
  /**
   * Get all metadata keys for an instance (both instance and class)
   */
  static getAllMetadataKeys(instance: any): string[] {
    // Your implementation here
    return [];
  }
}

// TODO: Implement decorators for class and instance metadata
function ClassConfig(config: any) {
  return function (constructor: Function) {
    // Your implementation here
    // Store configuration that applies to all instances
  };
}

function InstanceConfig(key: string, value: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Store configuration that applies per instance
  };
}

// Base class with class-level metadata
@ClassConfig({
  tableName: 'documents',
  schema: 'public',
  features: ['versioning', 'audit'],
  defaultPermissions: ['read']
})
class Document {
  id: string;
  title: string;
  content: string;
  
  constructor(id: string, title: string, content: string) {
    this.id = id;
    this.title = title;
    this.content = content;
    
    // Set instance-specific metadata in constructor
    ClassMetadataManager.setInstanceMetadata(this, 'instance:id', Math.random().toString(36));
    ClassMetadataManager.setInstanceMetadata(this, 'created:at', new Date());
    ClassMetadataManager.setInstanceMetadata(this, 'created:by', 'system');
  }
  
  @InstanceConfig('last:accessed', new Date())
  getContent(): string {
    // Update instance metadata when method is called
    ClassMetadataManager.setInstanceMetadata(this, 'last:accessed', new Date());
    ClassMetadataManager.setInstanceMetadata(this, 'access:count', 
      (ClassMetadataManager.getInstanceMetadata(this, 'access:count') || 0) + 1
    );
    return this.content;
  }
}

// Derived class that inherits and extends metadata
@ClassConfig({
  tableName: 'contracts',
  features: ['versioning', 'audit', 'digital-signature'],
  defaultPermissions: ['read', 'sign'],
  retention: '7 years'
})
class Contract extends Document {
  signatories: string[];
  expirationDate: Date;
  
  constructor(id: string, title: string, content: string, signatories: string[], expirationDate: Date) {
    super(id, title, content);
    this.signatories = signatories;
    this.expirationDate = expirationDate;
    
    // Add contract-specific instance metadata
    ClassMetadataManager.setInstanceMetadata(this, 'contract:signatories', signatories);
    ClassMetadataManager.setInstanceMetadata(this, 'contract:expires', expirationDate);
    ClassMetadataManager.setInstanceMetadata(this, 'contract:status', 'draft');
  }
  
  sign(signatory: string): void {
    // Update instance metadata when contract is signed
    const signatures = ClassMetadataManager.getInstanceMetadata(this, 'contract:signatures') || [];
    signatures.push({ signatory, timestamp: new Date() });
    ClassMetadataManager.setInstanceMetadata(this, 'contract:signatures', signatures);
    
    if (signatures.length === this.signatories.length) {
      ClassMetadataManager.setInstanceMetadata(this, 'contract:status', 'fully-signed');
    }
  }
}

// Special document with custom instance configuration
class ConfidentialDocument extends Document {
  constructor(id: string, title: string, content: string, clearanceLevel: string) {
    super(id, title, content);
    
    // Override class metadata for this specific instance
    ClassMetadataManager.setInstanceMetadata(this, 'security:clearance', clearanceLevel);
    ClassMetadataManager.setInstanceMetadata(this, 'security:encrypted', true);
    ClassMetadataManager.setInstanceMetadata(this, 'permissions', ['admin']); // Override class permissions
  }
}

// Test the implementation
console.log('=== Testing Class vs Instance Metadata ===');

// Create test instances
const doc1 = new Document('doc1', 'Standard Document', 'This is a standard document');
const doc2 = new Document('doc2', 'Another Document', 'This is another document');
const contract1 = new Contract('contract1', 'Service Agreement', 'Service contract terms', ['Alice', 'Bob'], new Date('2024-12-31'));
const confidential1 = new ConfidentialDocument('conf1', 'Top Secret', 'Classified information', 'top-secret');

// Wait a moment to show different timestamps
setTimeout(() => {
  console.log('\\n--- Class Metadata (shared across all instances) ---');
  
  console.log('Document class metadata:');
  console.log('- Table name:', ClassMetadataManager.getClassMetadata(Document, 'tableName'));
  console.log('- Features:', ClassMetadataManager.getClassMetadata(Document, 'features'));
  console.log('- Default permissions:', ClassMetadataManager.getClassMetadata(Document, 'defaultPermissions'));
  
  console.log('\\nContract class metadata:');
  console.log('- Table name:', ClassMetadataManager.getClassMetadata(Contract, 'tableName'));
  console.log('- Features:', ClassMetadataManager.getClassMetadata(Contract, 'features'));
  console.log('- Retention:', ClassMetadataManager.getClassMetadata(Contract, 'retention'));
  
  console.log('\\n--- Instance Metadata (unique per instance) ---');
  
  console.log('Document 1 instance metadata:');
  console.log('- Instance ID:', ClassMetadataManager.getInstanceMetadata(doc1, 'instance:id'));
  console.log('- Created at:', ClassMetadataManager.getInstanceMetadata(doc1, 'created:at'));
  console.log('- Created by:', ClassMetadataManager.getInstanceMetadata(doc1, 'created:by'));
  
  console.log('\\nDocument 2 instance metadata:');
  console.log('- Instance ID:', ClassMetadataManager.getInstanceMetadata(doc2, 'instance:id'));
  console.log('- Created at:', ClassMetadataManager.getInstanceMetadata(doc2, 'created:at'));
  
  console.log('\\nContract 1 instance metadata:');
  console.log('- Signatories:', ClassMetadataManager.getInstanceMetadata(contract1, 'contract:signatories'));
  console.log('- Expires:', ClassMetadataManager.getInstanceMetadata(contract1, 'contract:expires'));
  console.log('- Status:', ClassMetadataManager.getInstanceMetadata(contract1, 'contract:status'));
  
  console.log('\\n--- Testing Method Calls and Metadata Updates ---');
  
  // Access documents to update metadata
  doc1.getContent();
  doc1.getContent();
  doc2.getContent();
  
  console.log('Document 1 access count:', ClassMetadataManager.getInstanceMetadata(doc1, 'access:count'));
  console.log('Document 2 access count:', ClassMetadataManager.getInstanceMetadata(doc2, 'access:count'));
  
  // Sign contract to update metadata
  contract1.sign('Alice');
  contract1.sign('Bob');
  
  console.log('Contract 1 signatures:', ClassMetadataManager.getInstanceMetadata(contract1, 'contract:signatures'));
  console.log('Contract 1 status:', ClassMetadataManager.getInstanceMetadata(contract1, 'contract:status'));
  
  console.log('\\n--- Metadata Inheritance and Override ---');
  
  console.log('Confidential document security metadata:');
  console.log('- Clearance level:', ClassMetadataManager.getInstanceMetadata(confidential1, 'security:clearance'));
  console.log('- Encrypted:', ClassMetadataManager.getInstanceMetadata(confidential1, 'security:encrypted'));
  
  // Test metadata fallback (instance overrides class)
  console.log('\\nConfidential document permissions (should override class default):');
  console.log('- Instance permissions:', ClassMetadataManager.getInstanceMetadata(confidential1, 'permissions'));
  console.log('- Class permissions:', ClassMetadataManager.getClassMetadata(ConfidentialDocument, 'defaultPermissions'));
  console.log('- Effective permissions:', ClassMetadataManager.getMetadataWithFallback(confidential1, 'permissions') || 
    ClassMetadataManager.getMetadataWithFallback(confidential1, 'defaultPermissions'));
  
  console.log('\\n--- All Metadata Keys ---');
  
  console.log('Document 1 all keys:', ClassMetadataManager.getAllMetadataKeys(doc1));
  console.log('Contract 1 all keys:', ClassMetadataManager.getAllMetadataKeys(contract1));
  console.log('Confidential 1 all keys:', ClassMetadataManager.getAllMetadataKeys(confidential1));
  
  console.log('\\n--- Metadata Existence Checks ---');
  
  console.log('Document 1 has instance:id?', ClassMetadataManager.hasMetadata(doc1, 'instance:id'));
  console.log('Document 1 has tableName?', ClassMetadataManager.hasMetadata(doc1, 'tableName'));
  console.log('Document 1 has nonexistent?', ClassMetadataManager.hasMetadata(doc1, 'nonexistent'));
  
}, 10);

// Expected output should demonstrate:
// - Class metadata shared across all instances
// - Instance metadata unique to each object
// - Metadata inheritance from parent classes
// - Instance metadata overriding class metadata
// - Dynamic metadata updates during method calls
// - Proper fallback behavior when metadata is not found