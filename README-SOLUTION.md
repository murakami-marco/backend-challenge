# EstateSpace Back End Development Challenge - Solution

A Node.js/Express microservice for managing organizations with JWT authentication, MongoDB persistence, comprehensive validation, and API documentation.

## Features

- ✅ RESTful API for Organization management (CRUD operations)
- ✅ JWT-based authentication with Bearer tokens
- ✅ User registration and login
- ✅ JSON Patch support for partial updates
- ✅ MongoDB with Mongoose ODM
- ✅ Joi validation for all inputs
- ✅ Comprehensive error handling with proper HTTP status codes
- ✅ Swagger/OpenAPI documentation
- ✅ Unit tests with Mocha and Chai
- ✅ Code formatting with Prettier
- ✅ Docker Compose for MongoDB

## Technology Stack

- **Runtime**: Node.js v20 (LTS)
- **Framework**: Express.js
- **Database**: MongoDB (via Docker Compose)
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Testing**: Mocha + Chai + Chai-HTTP
- **Code Formatting**: Prettier
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js v20.x (use nvm: `nvm use`)
- Docker and Docker Compose
- npm

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

```bash
docker compose up -d
```

This will start MongoDB on `localhost:27017` with a persistent volume.

### 3. Configure Environment Variables

The `.env` file is already created with default values. You can modify it if needed:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/estatespace
JWT_SECRET=your-secret-key-please-change-this-in-production
JWT_EXPIRES_IN=24h
```

**Important**: Change `JWT_SECRET` in production!

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:8080`

### 5. Access API Documentation

Open your browser and navigate to:
```
http://localhost:8080/api-docs
```

This will open the Swagger UI where you can explore and test all endpoints.

### 6. Seed Dummy Data (Optional)

To populate your database with dummy users and organizations:
```bash
node src/scripts/seed.js
```

This will create credentials you can use for testing:
- **Admin**: `admin@example.com` / `password123`
- **User**: `user@test.io` / `securePassword789`

## API Endpoints

### Authentication (Public)

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/auth/register` | Register a new user         |
| POST   | `/auth/login`    | Login and receive JWT token |

### Organizations (Protected - Require Bearer Token)

| Method | Endpoint            | Description                      |
| ------ | ------------------- | -------------------------------- |
| POST   | `/organization`     | Create new organization          |
| GET    | `/organization`     | List/search organizations        |
| GET    | `/organization/:id` | Get specific organization by ID  |
| PATCH  | `/organization/:id` | Update organization (JSON Patch) |
| DELETE | `/organization/:id` | Delete organization              |

### Health Check

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

## Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response will include a JWT token:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "user@example.com"
  }
}
```

### 3. Create an Organization

```bash
curl -X POST http://localhost:8080/organization \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corporation",
    "addresses": [
      {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      }
    ]
  }'
```

### 4. Get All Organizations

```bash
curl -X GET http://localhost:8080/organization \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Search Organizations
Not supported via query parameters. Use:
```bash
curl -X GET http://localhost:8080/organization \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get Organization by ID

```bash
curl -X GET http://localhost:8080/organization/ORGANIZATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Update Organization (JSON Patch)

```bash
curl -X PATCH http://localhost:8080/organization/ORGANIZATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '[
    {
      "op": "replace",
      "path": "/name",
      "value": "New Organization Name"
    },
    {
      "op": "add",
      "path": "/addresses/-",
      "value": {
        "street": "456 Oak Ave",
        "city": "Boston",
        "state": "MA",
        "zip": "02101",
        "country": "USA"
      }
    }
  ]'
```

### 8. Delete Organization

```bash
curl -X DELETE http://localhost:8080/organization/ORGANIZATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Models

### User

```javascript
{
  "email": "user@example.com",    // Required, unique, validated
  "password": "hashed_password"   // Required, min 6 chars, bcrypt hashed
}
```

### Organization

```javascript
{
  "_id": "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  "name": "Acme Corporation",          // Required
  "addresses": [                       // Array of Location objects
    {
      "street": "123 Main St",         // Required
      "city": "New York",              // Required
      "state": "NY",                   // Required
      "zip": "10001",                  // Required
      "country": "USA"                 // Required
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Testing

Run all unit tests:

```bash
npm test
```

This will run tests for:
- User model (password hashing, comparison)
- Authentication endpoints (register, login)
- Organization endpoints (CRUD operations, JSON Patch)

## Code Formatting

Format code with Prettier:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Validation error or bad request
- **401**: Authentication error (missing/invalid token)
- **404**: Resource not found
- **409**: Duplicate resource (e.g., email already exists)
- **500**: Server error

Error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Project Structure

```
backend-challenge/
├── src/
│   ├── server.js              # Main server file
│   ├── routes.js              # All route definitions
│   ├── models/
│   │   ├── User.js            # User model with password hashing
│   │   └── Organization.js    # Organization model
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   ├── validators/
│   │   ├── userValidator.js   # Joi schemas for User
│   │   └── orgValidator.js    # Joi schemas for Organization
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── swagger.js         # Swagger configuration
│   └── scripts/
│       └── seed.js            # Database seeding script
├── test/
│   ├── user.test.js           # User model tests
│   ├── auth.test.js           # Authentication tests
│   └── organization.test.js   # Organization endpoint tests
├── docker-compose.yml         # MongoDB container
├── .nvmrc                     # Node version
├── .prettierrc                # Prettier config
├── .env                       # Environment variables
└── package.json               # Dependencies and scripts
```

## Development Notes

### Logging

The application uses `console.log` for logging:
- Request logging (method, path, timestamp)
- User registration/login events
- Organization CRUD operations
- Error stack traces

### Security Features

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 24 hours (configurable)
- Passwords are never returned in API responses
- All organization endpoints require authentication
- Input validation on all endpoints

### Query Parameters

The `GET /organization` endpoint does not support filtering parameters and will return all organizations.

## Stopping the Application

Stop the server:
```bash
# Press Ctrl+C in the terminal running the server
```

Stop MongoDB:
```bash
docker compose down
```

Stop MongoDB and remove volumes (deletes all data):
```bash
docker compose down -v
```

## License

This project is [MIT licensed](https://en.wikipedia.org/wiki/MIT_License).
