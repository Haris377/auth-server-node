import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import roleRoutes from './routes/role.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import departmentRouter from './routes/department.routes';

// Load environment variables
dotenv.config();

// Test database connection
const prisma = new PrismaClient();
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    // Test a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query test successful');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Server API',
      version: '1.0.0',
      description: 'A comprehensive authentication and authorization server with role-based access control',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
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
    },
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Auth Server API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  // Test database connection before starting server
  await testDatabaseConnection();
  
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
