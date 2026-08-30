import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  // Basic middlewares
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  // Mount /api endpoints both at /api and root /
  // to ensure compatibility with Vercel rewrites and standalone Express routing
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return app;
}
