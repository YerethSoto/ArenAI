import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { aiRouter } from './routes/ai.js';
import { errorHandler, ApiError } from './middleware/errorHandler.js';
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    // Debug logging
    app.use((req, _res, next) => {
        console.log(`[REQUEST] ${req.method} ${req.path}`);
        next();
    });
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    // Root route for Cloud Run health checks
    app.get('/', (_req, res) => {
        res.send('ArenAI Backend Running');
    });
    app.use('/api', apiRouter);
    app.use('/ai', aiRouter);
    app.use((_req, _res, next) => {
        next(new ApiError(404, 'Route not found'));
    });
    app.use(errorHandler);
    return app;
}
