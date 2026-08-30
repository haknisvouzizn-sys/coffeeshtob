import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server/app';

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Unhandled Vercel function error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err?.message || 'Ошибка обработки запроса',
    }));
  }
}
