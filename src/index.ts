import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import { AppDataSource } from './data-source';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'E-commerce API is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Health check for database
app.get('/health', async (req: Request, res: Response) => {
  try {
    if (AppDataSource.isInitialized) {
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use('/api/v1', routes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized!');
    console.log('📊 Database connected successfully');
    console.log('🔄 Schema synchronized with database');

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
    });
  })
  .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });

export default app;
