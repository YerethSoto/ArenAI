import express from 'express';
import { apiRouter } from './routes/index.js';
import { errorHandler, ApiError } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', apiRouter);

  app.use((_req, _res, next) => {
    next(new ApiError(404, 'Route not found'));
  });

  app.use(errorHandler);

  return app;
}
