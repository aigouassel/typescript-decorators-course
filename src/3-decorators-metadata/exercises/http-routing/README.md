# HTTP Routing Exercise

## Overview

This exercise demonstrates how to build HTTP routing systems using decorators and metadata - the core pattern behind frameworks like NestJS, Angular, and many Node.js web frameworks. You'll create a complete routing system with controllers, HTTP method decorators, middleware support, and automatic route registration.

## Learning Objectives

This exercise demonstrates:
- Building HTTP route decorators (@Get, @Post, @Put, @Delete)
- Implementing controller-based route organization
- Creating middleware integration with decorators
- Building automatic route discovery and registration
- Handling path parameters, query strings, and request/response objects
- How modern web frameworks work internally

## Prerequisites

- Complete Simple Metadata Integration and Validation Decorators exercises
- Basic understanding of HTTP methods and REST APIs
- Familiarity with Express.js or similar web frameworks
- Understanding of middleware concepts

## Exercise Structure

```
http-routing/
├── http-routing.ts        # Main routing implementation
├── http-routing.test.ts   # Test suite
├── decorators.ts          # Route and controller decorators
└── README.md             # This file
```

## Step-by-Step Implementation Guide

### Step 1: Analyze Existing Implementation (10 minutes)

Examine the current state of the routing system:

1. **Study the main file**: Review `http-routing.ts` for existing implementation
2. **Check test expectations**: Understand what functionality is expected
3. **Review types**: Examine interfaces for routing metadata
4. **Identify implementation status**: The system has complete implementation - study and understand it

**Current Status**: This exercise has a complete, sophisticated routing implementation. Your goal is to understand how it works and potentially extend it.

### Step 2: Understand Route Metadata Structure (15 minutes)

Study how routing information is stored in metadata:

```typescript
interface RouteMetadata {
  method: string;           // HTTP method (GET, POST, etc.)
  path: string;            // Route path pattern
  middleware?: Function[]; // Route-specific middleware
  description?: string;    // Route documentation
  parameters?: ParameterMetadata[]; // Parameter metadata
}

interface ControllerMetadata {
  basePath: string;        // Controller base path
  middleware?: Function[]; // Controller-wide middleware
  description?: string;    // Controller documentation
}
```

**Your Task**:
1. Understand how route metadata is structured
2. Study parameter metadata for path/query parameters
3. Examine middleware attachment mechanisms
4. Review error handling metadata

**Key Concepts**:
- Routes combine controller base path with method path
- Metadata stores both configuration and runtime information
- Parameter decorators provide request parsing information
- Middleware can be applied at controller or route level

### Step 3: Master HTTP Method Decorators (20 minutes)

Study the HTTP method decorators and their implementation:

```typescript
// HTTP method decorators
@Get(path?: string)
@Post(path?: string)
@Put(path?: string)
@Delete(path?: string)
@Patch(path?: string)
@Head(path?: string)
@Options(path?: string)

// Example usage
@Controller('/users')
class UserController {
  @Get('/')
  getAllUsers() { /* implementation */ }

  @Get('/:id')
  getUserById() { /* implementation */ }

  @Post('/')
  createUser() { /* implementation */ }
}
```

**Your Task**:
1. Understand how method decorators store route metadata
2. Study path pattern handling (including parameters)
3. Examine how decorators preserve method signatures
4. Test route registration with various path patterns

**Key Concepts**:
- Method decorators modify PropertyDescriptor
- Path patterns support parameters (/:id, /:name)
- Routes are combined with controller base paths
- Metadata includes HTTP method and path information

### Step 4: Implement Parameter Decorators (25 minutes)

Work with parameter extraction decorators:

```typescript
// Parameter decorators
@Param(name?: string)     // Extract path parameters
@Query(name?: string)     // Extract query parameters
@Body()                   // Extract request body
@Headers(name?: string)   // Extract headers
@Req()                    // Full request object
@Res()                    // Full response object

// Example usage
class UserController {
  @Get('/:id')
  getUserById(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Headers('authorization') auth?: string
  ) {
    // Implementation
  }

  @Post('/')
  createUser(
    @Body() userData: CreateUserDto,
    @Headers() headers: any
  ) {
    // Implementation
  }
}
```

**Your Task**:
1. Understand parameter decorator implementation
2. Study parameter metadata storage and retrieval
3. Implement parameter extraction logic
4. Test various parameter extraction scenarios

**Key Concepts**:
- Parameter decorators use parameter index for identification
- Metadata maps parameter indices to extraction logic
- Different extractors handle different parts of HTTP request
- Type information helps with automatic parsing

### Step 5: Build Route Registration System (30 minutes)

Study and enhance the route registration and discovery system:

```typescript
class RouteRegistry {
  static registerController(controllerClass: any): void;
  static discoverRoutes(controllerClass: any): RouteInfo[];
  static generateRouteTable(): RouteTable;
  static bindToExpress(app: Express): void;
}
```

**Your Task**:
1. Understand controller registration process
2. Study route discovery algorithms
3. Examine Express.js integration
4. Test route registration with multiple controllers

**Key Concepts**:
- Controllers are registered with global registry
- Route discovery extracts all metadata from classes
- Express integration creates actual HTTP endpoints
- Route table provides overview of all registered routes

### Step 6: Implement Middleware Integration (25 minutes)

Work with middleware decorators and integration:

```typescript
// Middleware decorators
@UseMiddleware(...middleware: Function[])
@UseBefore(middleware: Function)
@UseAfter(middleware: Function)
@UseGuards(...guards: Function[])

// Example usage
@Controller('/api')
@UseMiddleware(authenticationMiddleware, loggingMiddleware)
class ApiController {
  @Get('/protected')
  @UseGuards(adminGuard)
  @UseBefore(validationMiddleware)
  protectedEndpoint() {
    // Implementation
  }
}
```

**Your Task**:
1. Understand middleware decorator implementation
2. Study middleware execution order and composition
3. Implement guard (authorization) middleware
4. Test complex middleware scenarios

**Key Concepts**:
- Middleware can be applied at controller or method level
- Execution order matters for middleware composition
- Guards provide authorization/authentication logic
- Error handling middleware catches and processes errors

### Step 7: Add Request/Response Processing (20 minutes)

Implement request parsing and response formatting:

```typescript
// Response formatting decorators
@HttpCode(code: number)
@Header(name: string, value: string)
@Redirect(url: string, statusCode?: number)
@Render(view: string)

// Request processing
class RequestProcessor {
  static processParameters(method: Function, req: any, res: any): any[];
  static formatResponse(result: any, metadata: ResponseMetadata): any;
  static handleErrors(error: Error, req: any, res: any): void;
}
```

**Your Task**:
1. Implement request parameter processing
2. Create response formatting system
3. Add error handling and status code management
4. Test with various request/response scenarios

**Key Concepts**:
- Parameter processing extracts values from HTTP request
- Response formatting handles serialization and status codes
- Error handling provides consistent error responses
- Content negotiation supports different response formats

### Step 8: Build Route Documentation System (15 minutes)

Create automatic API documentation generation:

```typescript
// Documentation decorators
@ApiTags('users')
@ApiOperation({ summary: 'Get user by ID' })
@ApiParam({ name: 'id', type: 'string', description: 'User ID' })
@ApiResponse({ status: 200, description: 'User found' })
@ApiResponse({ status: 404, description: 'User not found' })

// Documentation generator
class ApiDocumentationGenerator {
  static generateOpenApiSpec(controllers: any[]): OpenApiSpec;
  static generateRouteTable(controllers: any[]): RouteTableSpec;
}
```

**Your Task**:
1. Implement API documentation decorators
2. Create OpenAPI specification generation
3. Build route table documentation
4. Test documentation with complex controllers

### Step 9: Advanced Routing Features (20 minutes)

Implement advanced routing capabilities:

```typescript
// Advanced routing decorators
@Version('1.0')
@Subdomain('api')
@HostFilter('admin.example.com')
@RateLimit({ requests: 100, windowMs: 60000 })

// Route constraints and validation
@RouteConstraint(constraint: (req: any) => boolean)
@CacheResponse(ttl: number)
@RequireHttps()
```

**Your Task**:
1. Implement versioning support
2. Add subdomain and host filtering
3. Create rate limiting integration
4. Implement route-level caching

### Step 10: Testing and Integration (15 minutes)

Create comprehensive tests and framework integration:

**Your Task**:
1. Test complete routing system end-to-end
2. Create Express.js integration examples
3. Test error scenarios and edge cases
4. Benchmark routing performance

## Expected Implementation Timeline

- **Step 1**: 10 minutes - Analyze existing implementation
- **Step 2**: 15 minutes - Understand metadata structure
- **Step 3**: 20 minutes - HTTP method decorators
- **Step 4**: 25 minutes - Parameter decorators
- **Step 5**: 30 minutes - Route registration
- **Step 6**: 25 minutes - Middleware integration
- **Step 7**: 20 minutes - Request/response processing
- **Step 8**: 15 minutes - Documentation system
- **Step 9**: 20 minutes - Advanced features
- **Step 10**: 15 minutes - Testing and integration

**Total Time**: ~3 hours

## Testing the Implementation

Test the routing system thoroughly:

```bash
# Run routing tests
npm test src/3-decorators-metadata/exercises/http-routing/

# Test specific functionality
npm test -- --grep "route registration"
npm test -- --grep "parameter extraction"
npm test -- --grep "middleware"

# Integration testing with Express
npm test -- --grep "integration"

# Watch mode
npm test -- --watch src/3-decorators-metadata/exercises/http-routing/
```

## Example Implementation

### Complete Controller Example
```typescript
@Controller('/api/users')
@UseMiddleware(authenticationMiddleware, loggingMiddleware)
@ApiTags('Users')
export class UserController {
  @Get('/')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @CacheResponse(300) // 5 minutes
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Headers('accept') accept: string
  ): Promise<User[]> {
    // Implementation
    return await this.userService.findAll({ page, limit });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(200)
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('/')
  @ApiOperation({ summary: 'Create new user' })
  @UseBefore(validationMiddleware)
  @UseGuards(adminGuard)
  @HttpCode(201)
  async createUser(
    @Body() userData: CreateUserDto,
    @Headers('content-type') contentType: string
  ): Promise<User> {
    return await this.userService.create(userData);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user' })
  @UseGuards(ownershipGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto
  ): Promise<User> {
    return await this.userService.update(id, updateData);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user' })
  @UseGuards(adminGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
```

### Express Integration Example
```typescript
// Express integration
const app = express();
const routeRegistry = new RouteRegistry();

// Register controllers
routeRegistry.registerController(UserController);
routeRegistry.registerController(ProductController);
routeRegistry.registerController(OrderController);

// Bind routes to Express
routeRegistry.bindToExpress(app);

// Generate API documentation
const apiSpec = routeRegistry.generateOpenApiSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Routes registered:');
  routeRegistry.printRouteTable();
});
```

## Common Challenges and Solutions

### Challenge 1: Route Path Conflicts
**Problem**: Multiple routes matching the same path
**Solution**: 
- Implement route priority system
- Use more specific paths first
- Add route conflict detection and warnings

### Challenge 2: Parameter Type Conversion
**Problem**: Converting string parameters to proper types
**Solution**: 
- Use TypeScript metadata for type information
- Implement automatic type conversion
- Add validation for parameter types

### Challenge 3: Middleware Execution Order
**Problem**: Ensuring correct middleware execution sequence
**Solution**: 
- Define clear middleware ordering rules
- Implement middleware priority system
- Document middleware execution flow

### Challenge 4: Error Response Consistency
**Problem**: Inconsistent error response formats
**Solution**: 
- Create global error handling middleware
- Define standard error response format
- Implement custom exception classes

## Key Concepts to Master

1. **Route Discovery**: Automatically finding and registering routes from metadata
2. **Parameter Extraction**: Converting HTTP request data to method parameters
3. **Middleware Composition**: Combining multiple middleware functions
4. **Response Formatting**: Converting method results to HTTP responses
5. **Error Handling**: Providing consistent error responses
6. **Documentation Generation**: Creating API docs from metadata

## Real-World Applications

This routing system demonstrates patterns used by:

- **NestJS**: Comprehensive decorator-based web framework
- **Angular**: Component routing and HTTP client
- **Spring Boot**: Java annotation-based web framework
- **ASP.NET Core**: C# attribute-based routing
- **Express Decorators**: Various Express.js decorator libraries

## Next Steps

After completing this exercise,

1. **Study NestJS source code** - See how professionals implement routing
2. **Build complete REST API** - Create a full application with your routing system
3. **Add WebSocket support** - Extend to real-time communication
4. **Move to Exercise 4** - Apply patterns to ORM and database mapping

This exercise provides deep understanding of how modern web frameworks handle HTTP routing through decorators and metadata. These patterns are essential for building scalable, maintainable web applications.