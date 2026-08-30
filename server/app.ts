import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  // CORS and preflight handling
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Body parser middleware:
  // Vercel serverless helper automatically parses req.body before passing to handler.
  // We only run express.json() if req.body has not been parsed yet.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.body !== undefined && req.body !== null) {
      return next();
    }
    express.json({ limit: '25mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '25mb' })(req, res, next);
    });
  });

  // Cookie parser
  app.use(cookieParser());

  // Mount /api endpoints both at /api and root /
  // to ensure compatibility with Vercel rewrites and standalone Express routing
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // Health endpoint
  app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Catch-all 404 for unhandled API routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint не найден: ${req.method} ${req.originalUrl || req.url}`,
    });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    res.status(err?.status || 500).json({
      error: 'Internal Server Error',
      message: err?.message || 'Внутренняя ошибка сервера',
    });
  });

  return app;
}
