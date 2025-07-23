import 'reflect-metadata';

/**
 * Exercise 4: Performance Optimization
 * Difficulty: ⭐⭐⭐⭐☆
 * 
 * Implement metadata caching and lazy loading for performance.
 * 
 * Requirements:
 * - Build a metadata cache system
 * - Implement lazy metadata loading
 * - Profile and optimize metadata access
 * - Handle cache invalidation
 * - Support memory-efficient metadata storage
 */

// ===== SOLUTION =====

interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  enableStats?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

interface LazyMetadataConfig {
  key: string;
  loader: () => any;
  dependencies?: string[];
  ttl?: number;
}

// Advanced metadata cache with LRU eviction and TTL
export class MetadataCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder: string[] = [];
  private stats = { hits: 0, misses: 0, evictions: 0 };
  
  constructor(private options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000,
      enableStats: true,
      ...options
    };
  }
  
  get<T = any>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.options.enableStats) this.stats.misses++;
      return undefined;
    }
    
    // Check TTL
    if (this.options.ttl && Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      if (this.options.enableStats) this.stats.misses++;
      return undefined;
    }
    
    // Update access information
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(key);
    
    if (this.options.enableStats) this.stats.hits++;
    return entry.value;
  }
  
  set<T = any>(key: string, value: T): void {
    const now = Date.now();
    
    if (this.cache.has(key)) {
      // Update existing entry
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.timestamp = now;
      entry.lastAccessed = now;
      this.updateAccessOrder(key);
    } else {
      // Add new entry
      if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
        this.evictLRU();
      }
      
      this.cache.set(key, {
        value,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now
      });
      this.accessOrder.push(key);
    }
  }
  
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }
  
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check TTL
    if (this.options.ttl && Date.now() - entry.timestamp > this.options.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }
  
  // Memory pressure cleanup
  cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (this.options.ttl && now - entry.timestamp > this.options.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.delete(key));
  }
  
  // Get keys sorted by access patterns (for debugging)
  getAccessStats(): Array<{ key: string; accessCount: number; lastAccessed: Date }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      lastAccessed: new Date(entry.lastAccessed)
    })).sort((a, b) => b.accessCount - a.accessCount);
  }
  
  private evictLRU(): void {
    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      this.cache.delete(lruKey);
      if (this.options.enableStats) this.stats.evictions++;
    }
  }
  
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }
  
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

// Lazy metadata loader with dependency tracking
export class LazyMetadataLoader {
  private static loaders = new Map<string, LazyMetadataConfig>();
  private static loadingPromises = new Map<string, Promise<any>>();
  private static cache = new MetadataCache({ ttl: 10 * 60 * 1000, maxSize: 500 });
  private static dependencyGraph = new Map<string, Set<string>>();
  
  // Register a lazy loader
  static registerLoader(config: LazyMetadataConfig): void {
    this.loaders.set(config.key, config);
    
    // Build dependency graph
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (!this.dependencyGraph.has(dep)) {
          this.dependencyGraph.set(dep, new Set());
        }
        this.dependencyGraph.get(dep)!.add(config.key);
      }
    }
  }
  
  // Load metadata lazily
  static async load<T = any>(key: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Check if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }
    
    const config = this.loaders.get(key);
    if (!config) {
      throw new Error(`No loader registered for key: ${key}`);
    }
    
    // Load dependencies first
    const dependencies: any[] = [];
    if (config.dependencies) {
      const depPromises = config.dependencies.map(dep => this.load(dep));
      dependencies.push(...await Promise.all(depPromises));
    }
    
    // Create loading promise
    const loadingPromise = this.executeLoader(config, dependencies);
    this.loadingPromises.set(key, loadingPromise);
    
    try {
      const result = await loadingPromise;
      
      // Cache the result
      this.cache.set(key, result);
      
      return result;
    } finally {
      this.loadingPromises.delete(key);
    }
  }
  
  private static async executeLoader(config: LazyMetadataConfig, dependencies: any[]): Promise<any> {
    try {
      return await config.loader();
    } catch (error) {
      console.error(`Failed to load metadata for key: ${config.key}`, error);
      throw error;
    }
  }
  
  // Invalidate metadata and dependents
  static invalidate(key: string): void {
    this.cache.delete(key);
    this.loadingPromises.delete(key);
    
    // Invalidate dependents
    const dependents = this.dependencyGraph.get(key);
    if (dependents) {
      for (const dependent of dependents) {
        this.invalidate(dependent);
      }
    }
  }
  
  // Get cache statistics
  static getCacheStats(): CacheStats {
    return this.cache.getStats();
  }
  
  // Cleanup expired entries
  static cleanup(): void {
    this.cache.cleanup();
  }
  
  // Clear all cached data
  static clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// High-performance metadata accessor with multiple optimization strategies
export class OptimizedMetadataAccessor {
  private static cache = new MetadataCache({ ttl: 15 * 60 * 1000, maxSize: 2000 });
  private static compiledAccessors = new Map<string, Function>();
  private static metadataIndex = new Map<Function, Map<string, Set<string>>>();
  
  // Get metadata with aggressive caching
  static getMetadata<T = any>(
    key: string,
    target: any,
    propertyKey?: string,
    useInheritance = true
  ): T | undefined {
    const cacheKey = this.generateCacheKey(key, target, propertyKey, useInheritance);
    
    // Try cache first
    let result = this.cache.get<T>(cacheKey);
    if (result !== undefined) {
      return result;
    }
    
    // Use compiled accessor if available
    const accessorKey = `${key}:${useInheritance}`;
    const compiledAccessor = this.compiledAccessors.get(accessorKey);
    if (compiledAccessor) {
      result = compiledAccessor(target, propertyKey);
    } else {
      // Fall back to reflection
      result = useInheritance 
        ? Reflect.getMetadata(key, target, propertyKey)
        : Reflect.getOwnMetadata(key, target, propertyKey);
    }
    
    // Cache the result
    if (result !== undefined) {
      this.cache.set(cacheKey, result);
    }
    
    return result;
  }
  
  // Compile optimized accessor for frequently used metadata
  static compileAccessor(key: string, useInheritance = true): void {
    const accessorKey = `${key}:${useInheritance}`;
    
    if (this.compiledAccessors.has(accessorKey)) {
      return; // Already compiled
    }
    
    const accessorFunction = useInheritance
      ? (target: any, propertyKey?: string) => Reflect.getMetadata(key, target, propertyKey)
      : (target: any, propertyKey?: string) => Reflect.getOwnMetadata(key, target, propertyKey);
    
    this.compiledAccessors.set(accessorKey, accessorFunction);
  }
  
  // Build metadata index for fast property lookups
  static buildMetadataIndex(target: Function, metadataKeys: string[]): void {
    if (this.metadataIndex.has(target)) {
      return; // Already indexed
    }
    
    const index = new Map<string, Set<string>>();
    
    // Index class-level metadata
    for (const key of metadataKeys) {
      if (Reflect.hasMetadata(key, target)) {
        if (!index.has(key)) {
          index.set(key, new Set());
        }
        index.get(key)!.add('__class__');
      }
    }
    
    // Index property-level metadata
    const prototype = target.prototype;
    if (prototype) {
      const propertyNames = Object.getOwnPropertyNames(prototype);
      
      for (const propertyName of propertyNames) {
        if (propertyName === 'constructor') continue;
        
        for (const key of metadataKeys) {
          if (Reflect.hasMetadata(key, prototype, propertyName)) {
            if (!index.has(key)) {
              index.set(key, new Set());
            }
            index.get(key)!.add(propertyName);
          }
        }
      }
    }
    
    this.metadataIndex.set(target, index);
  }
  
  // Get all properties that have specific metadata (using index)
  static getPropertiesWithMetadata(target: Function, key: string): string[] {
    const index = this.metadataIndex.get(target);
    if (!index) {
      // Fallback to slow method if not indexed
      return this.getPropertiesWithMetadataSlow(target, key);
    }
    
    const properties = index.get(key);
    return properties ? Array.from(properties).filter(p => p !== '__class__') : [];
  }
  
  private static getPropertiesWithMetadataSlow(target: Function, key: string): string[] {
    const properties: string[] = [];
    const prototype = target.prototype;
    
    if (prototype) {
      const propertyNames = Object.getOwnPropertyNames(prototype);
      
      for (const propertyName of propertyNames) {
        if (propertyName === 'constructor') continue;
        
        if (Reflect.hasMetadata(key, prototype, propertyName)) {
          properties.push(propertyName);
        }
      }
    }
    
    return properties;
  }
  
  // Batch load metadata for multiple keys
  static batchGetMetadata(
    keys: string[],
    target: any,
    propertyKey?: string,
    useInheritance = true
  ): Map<string, any> {
    const results = new Map<string, any>();
    
    for (const key of keys) {
      const value = this.getMetadata(key, target, propertyKey, useInheritance);
      if (value !== undefined) {
        results.set(key, value);
      }
    }
    
    return results;
  }
  
  // Memory-efficient metadata preloading
  static preloadMetadata(targets: Function[], keys: string[]): Promise<void> {
    return new Promise((resolve) => {
      // Use requestIdleCallback if available, otherwise setTimeout
      const scheduleWork = (callback: () => void) => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(callback);
        } else {
          setTimeout(callback, 0);
        }
      };
      
      let processed = 0;
      const total = targets.length;
      
      const processNext = () => {
        if (processed >= total) {
          resolve();
          return;
        }
        
        const target = targets[processed];
        
        // Build index
        this.buildMetadataIndex(target, keys);
        
        // Preload common metadata
        for (const key of keys) {
          this.compileAccessor(key, true);
          this.compileAccessor(key, false);
          
          // Warm up cache
          this.getMetadata(key, target);
          
          const properties = this.getPropertiesWithMetadata(target, key);
          for (const property of properties) {
            this.getMetadata(key, target.prototype, property);
          }
        }
        
        processed++;
        scheduleWork(processNext);
      };
      
      scheduleWork(processNext);
    });
  }
  
  private static generateCacheKey(
    key: string,
    target: any,
    propertyKey?: string,
    useInheritance?: boolean
  ): string {
    const targetName = target.name || target.constructor?.name || 'unknown';
    return `${key}:${targetName}:${propertyKey || 'class'}:${useInheritance}`;
  }
  
  // Performance monitoring
  static getPerformanceStats(): {
    cacheStats: CacheStats;
    compiledAccessors: number;
    indexedClasses: number;
  } {
    return {
      cacheStats: this.cache.getStats(),
      compiledAccessors: this.compiledAccessors.size,
      indexedClasses: this.metadataIndex.size
    };
  }
  
  static clearAll(): void {
    this.cache.clear();
    this.compiledAccessors.clear();
    this.metadataIndex.clear();
  }
}

// Performance benchmarking utilities
export class MetadataBenchmark {
  static async benchmarkCachePerformance(iterations = 10000): Promise<{
    withCache: number;
    withoutCache: number;
    speedup: number;
  }> {
    // Setup test data
    class TestClass {
      @Reflect.metadata('test:key', { value: 'test' })
      property: string = '';
    }
    
    // Benchmark with cache
    OptimizedMetadataAccessor.clearAll();
    const startWithCache = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      OptimizedMetadataAccessor.getMetadata('test:key', TestClass.prototype, 'property');
    }
    
    const endWithCache = performance.now();
    const withCacheTime = endWithCache - startWithCache;
    
    // Benchmark without cache (direct Reflect calls)
    const startWithoutCache = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      Reflect.getMetadata('test:key', TestClass.prototype, 'property');
    }
    
    const endWithoutCache = performance.now();
    const withoutCacheTime = endWithoutCache - startWithoutCache;
    
    return {
      withCache: withCacheTime,
      withoutCache: withoutCacheTime,
      speedup: withoutCacheTime / withCacheTime
    };
  }
  
  static async benchmarkLazyLoading(iterations = 1000): Promise<{
    eagerTime: number;
    lazyTime: number;
    memorySavings: string;
  }> {
    // Simulate expensive metadata computation
    const expensiveComputation = () => {
      const data = new Array(10000).fill(0).map((_, i) => ({ id: i, value: Math.random() }));
      return data.reduce((sum, item) => sum + item.value, 0);
    };
    
    // Eager loading benchmark
    const eagerResults: number[] = [];
    const startEager = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      eagerResults.push(expensiveComputation());
    }
    
    const endEager = performance.now();
    const eagerTime = endEager - startEager;
    
    // Lazy loading benchmark
    LazyMetadataLoader.clearCache();
    
    for (let i = 0; i < iterations; i++) {
      LazyMetadataLoader.registerLoader({
        key: `test:${i}`,
        loader: expensiveComputation
      });
    }
    
    const startLazy = performance.now();
    
    // Only load first 10% to simulate typical usage
    const loadPromises: Promise<any>[] = [];
    for (let i = 0; i < Math.floor(iterations * 0.1); i++) {
      loadPromises.push(LazyMetadataLoader.load(`test:${i}`));
    }
    
    await Promise.all(loadPromises);
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;
    
    return {
      eagerTime,
      lazyTime,
      memorySavings: `${((1 - 0.1) * 100).toFixed(1)}% (loaded ${Math.floor(iterations * 0.1)}/${iterations})`
    };
  }
}

// ===== EXAMPLES =====

// Example 1: Performance-critical metadata access
class HighPerformanceEntity {
  @Reflect.metadata('column', { type: 'int', primary: true })
  @Reflect.metadata('validation', [{ type: 'required' }])
  id: number;
  
  @Reflect.metadata('column', { type: 'varchar', length: 255 })
  @Reflect.metadata('validation', [{ type: 'required' }, { type: 'minLength', value: 2 }])
  name: string;
  
  @Reflect.metadata('column', { type: 'varchar', unique: true })
  @Reflect.metadata('validation', [{ type: 'email' }])
  email: string;
  
  constructor() {
    this.id = 0;
    this.name = '';
    this.email = '';
  }
}

// Example 2: Lazy-loaded complex metadata
LazyMetadataLoader.registerLoader({
  key: 'schema:definitions',
  loader: async () => {
    // Simulate loading from external source
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      entities: ['User', 'Product', 'Order'],
      relationships: [
        { from: 'User', to: 'Order', type: 'oneToMany' },
        { from: 'Product', to: 'Order', type: 'manyToMany' }
      ]
    };
  },
  ttl: 30 * 60 * 1000 // 30 minutes
});

LazyMetadataLoader.registerLoader({
  key: 'validation:rules',
  loader: async () => {
    const schema = await LazyMetadataLoader.load('schema:definitions');
    return {
      compiled: true,
      rules: schema.entities.map((entity: string) => ({
        entity,
        rules: ['required', 'type-check']
      }))
    };
  },
  dependencies: ['schema:definitions']
});

// ===== DEMO USAGE =====

async function demonstratePerformanceOptimization() {
  console.log('=== Performance Optimization Demo ===\n');
  
  // Test 1: Basic caching
  console.log('1. Cache performance test:');
  const cacheStats1 = OptimizedMetadataAccessor.getPerformanceStats();
  console.log('Initial stats:', cacheStats1);
  
  // Access metadata multiple times
  for (let i = 0; i < 100; i++) {
    OptimizedMetadataAccessor.getMetadata('column', HighPerformanceEntity.prototype, 'name');
    OptimizedMetadataAccessor.getMetadata('validation', HighPerformanceEntity.prototype, 'name');
  }
  
  const cacheStats2 = OptimizedMetadataAccessor.getPerformanceStats();
  console.log('After 100 accesses:', cacheStats2);
  console.log();
  
  // Test 2: Compiled accessors
  console.log('2. Compiled accessor performance:');
  OptimizedMetadataAccessor.compileAccessor('column');
  OptimizedMetadataAccessor.compileAccessor('validation');
  
  const cacheStats3 = OptimizedMetadataAccessor.getPerformanceStats();
  console.log('After compiling accessors:', cacheStats3);
  console.log();
  
  // Test 3: Metadata indexing
  console.log('3. Metadata indexing:');
  OptimizedMetadataAccessor.buildMetadataIndex(HighPerformanceEntity, ['column', 'validation']);
  
  const propertiesWithColumn = OptimizedMetadataAccessor.getPropertiesWithMetadata(HighPerformanceEntity, 'column');
  const propertiesWithValidation = OptimizedMetadataAccessor.getPropertiesWithMetadata(HighPerformanceEntity, 'validation');
  
  console.log('Properties with column metadata:', propertiesWithColumn);
  console.log('Properties with validation metadata:', propertiesWithValidation);
  console.log();
  
  // Test 4: Lazy loading
  console.log('4. Lazy loading test:');
  try {
    console.log('Loading schema definitions...');
    const schema = await LazyMetadataLoader.load('schema:definitions');
    console.log('Schema loaded:', schema);
    
    console.log('Loading validation rules (depends on schema)...');
    const validation = await LazyMetadataLoader.load('validation:rules');
    console.log('Validation rules loaded:', validation);
    
    const lazyStats = LazyMetadataLoader.getCacheStats();
    console.log('Lazy loader cache stats:', lazyStats);
  } catch (error) {
    console.error('Lazy loading error:', error);
  }
  console.log();
  
  // Test 5: Performance benchmarks
  console.log('5. Performance benchmarks:');
  
  console.log('Running cache benchmark...');
  const cacheBenchmark = await MetadataBenchmark.benchmarkCachePerformance(1000);
  console.log('Cache benchmark results:', {
    withCache: `${cacheBenchmark.withCache.toFixed(2)}ms`,
    withoutCache: `${cacheBenchmark.withoutCache.toFixed(2)}ms`,
    speedup: `${cacheBenchmark.speedup.toFixed(2)}x faster`
  });
  
  console.log('Running lazy loading benchmark...');
  const lazyBenchmark = await MetadataBenchmark.benchmarkLazyLoading(100);
  console.log('Lazy loading benchmark results:', {
    eagerTime: `${lazyBenchmark.eagerTime.toFixed(2)}ms`,
    lazyTime: `${lazyBenchmark.lazyTime.toFixed(2)}ms`,
    memorySavings: lazyBenchmark.memorySavings
  });
  console.log();
  
  // Test 6: Memory usage simulation
  console.log('6. Memory optimization demonstration:');
  
  // Create multiple classes to simulate real application
  const testClasses: Function[] = [];
  for (let i = 0; i < 50; i++) {
    const className = `TestClass${i}`;
    const TestClass = class {
      @Reflect.metadata('column', { type: 'varchar' })
      @Reflect.metadata('validation', [{ type: 'required' }])
      prop1: string = '';
      
      @Reflect.metadata('column', { type: 'int' })
      prop2: number = 0;
    };
    
    Object.defineProperty(TestClass, 'name', { value: className });
    testClasses.push(TestClass);
  }
  
  console.log('Preloading metadata for 50 classes...');
  const startPreload = performance.now();
  await OptimizedMetadataAccessor.preloadMetadata(testClasses, ['column', 'validation']);
  const endPreload = performance.now();
  
  console.log(`Preloading completed in ${(endPreload - startPreload).toFixed(2)}ms`);
  
  const finalStats = OptimizedMetadataAccessor.getPerformanceStats();
  console.log('Final performance stats:', finalStats);
}

// Uncomment to run the demo
// demonstratePerformanceOptimization().catch(console.error);