/**
 * Decorators for Exercise 2: HTTP Route Decorator System
 */

export interface RouteInfo {
  method: string;
  path: string;
  handler: string;
  params?: string[];
}

export interface ControllerInfo {
  basePath: string;
  routes: RouteInfo[];
}

const CONTROLLER_KEY = 'http:controller';
const ROUTES_KEY = 'http:routes';

// TODO: Implement the @controller decorator
export function controller(basePath: string) {
  return function <T extends new(...args: any[]) => {}>(constructor: T) {
    const existingRoutes: RouteInfo[] = Reflect.getMetadata(ROUTES_KEY, constructor.prototype) || [];
    
    const controllerInfo: ControllerInfo = {
      basePath,
      routes: existingRoutes
    };
    
    Reflect.defineMetadata(CONTROLLER_KEY, controllerInfo, constructor);
    return constructor;
  };
}

// Helper function to create HTTP method decorators
function createHttpMethodDecorator(method: string) {
  return function (path: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const routes: RouteInfo[] = Reflect.getMetadata(ROUTES_KEY, target) || [];
      
      // Extract parameter names from path (e.g., /users/:id/:action -> ['id', 'action'])
      const params = path.match(/:(\w+)/g)?.map(param => param.substring(1)) || [];
      
      const routeInfo: RouteInfo = {
        method: method.toUpperCase(),
        path,
        handler: propertyKey,
        params
      };
      
      routes.push(routeInfo);
      Reflect.defineMetadata(ROUTES_KEY, routes, target);
      
      return descriptor;
    };
  };
}

// TODO: Implement HTTP method decorators
export const get = createHttpMethodDecorator('GET');
export const post = createHttpMethodDecorator('POST');
export const put = createHttpMethodDecorator('PUT');
export const del = createHttpMethodDecorator('DELETE'); // 'delete' is a reserved keyword

// Helper function to get route information
export function getRouteInfo(constructor: any): ControllerInfo | undefined {
  return Reflect.getMetadata(CONTROLLER_KEY, constructor);
}

export function getAllRoutes(constructor: any): RouteInfo[] {
  return Reflect.getMetadata(ROUTES_KEY, constructor.prototype) || [];
}