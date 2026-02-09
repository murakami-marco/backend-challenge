const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EstateSpace Backend API',
      version: '1.0.0',
      description:
        'A microservice API for managing organizations with JWT authentication',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
          },
        },
        Location: {
          type: 'object',
          required: ['street', 'city', 'state', 'zip', 'country'],
          properties: {
            street: {
              type: 'string',
              example: '123 Main St',
            },
            city: {
              type: 'string',
              example: 'New York',
            },
            state: {
              type: 'string',
              example: 'NY',
            },
            zip: {
              type: 'string',
              example: '10001',
            },
            country: {
              type: 'string',
              example: 'USA',
            },
          },
        },
        Organization: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Acme Corporation',
            },
            addresses: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Location',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
