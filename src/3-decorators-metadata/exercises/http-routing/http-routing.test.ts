import { describe, it, expect } from 'vitest';
import { 
  UserController, 
  PostController, 
  RootController,
  controller, 
  get, 
  post, 
  put, 
  del,
  getRouteInfo,
  getAllRoutes,
  RouteInfo,
  ControllerInfo 
} from './http-routes';

describe('Exercise 2: HTTP Route Decorator System', () => {
  describe('@controller decorator', () => {
    it('should add controller metadata to class', () => {
      const controllerInfo = getRouteInfo(UserController);
      
      expect(controllerInfo).toBeDefined();
      expect(controllerInfo?.basePath).toBe('/api/users');
    });

    it('should handle empty base path', () => {
      const controllerInfo = getRouteInfo(RootController);
      
      expect(controllerInfo).toBeDefined();
      expect(controllerInfo?.basePath).toBe('');
    });

    it('should not affect non-decorated classes', () => {
      class PlainController {
        method() { return 'plain'; }
      }
      
      const controllerInfo = getRouteInfo(PlainController);
      expect(controllerInfo).toBeUndefined();
    });
  });

  describe('HTTP method decorators', () => {
    it('should register GET routes correctly', () => {
      const routes = getAllRoutes(UserController);
      const getRoutes = routes.filter(r => r.method === 'GET');
      
      expect(getRoutes).toHaveLength(3);
      expect(getRoutes.map(r => r.path)).toContain('/');
      expect(getRoutes.map(r => r.path)).toContain('/:id');
      expect(getRoutes.map(r => r.path)).toContain('/:id/posts/:postId');
    });

    it('should register POST routes correctly', () => {
      const routes = getAllRoutes(UserController);
      const postRoutes = routes.filter(r => r.method === 'POST');
      
      expect(postRoutes).toHaveLength(1);
      expect(postRoutes[0].path).toBe('/');
      expect(postRoutes[0].handler).toBe('createUser');
    });

    it('should register PUT routes correctly', () => {
      const routes = getAllRoutes(UserController);
      const putRoutes = routes.filter(r => r.method === 'PUT');
      
      expect(putRoutes).toHaveLength(1);
      expect(putRoutes[0].path).toBe('/:id');
      expect(putRoutes[0].handler).toBe('updateUser');
    });

    it('should register DELETE routes correctly', () => {
      const routes = getAllRoutes(UserController);
      const deleteRoutes = routes.filter(r => r.method === 'DELETE');
      
      expect(deleteRoutes).toHaveLength(1);
      expect(deleteRoutes[0].path).toBe('/:id');
      expect(deleteRoutes[0].handler).toBe('deleteUser');
    });
  });

  describe('Parameter extraction', () => {
    it('should extract single parameters from route paths', () => {
      const routes = getAllRoutes(UserController);
      const getUserRoute = routes.find(r => r.handler === 'getUser');
      
      expect(getUserRoute?.params).toEqual(['id']);
    });

    it('should extract multiple parameters from route paths', () => {
      const routes = getAllRoutes(UserController);
      const getUserPostRoute = routes.find(r => r.handler === 'getUserPost');
      
      expect(getUserPostRoute?.params).toEqual(['id', 'postId']);
    });

    it('should handle routes without parameters', () => {
      const routes = getAllRoutes(UserController);
      const getAllUsersRoute = routes.find(r => r.handler === 'getAllUsers');
      
      expect(getAllUsersRoute?.params).toEqual([]);
    });
  });

  describe('Route information retrieval', () => {
    it('should provide complete controller information', () => {
      const controllerInfo = getRouteInfo(UserController);
      
      expect(controllerInfo).toBeDefined();
      expect(controllerInfo?.basePath).toBe('/api/users');
      expect(controllerInfo?.routes).toHaveLength(6);
    });

    it('should list all routes for a controller', () => {
      const routes = getAllRoutes(UserController);
      
      expect(routes).toHaveLength(6);
      
      const handlers = routes.map(r => r.handler);
      expect(handlers).toContain('getAllUsers');
      expect(handlers).toContain('getUser');
      expect(handlers).toContain('createUser');
      expect(handlers).toContain('updateUser');
      expect(handlers).toContain('deleteUser');
      expect(handlers).toContain('getUserPost');
    });

    it('should not include non-decorated methods', () => {
      const routes = getAllRoutes(UserController);
      const handlers = routes.map(r => r.handler);
      
      expect(handlers).not.toContain('privateMethod');
    });
  });

  describe('Multiple controllers', () => {
    it('should handle multiple controllers independently', () => {
      const userControllerInfo = getRouteInfo(UserController);
      const postControllerInfo = getRouteInfo(PostController);
      
      expect(userControllerInfo?.basePath).toBe('/api/users');
      expect(postControllerInfo?.basePath).toBe('/api/posts');
      
      const userRoutes = getAllRoutes(UserController);
      const postRoutes = getAllRoutes(PostController);
      
      expect(userRoutes).toHaveLength(6);
      expect(postRoutes).toHaveLength(2);
    });
  });

  describe('Route metadata structure', () => {
    it('should have correct structure for route info', () => {
      const routes = getAllRoutes(UserController);
      const sampleRoute = routes[0];
      
      expect(sampleRoute).toHaveProperty('method');
      expect(sampleRoute).toHaveProperty('path');
      expect(sampleRoute).toHaveProperty('handler');
      expect(sampleRoute).toHaveProperty('params');
      
      expect(typeof sampleRoute.method).toBe('string');
      expect(typeof sampleRoute.path).toBe('string');
      expect(typeof sampleRoute.handler).toBe('string');
      expect(Array.isArray(sampleRoute.params)).toBe(true);
    });
  });

  describe('Decorator reusability', () => {
    it('should work when applied to different controllers', () => {
      @controller('/api/test')
      class TestController {
        @get('/test')
        testMethod(): string {
          return 'test';
        }
      }
      
      const controllerInfo = getRouteInfo(TestController);
      const routes = getAllRoutes(TestController);
      
      expect(controllerInfo?.basePath).toBe('/api/test');
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('GET');
      expect(routes[0].path).toBe('/test');
      expect(routes[0].handler).toBe('testMethod');
    });
  });

  describe('Integration scenarios', () => {
    it('should support building route tables for entire application', () => {
      const controllers = [UserController, PostController, RootController];
      const routeTable = controllers.map(controller => ({
        controller: controller.name,
        ...getRouteInfo(controller)
      }));
      
      expect(routeTable).toHaveLength(3);
      expect(routeTable.map(r => r.basePath)).toEqual(['/api/users', '/api/posts', '']);
    });

    it('should enable route matching logic', () => {
      const routes = getAllRoutes(UserController);
      const getUserRoute = routes.find(r => r.handler === 'getUser');
      
      // Simulate route matching
      const pathTemplate = getUserRoute?.path; // '/:id'
      const actualPath = '/123';
      
      if (pathTemplate && getUserRoute?.params) {
        const regex = pathTemplate.replace(/:(\w+)/g, '([^/]+)');
        const match = actualPath.match(new RegExp(`^${regex}$`));
        
        expect(match).toBeTruthy();
        if (match) {
          const paramValues = match.slice(1);
          const params = Object.fromEntries(
            getUserRoute.params.map((param, i) => [param, paramValues[i]])
          );
          expect(params).toEqual({ id: '123' });
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle controllers with no routes', () => {
      @controller('/api/empty')
      class EmptyController {
        nonDecoratedMethod(): string {
          return 'empty';
        }
      }
      
      const controllerInfo = getRouteInfo(EmptyController);
      const routes = getAllRoutes(EmptyController);
      
      expect(controllerInfo?.basePath).toBe('/api/empty');
      expect(routes).toHaveLength(0);
    });

    it('should handle complex parameter patterns', () => {
      @controller('/api/complex')
      class ComplexController {
        @get('/users/:userId/posts/:postId/comments/:commentId')
        getComment(userId: string, postId: string, commentId: string): string {
          return 'comment';
        }
      }
      
      const routes = getAllRoutes(ComplexController);
      const complexRoute = routes[0];
      
      expect(complexRoute.params).toEqual(['userId', 'postId', 'commentId']);
    });
  });
});