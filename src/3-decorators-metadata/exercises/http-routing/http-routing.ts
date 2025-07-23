import 'reflect-metadata';
import { 
  controller, 
  get, 
  post, 
  put, 
  del, 
  getRouteInfo, 
  getAllRoutes,
  type RouteInfo,
  type ControllerInfo 
} from './decorators';

/**
 * Exercise 2: HTTP Route Decorator System
 * Create decorators for a simple HTTP routing system: @controller, @get, @post, @put, @delete
 */

export type { RouteInfo, ControllerInfo };
export { getRouteInfo, getAllRoutes };

// Test controllers
@controller('/api/users')
export class UserController {
  @get('/')
  getAllUsers(): string {
    return 'All users';
  }

  @get('/:id')
  getUser(id: string): string {
    return `User ${id}`;
  }

  @post('/')
  createUser(userData: any): string {
    return 'User created';
  }

  @put('/:id')
  updateUser(id: string, userData: any): string {
    return `User ${id} updated`;
  }

  @del('/:id')
  deleteUser(id: string): string {
    return `User ${id} deleted`;
  }

  @get('/:id/posts/:postId')
  getUserPost(id: string, postId: string): string {
    return `User ${id}, Post ${postId}`;
  }

  // Non-decorated method
  privateMethod(): string {
    return 'private';
  }
}

@controller('/api/posts')
export class PostController {
  @get('/')
  getAllPosts(): string {
    return 'All posts';
  }

  @post('/')
  createPost(postData: any): string {
    return 'Post created';
  }
}

// Controller without base path
@controller('')
export class RootController {
  @get('/health')
  healthCheck(): string {
    return 'OK';
  }
}