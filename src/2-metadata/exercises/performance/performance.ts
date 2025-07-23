/**
 * Exercise: Performance Optimization
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

import 'reflect-metadata';

// ===== PERFORMANCE MONITORING =====

// Performance metrics tracking
class MetadataPerformanceMonitor {
  private static metrics = new Map<string, PerformanceMetric>();
  
  static startTiming(operation: string): PerformanceTimer {
    const start = performance.now();
    return {
      operation,
      start,
      end: () => {
        const end = performance.now();
        const duration = end - start;
        this.recordMetric(operation, duration);
        return duration;
      }
    };
  }
  
  static recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || {
      operation,
      totalCalls: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0
    };
    
    existing.totalCalls++;
    existing.totalTime += duration;
    existing.averageTime = existing.totalTime / existing.totalCalls;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    
    this.metrics.set(operation, existing);
  }
  
  static getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }
  
  static resetMetrics(): void {
    this.metrics.clear();
  }
  
  static printReport(): void {
    console.log('=== Metadata Performance Report ===');
    for (const [operation, metric] of this.metrics) {
      console.log(`${operation}:`);
      console.log(`  Calls: ${metric.totalCalls}`);
      console.log(`  Total Time: ${metric.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${metric.averageTime.toFixed(2)}ms`);
      console.log(`  Min/Max: ${metric.minTime.toFixed(2)}ms / ${metric.maxTime.toFixed(2)}ms`);
    }
  }
}

interface PerformanceMetric {
  operation: string;
  totalCalls: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
}

interface PerformanceTimer {
  operation: string;
  start: number;
  end: () => number;
}

// ===== CACHING SYSTEM =====

// LRU Cache for metadata
class MetadataCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttl: number;
  
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get<T>(key: string, factory: () => T): T {
    const timer = MetadataPerformanceMonitor.startTiming('cache.get');
    
    const now = Date.now();
    const cached = this.cache.get(key);
    
    // Check if cached value exists and is not expired
    if (cached && (now - cached.timestamp) < this.ttl) {
      cached.hits++;
      cached.lastAccess = now;
      timer.end();
      return cached.value;
    }
    
    // Generate new value
    const factoryTimer = MetadataPerformanceMonitor.startTiming('cache.factory');
    const value = factory();
    factoryTimer.end();
    
    // Add to cache
    this.set(key, value);
    timer.end();
    
    return value;
  }
  
  private set<T>(key: string, value: T): void {
    const now = Date.now();
    
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: now,
      lastAccess: now,
      hits: 1
    });
  }
  
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < lruTime) {
        lruKey = key;
        lruTime = entry.lastAccess;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  getStats(): CacheStats {
    let totalHits = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
      newestEntry = Math.max(newestEntry, entry.timestamp);
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      averageHits: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      ageRange: newestEntry - oldestEntry,
      hitRate: totalHits / (this.cache.size || 1)
    };
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  lastAccess: number;
  hits: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  totalHits: number;
  averageHits: number;
  ageRange: number;
  hitRate: number;
}

// ===== LAZY LOADING =====

// Lazy metadata loader
class LazyMetadataLoader {
  private static loaded = new Set<string>();
  private static loaders = new Map<string, () => void>();
  
  static register(key: string, loader: () => void): void {
    this.loaders.set(key, loader);
  }
  
  static ensureLoaded(key: string): void {
    if (this.loaded.has(key)) {
      return; // Already loaded
    }
    
    const loader = this.loaders.get(key);
    if (loader) {
      const timer = MetadataPerformanceMonitor.startTiming('lazy.load');
      loader();
      this.loaded.add(key);
      timer.end();
    }
  }
  
  static isLoaded(key: string): boolean {
    return this.loaded.has(key);
  }
  
  static reset(): void {
    this.loaded.clear();
  }
}

// ===== OPTIMIZED METADATA UTILITIES =====

// High-performance metadata accessor
class OptimizedMetadataUtils {
  private static cache = new MetadataCache();
  
  static getMetadata<T>(key: string, target: any, propertyKey?: string): T | undefined {
    const cacheKey = this.generateCacheKey(key, target, propertyKey);
    
    return this.cache.get(cacheKey, () => {
      const timer = MetadataPerformanceMonitor.startTiming('reflect.get');
      const result = Reflect.getMetadata(key, target, propertyKey);
      timer.end();
      return result;
    });
  }
  
  static setMetadata(key: string, value: any, target: any, propertyKey?: string): void {
    const timer = MetadataPerformanceMonitor.startTiming('reflect.set');
    Reflect.defineMetadata(key, value, target, propertyKey);
    
    // Invalidate cache entry
    const cacheKey = this.generateCacheKey(key, target, propertyKey);
    this.cache.clear(); // Simple invalidation - could be more sophisticated
    
    timer.end();
  }
  
  static getAllPropertiesWithMetadata<T>(target: any, metadataKey: string): Map<string, T> {
    const cacheKey = `all-props.${metadataKey}.${this.getTargetName(target)}`;
    
    return this.cache.get(cacheKey, () => {
      const timer = MetadataPerformanceMonitor.startTiming('reflect.getAllProps');
      const result = new Map<string, T>();
      const propertyNames = Object.getOwnPropertyNames(target.prototype);
      
      for (const propertyName of propertyNames) {
        if (propertyName === 'constructor') continue;
        
        const metadata = Reflect.getMetadata(metadataKey, target.prototype, propertyName);
        if (metadata !== undefined) {
          result.set(propertyName, metadata);
        }
      }
      
      timer.end();
      return result;
    });
  }
  
  private static generateCacheKey(key: string, target: any, propertyKey?: string): string {
    const targetName = this.getTargetName(target);
    return `${key}:${targetName}:${propertyKey || 'class'}`;
  }
  
  private static getTargetName(target: any): string {
    return target.name || target.constructor?.name || 'unknown';
  }
  
  static getCacheStats(): CacheStats {
    return this.cache.getStats();
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}

// ===== BATCH OPERATIONS =====

// Batch metadata operations for better performance
class BatchMetadataProcessor {
  private operations: BatchOperation[] = [];
  
  addSetOperation(key: string, value: any, target: any, propertyKey?: string): this {
    this.operations.push({
      type: 'set',
      key,
      value,
      target,
      propertyKey
    });
    return this;
  }
  
  addGetOperation(key: string, target: any, propertyKey?: string): this {
    this.operations.push({
      type: 'get',
      key,
      target,
      propertyKey
    });
    return this;
  }
  
  execute(): Map<string, any> {
    const timer = MetadataPerformanceMonitor.startTiming('batch.execute');
    const results = new Map<string, any>();
    
    // Group operations by type for optimization
    const setOps = this.operations.filter(op => op.type === 'set');
    const getOps = this.operations.filter(op => op.type === 'get');
    
    // Execute all set operations first
    for (const op of setOps) {
      Reflect.defineMetadata(op.key, op.value, op.target, op.propertyKey);
    }
    
    // Then execute get operations
    for (const op of getOps) {
      const result = Reflect.getMetadata(op.key, op.target, op.propertyKey);
      const resultKey = `${op.key}:${op.target.name || 'unknown'}:${op.propertyKey || 'class'}`;
      results.set(resultKey, result);
    }
    
    this.operations = []; // Clear operations
    timer.end();
    
    return results;
  }
}

interface BatchOperation {
  type: 'set' | 'get';
  key: string;
  value?: any;
  target: any;
  propertyKey?: string;
}

// ===== DEMONSTRATION =====

// Test class for performance testing
class TestEntity {
  name: string = '';
  email: string = '';
  age: number = 0;
  active: boolean = true;
  createdAt: Date = new Date();
}

export { 
  MetadataPerformanceMonitor,
  MetadataCache,
  LazyMetadataLoader,
  OptimizedMetadataUtils,
  BatchMetadataProcessor,
  TestEntity
};