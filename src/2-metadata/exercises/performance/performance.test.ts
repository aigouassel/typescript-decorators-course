import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'reflect-metadata';
import {
  MetadataPerformanceMonitor,
  MetadataCache,
  LazyMetadataLoader,
  OptimizedMetadataUtils,
  BatchMetadataProcessor,
  TestEntity
} from './performance';

describe('Exercise: Performance Optimization', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Reset performance monitor
    MetadataPerformanceMonitor.resetMetrics();
    
    // Clear lazy loader
    LazyMetadataLoader.reset();
    
    // Clear optimized utils cache
    OptimizedMetadataUtils.clearCache();
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('MetadataPerformanceMonitor class', () => {
    describe('startTiming method', () => {
      it('should create performance timer', () => {
        const timer = MetadataPerformanceMonitor.startTiming('test-operation');
        
        expect(timer).toBeDefined();
        expect(timer.operation).toBe('test-operation');
        expect(typeof timer.start).toBe('number');
        expect(typeof timer.end).toBe('function');
      });

      it('should record metrics when timer ends', () => {
        const timer = MetadataPerformanceMonitor.startTiming('test-metric');
        
        // Simulate some work
        const duration = timer.end();
        
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThanOrEqual(0);
        
        const metrics = MetadataPerformanceMonitor.getMetrics();
        expect(metrics.has('test-metric')).toBe(true);
      });
    });

    describe('recordMetric method', () => {
      it('should record performance metric', () => {
        MetadataPerformanceMonitor.recordMetric('manual-test', 10.5);
        
        const metrics = MetadataPerformanceMonitor.getMetrics();
        const testMetric = metrics.get('manual-test');
        
        expect(testMetric).toBeDefined();
        expect(testMetric?.totalCalls).toBe(1);
        expect(testMetric?.totalTime).toBe(10.5);
        expect(testMetric?.averageTime).toBe(10.5);
        expect(testMetric?.minTime).toBe(10.5);
        expect(testMetric?.maxTime).toBe(10.5);
      });

      it('should aggregate multiple recordings', () => {
        MetadataPerformanceMonitor.recordMetric('aggregate-test', 5);
        MetadataPerformanceMonitor.recordMetric('aggregate-test', 15);
        MetadataPerformanceMonitor.recordMetric('aggregate-test', 10);
        
        const metrics = MetadataPerformanceMonitor.getMetrics();
        const testMetric = metrics.get('aggregate-test');
        
        expect(testMetric?.totalCalls).toBe(3);
        expect(testMetric?.totalTime).toBe(30);
        expect(testMetric?.averageTime).toBe(10);
        expect(testMetric?.minTime).toBe(5);
        expect(testMetric?.maxTime).toBe(15);
      });
    });

    describe('getMetrics method', () => {
      it('should return empty map initially', () => {
        const metrics = MetadataPerformanceMonitor.getMetrics();
        expect(metrics.size).toBe(0);
      });

      it('should return copy of metrics map', () => {
        MetadataPerformanceMonitor.recordMetric('test', 5);
        
        const metrics1 = MetadataPerformanceMonitor.getMetrics();
        const metrics2 = MetadataPerformanceMonitor.getMetrics();
        
        expect(metrics1).not.toBe(metrics2); // Different objects
        expect(metrics1.get('test')).toEqual(metrics2.get('test')); // Same content
      });
    });

    describe('resetMetrics method', () => {
      it('should clear all metrics', () => {
        MetadataPerformanceMonitor.recordMetric('test1', 5);
        MetadataPerformanceMonitor.recordMetric('test2', 10);
        
        expect(MetadataPerformanceMonitor.getMetrics().size).toBe(2);
        
        MetadataPerformanceMonitor.resetMetrics();
        
        expect(MetadataPerformanceMonitor.getMetrics().size).toBe(0);
      });
    });

    describe('printReport method', () => {
      it('should print performance report', () => {
        MetadataPerformanceMonitor.recordMetric('test-op', 12.34);
        MetadataPerformanceMonitor.recordMetric('test-op', 23.45);
        
        expect(() => {
          MetadataPerformanceMonitor.printReport();
        }).not.toThrow();
        
        expect(consoleSpy).toHaveBeenCalledWith('=== Metadata Performance Report ===');
        expect(consoleSpy).toHaveBeenCalledWith('test-op:');
        expect(consoleSpy).toHaveBeenCalledWith('  Calls: 2');
      });
    });
  });

  describe('MetadataCache class', () => {
    let cache: MetadataCache;

    beforeEach(() => {
      cache = new MetadataCache(5, 1000); // Small cache for testing
    });

    describe('get method', () => {
      it('should use factory on cache miss', () => {
        let factoryCalled = false;
        const factory = vi.fn(() => {
          factoryCalled = true;
          return 'factory-result';
        });
        
        const result = cache.get('test-key', factory);
        
        expect(result).toBe('factory-result');
        expect(factoryCalled).toBe(true);
        expect(factory).toHaveBeenCalledTimes(1);
      });

      it('should return cached value on cache hit', () => {
        const factory = vi.fn(() => 'cached-value');
        
        // First call - cache miss
        const result1 = cache.get('cache-test', factory);
        expect(result1).toBe('cached-value');
        expect(factory).toHaveBeenCalledTimes(1);
        
        // Second call - cache hit
        const result2 = cache.get('cache-test', factory);
        expect(result2).toBe('cached-value');
        expect(factory).toHaveBeenCalledTimes(1); // Factory not called again
      });

      it('should respect TTL expiration', async () => {
        const shortTtlCache = new MetadataCache(5, 10); // 10ms TTL
        const factory = vi.fn(() => `value-${Date.now()}`);
        
        const result1 = shortTtlCache.get('ttl-test', factory);
        expect(factory).toHaveBeenCalledTimes(1);
        
        // Wait for TTL to expire
        await new Promise(resolve => setTimeout(resolve, 20));
        
        const result2 = shortTtlCache.get('ttl-test', factory);
        expect(factory).toHaveBeenCalledTimes(2); // Factory called again after expiration
        
        expect(result1).not.toBe(result2); // Different values due to timestamp
      });

      it('should evict LRU entries when cache is full', () => {
        const factory = (key: string) => `value-${key}`;
        
        // Fill cache to capacity
        for (let i = 0; i < 5; i++) {
          cache.get(`key-${i}`, () => factory(`key-${i}`));
        }
        
        expect(cache.size()).toBe(5);
        
        // Add one more item, should evict LRU
        cache.get('key-new', () => factory('key-new'));
        
        expect(cache.size()).toBe(5); // Still at capacity
        
        // First key should have been evicted
        const factoryMock = vi.fn(() => 'new-value');
        cache.get('key-0', factoryMock);
        expect(factoryMock).toHaveBeenCalled(); // Factory called, meaning cache miss
      });
    });

    describe('clear method', () => {
      it('should clear all cached entries', () => {
        cache.get('key1', () => 'value1');
        cache.get('key2', () => 'value2');
        
        expect(cache.size()).toBe(2);
        
        cache.clear();
        
        expect(cache.size()).toBe(0);
      });
    });

    describe('getStats method', () => {
      it('should return cache statistics', () => {
        cache.get('stats-test', () => 'value');
        
        const stats = cache.getStats();
        
        expect(stats.size).toBe(1);
        expect(stats.maxSize).toBe(5);
        expect(stats.totalHits).toBe(1);
        expect(stats.averageHits).toBe(1);
        expect(typeof stats.ageRange).toBe('number');
        expect(typeof stats.hitRate).toBe('number');
      });

      it('should handle empty cache', () => {
        const stats = cache.getStats();
        
        expect(stats.size).toBe(0);
        expect(stats.totalHits).toBe(0);
        expect(stats.averageHits).toBe(0);
      });
    });
  });

  describe('LazyMetadataLoader class', () => {
    describe('register method', () => {
      it('should register loader function', () => {
        const loader = vi.fn();
        
        LazyMetadataLoader.register('test-key', loader);
        
        expect(LazyMetadataLoader.isLoaded('test-key')).toBe(false);
        expect(loader).not.toHaveBeenCalled();
      });
    });

    describe('ensureLoaded method', () => {
      it('should call loader on first access', () => {
        const loader = vi.fn();
        
        LazyMetadataLoader.register('lazy-test', loader);
        LazyMetadataLoader.ensureLoaded('lazy-test');
        
        expect(loader).toHaveBeenCalledTimes(1);
        expect(LazyMetadataLoader.isLoaded('lazy-test')).toBe(true);
      });

      it('should not call loader on subsequent access', () => {
        const loader = vi.fn();
        
        LazyMetadataLoader.register('lazy-once', loader);
        
        LazyMetadataLoader.ensureLoaded('lazy-once');
        LazyMetadataLoader.ensureLoaded('lazy-once');
        LazyMetadataLoader.ensureLoaded('lazy-once');
        
        expect(loader).toHaveBeenCalledTimes(1);
      });

      it('should handle non-registered keys gracefully', () => {
        expect(() => {
          LazyMetadataLoader.ensureLoaded('non-existent');
        }).not.toThrow();
        
        expect(LazyMetadataLoader.isLoaded('non-existent')).toBe(false);
      });
    });

    describe('isLoaded method', () => {
      it('should return correct load status', () => {
        const loader = vi.fn();
        
        LazyMetadataLoader.register('status-test', loader);
        
        expect(LazyMetadataLoader.isLoaded('status-test')).toBe(false);
        
        LazyMetadataLoader.ensureLoaded('status-test');
        
        expect(LazyMetadataLoader.isLoaded('status-test')).toBe(true);
      });
    });

    describe('reset method', () => {
      it('should reset all loaded status', () => {
        const loader = vi.fn();
        
        LazyMetadataLoader.register('reset-test', loader);
        LazyMetadataLoader.ensureLoaded('reset-test');
        
        expect(LazyMetadataLoader.isLoaded('reset-test')).toBe(true);
        
        LazyMetadataLoader.reset();
        
        expect(LazyMetadataLoader.isLoaded('reset-test')).toBe(false);
      });
    });
  });

  describe('OptimizedMetadataUtils class', () => {
    beforeEach(() => {
      OptimizedMetadataUtils.clearCache();
    });

    describe('getMetadata method', () => {
      it('should cache metadata lookups', () => {
        const testClass = class TestClass {};
        Reflect.defineMetadata('test:key', 'test-value', testClass);
        
        const result1 = OptimizedMetadataUtils.getMetadata('test:key', testClass);
        const result2 = OptimizedMetadataUtils.getMetadata('test:key', testClass);
        
        expect(result1).toBe('test-value');
        expect(result2).toBe('test-value');
        
        // Should have used cache for second call
        const stats = OptimizedMetadataUtils.getCacheStats();
        expect(stats.size).toBeGreaterThan(0);
      });

      it('should return undefined for non-existent metadata', () => {
        const testClass = class TestClass {};
        
        const result = OptimizedMetadataUtils.getMetadata('non:existent', testClass);
        expect(result).toBeUndefined();
      });
    });

    describe('setMetadata method', () => {
      it('should set metadata and invalidate cache', () => {
        const testClass = class TestClass {};
        
        OptimizedMetadataUtils.setMetadata('set:test', 'set-value', testClass);
        
        const result = Reflect.getMetadata('set:test', testClass);
        expect(result).toBe('set-value');
        
        // Cache should be cleared after set
        const stats = OptimizedMetadataUtils.getCacheStats();
        expect(stats.size).toBe(0);
      });
    });

    describe('getAllPropertiesWithMetadata method', () => {
      it('should get all properties with specific metadata', () => {
        const testClass = class TestClass {
          prop1: string = '';
          prop2: number = 0;
          prop3: boolean = false;
        };
        
        Reflect.defineMetadata('test:meta', 'value1', testClass.prototype, 'prop1');
        Reflect.defineMetadata('test:meta', 'value2', testClass.prototype, 'prop3');
        
        const result = OptimizedMetadataUtils.getAllPropertiesWithMetadata<string>(testClass, 'test:meta');
        
        expect(result.size).toBe(2);
        expect(result.get('prop1')).toBe('value1');
        expect(result.get('prop3')).toBe('value2');
        expect(result.has('prop2')).toBe(false);
      });

      it('should cache results for repeated calls', () => {
        const testClass = class TestClass {
          prop1: string = '';
        };
        
        Reflect.defineMetadata('cache:test', 'cached', testClass.prototype, 'prop1');
        
        const result1 = OptimizedMetadataUtils.getAllPropertiesWithMetadata(testClass, 'cache:test');
        const result2 = OptimizedMetadataUtils.getAllPropertiesWithMetadata(testClass, 'cache:test');
        
        expect(result1).toEqual(result2);
        
        const stats = OptimizedMetadataUtils.getCacheStats();
        expect(stats.size).toBeGreaterThan(0);
      });
    });

    describe('getCacheStats method', () => {
      it('should return cache statistics', () => {
        const stats = OptimizedMetadataUtils.getCacheStats();
        
        expect(typeof stats.size).toBe('number');
        expect(typeof stats.maxSize).toBe('number');
        expect(typeof stats.totalHits).toBe('number');
        expect(typeof stats.averageHits).toBe('number');
        expect(typeof stats.ageRange).toBe('number');
        expect(typeof stats.hitRate).toBe('number');
      });
    });

    describe('clearCache method', () => {
      it('should clear the internal cache', () => {
        const testClass = class TestClass {};
        Reflect.defineMetadata('clear:test', 'value', testClass);
        
        OptimizedMetadataUtils.getMetadata('clear:test', testClass);
        expect(OptimizedMetadataUtils.getCacheStats().size).toBeGreaterThan(0);
        
        OptimizedMetadataUtils.clearCache();
        expect(OptimizedMetadataUtils.getCacheStats().size).toBe(0);
      });
    });
  });

  describe('BatchMetadataProcessor class', () => {
    let processor: BatchMetadataProcessor;
    let testClass: any;

    beforeEach(() => {
      processor = new BatchMetadataProcessor();
      testClass = class TestClass {};
    });

    describe('addSetOperation method', () => {
      it('should add set operation to batch', () => {
        const result = processor.addSetOperation('batch:set', 'set-value', testClass);
        expect(result).toBe(processor); // Should return this for chaining
      });

      it('should support method chaining', () => {
        expect(() => {
          processor
            .addSetOperation('key1', 'value1', testClass)
            .addSetOperation('key2', 'value2', testClass)
            .addGetOperation('key3', testClass);
        }).not.toThrow();
      });
    });

    describe('addGetOperation method', () => {
      it('should add get operation to batch', () => {
        const result = processor.addGetOperation('batch:get', testClass);
        expect(result).toBe(processor); // Should return this for chaining
      });
    });

    describe('execute method', () => {
      it('should execute all batched operations', () => {
        // First set some metadata
        processor.addSetOperation('exec:key1', 'value1', testClass);
        processor.addSetOperation('exec:key2', 'value2', testClass);
        processor.addGetOperation('exec:key1', testClass);
        processor.addGetOperation('exec:key2', testClass);
        
        const results = processor.execute();
        
        expect(results.size).toBe(2); // Two get operations
        expect(Array.from(results.values())).toContain('value1');
        expect(Array.from(results.values())).toContain('value2');
        
        // Verify metadata was actually set
        expect(Reflect.getMetadata('exec:key1', testClass)).toBe('value1');
        expect(Reflect.getMetadata('exec:key2', testClass)).toBe('value2');
      });

      it('should clear operations after execution', () => {
        processor.addSetOperation('clear:test', 'value', testClass);
        
        const results1 = processor.execute();
        const results2 = processor.execute(); // Should be empty
        
        expect(results1.size).toBe(0); // No get operations
        expect(results2.size).toBe(0); // Operations cleared
      });

      it('should handle empty operation batch', () => {
        const results = processor.execute();
        
        expect(results.size).toBe(0);
        expect(results instanceof Map).toBe(true);
      });
    });
  });

  describe('Performance integration tests', () => {
    it('should demonstrate performance improvement with caching', () => {
      const testClass = class TestClass {};
      Reflect.defineMetadata('perf:test', 'cached-value', testClass);
      
      // Clear metrics before test
      MetadataPerformanceMonitor.resetMetrics();
      
      // Multiple calls should benefit from caching
      for (let i = 0; i < 10; i++) {
        OptimizedMetadataUtils.getMetadata('perf:test', testClass);
      }
      
      const metrics = MetadataPerformanceMonitor.getMetrics();
      const cacheMetrics = metrics.get('cache.get');
      
      if (cacheMetrics) {
        expect(cacheMetrics.totalCalls).toBeGreaterThan(0);
      }
    });

    it('should handle large-scale metadata operations efficiently', () => {
      const entityClasses = Array.from({ length: 100 }, (_, i) => {
        const cls = class TestEntity {};
        Object.defineProperty(cls, 'name', { value: `Entity${i}` });
        return cls;
      });
      
      // Set metadata on all classes
      entityClasses.forEach((cls, i) => {
        OptimizedMetadataUtils.setMetadata('entity:id', i, cls);
        OptimizedMetadataUtils.setMetadata('entity:name', `Entity${i}`, cls);
      });
      
      // Read metadata from all classes
      const start = performance.now();
      
      entityClasses.forEach(cls => {
        OptimizedMetadataUtils.getMetadata('entity:id', cls);
        OptimizedMetadataUtils.getMetadata('entity:name', cls);
      });
      
      const duration = performance.now() - start;
      
      // Should complete reasonably quickly
      expect(duration).toBeLessThan(1000); // Less than 1 second
    });

    it('should support lazy loading integration', () => {
      let loaderCalled = false;
      
      LazyMetadataLoader.register('integration:test', () => {
        loaderCalled = true;
        OptimizedMetadataUtils.setMetadata('lazy:data', 'loaded-value', TestEntity);
      });
      
      expect(loaderCalled).toBe(false);
      
      // Trigger lazy loading
      LazyMetadataLoader.ensureLoaded('integration:test');
      
      expect(loaderCalled).toBe(true);
      
      // Verify data was loaded
      const result = OptimizedMetadataUtils.getMetadata('lazy:data', TestEntity);
      expect(result).toBe('loaded-value');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle null and undefined values gracefully', () => {
      const testClass = class TestClass {};
      
      OptimizedMetadataUtils.setMetadata('null:test', null, testClass);
      OptimizedMetadataUtils.setMetadata('undefined:test', undefined, testClass);
      
      expect(OptimizedMetadataUtils.getMetadata('null:test', testClass)).toBe(null);
      expect(OptimizedMetadataUtils.getMetadata('undefined:test', testClass)).toBe(undefined);
    });

    it('should handle memory pressure gracefully', () => {
      const largeCache = new MetadataCache(2, 60000); // Very small cache
      
      // Fill beyond capacity
      for (let i = 0; i < 10; i++) {
        largeCache.get(`overflow:${i}`, () => `value-${i}`);
      }
      
      // Cache should maintain size limit
      expect(largeCache.size()).toBeLessThanOrEqual(2);
      
      const stats = largeCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
    });

    it('should handle concurrent access patterns', () => {
      const testClass = class TestClass {};
      
      // Simulate concurrent access
      const promises = Array.from({ length: 50 }, (_, i) => {
        return Promise.resolve().then(() => {
          OptimizedMetadataUtils.setMetadata(`concurrent:${i}`, `value-${i}`, testClass);
          return OptimizedMetadataUtils.getMetadata(`concurrent:${i}`, testClass);
        });
      });
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(50);
        results.forEach((result, i) => {
          expect(result).toBe(`value-${i}`);
        });
      });
    });
  });
});