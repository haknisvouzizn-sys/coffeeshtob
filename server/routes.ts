import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  requireAdminAuth,
  requireOwnerAuth,
  checkRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  verifyPassword,
  getExpectedAdminHash,
  getExpectedOwnerHash,
  setRuntimeAdminPasswordHash,
  hashPassword,
} from './auth';
import {
  commitContentToGitHubServer,
  commitImageToGitHubServer,
  getGitHubEnvConfig,
  isGitHubConfigured,
} from './github';
import { sanitizeSiteContent } from './validation';

export const apiRouter = Router();

// Helper to set session cookie
function setAuthCookie(res: Response, role: 'admin' | 'owner') {
  const token = createSessionToken(role, 48); // 48 hours expiry
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 48 * 60 * 60 * 1000,
  });
}

// --------------------------------------------------------------------------
// ADMIN AUTHENTICATION
// --------------------------------------------------------------------------

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
  
  const rateStatus = checkRateLimit(clientIp);
  if (!rateStatus.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Слишком много попыток входа. Пожалуйста, подождите ${rateStatus.waitSeconds} сек.`,
    });
    return;
  }

  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Bad Request', message: 'Введите пароль' });
    return;
  }

  const expectedHash = getExpectedAdminHash();
  const isValid = verifyPassword(password, expectedHash);

  if (!isValid) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Unauthorized', message: 'Неверный пароль администратора' });
    return;
  }

  resetLoginAttempts(clientIp);
  setAuthCookie(res, 'admin');

  res.json({
    success: true,
    message: 'Вход выполнен успешно',
    role: 'admin',
  });
});

apiRouter.post('/admin/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Сессия завершена' });
});

apiRouter.get('/admin/me', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = verifySessionToken(token);

  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    role: session.role,
  });
});

// --------------------------------------------------------------------------
// ADMIN CONTENT & PUBLISHING
// --------------------------------------------------------------------------

apiRouter.get('/admin/content', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const publicContentPath = path.join(process.cwd(), 'public', 'content.json');
    if (fs.existsSync(publicContentPath)) {
      const data = fs.readFileSync(publicContentPath, 'utf8');
      res.json(JSON.parse(data));
      return;
    }
  } catch (err) {
    console.warn('Failed to read local content.json:', err);
  }

  res.status(404).json({ error: 'Not Found', message: 'Файл контента не найден' });
});

apiRouter.post('/admin/publish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body || {};
    if (!content) {
      res.status(400).json({ error: 'Bad Request', message: 'Отсутствуют данные контента' });
      return;
    }

    // 1. Sanitize & validate content
    const sanitized = sanitizeSiteContent(content);

    // 2. Commit to GitHub Server-Side
    const result = await commitContentToGitHubServer(sanitized);

    res.json({
      success: true,
      message: result.message,
      sha: result.sha,
    });
  } catch (err: any) {
    console.error('Publish error:', err);
    res.status(500).json({
      error: 'Publish Failed',
      message: 'Не удалось опубликовать изменения. Ваши изменения сохранены локально. Попробуйте ещё раз.',
    });
  }
});

apiRouter.post('/admin/upload', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { fileData, fileName } = req.body || {};
    if (!fileData || !fileName) {
      res.status(400).json({ error: 'Bad Request', message: 'Отсутствуют данные файла' });
      return;
    }

    // Base64 decoding
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 10MB limit
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File too large', message: 'Размер файла превышает 10 МБ' });
      return;
    }

    const result = await commitImageToGitHubServer(buffer, fileName);
    res.json(result);
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({
      error: 'Upload Failed',
      message: err.message || 'Ошибка загрузки изображения',
    });
  }
});

// --------------------------------------------------------------------------
// OWNER AUTHENTICATION & DASHBOARD
// --------------------------------------------------------------------------

apiRouter.post('/owner/login', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
  
  const rateStatus = checkRateLimit(clientIp);
  if (!rateStatus.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Слишком много попыток входа. Подождите ${rateStatus.waitSeconds} сек.`,
    });
    return;
  }

  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Bad Request', message: 'Введите пароль разработчика' });
    return;
  }

  const expectedHash = getExpectedOwnerHash();
  const isValid = verifyPassword(password, expectedHash);

  if (!isValid) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Unauthorized', message: 'Неверный пароль разработчика' });
    return;
  }

  resetLoginAttempts(clientIp);
  setAuthCookie(res, 'owner');

  res.json({
    success: true,
    message: 'Вход разработчика выполнен успешно',
    role: 'owner',
  });
});

apiRouter.get('/owner/status', requireOwnerAuth, (_req: Request, res: Response) => {
  const github = getGitHubEnvConfig();
  const configured = isGitHubConfigured();

  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    github: {
      configured,
      owner: github.owner || '(не задан в GITHUB_OWNER)',
      repo: github.repo || '(не задан в GITHUB_REPO)',
      branch: github.branch || 'main',
      tokenConfigured: Boolean(github.token),
    },
    security: {
      adminPasswordCustomHash: Boolean(process.env.ADMIN_PASSWORD_HASH),
      ownerPasswordCustomHash: Boolean(process.env.OWNER_PASSWORD_HASH),
      sessionSecretSet: Boolean(process.env.SESSION_SECRET),
    },
  });
});

apiRouter.post('/owner/reset-password', requireOwnerAuth, (req: Request, res: Response) => {
  const { newPassword, generateRandom } = req.body || {};

  let targetPassword = newPassword;
  if (generateRandom || !targetPassword) {
    targetPassword = `kofe_${crypto.randomBytes(4).toString('hex')}`;
  }

  if (targetPassword.length < 6) {
    res.status(400).json({ error: 'Bad Request', message: 'Пароль должен содержать минимум 6 символов' });
    return;
  }

  const calculatedHash = hashPassword(targetPassword.trim());
  // Set in runtime memory for current server instance
  setRuntimeAdminPasswordHash(calculatedHash);

  res.json({
    success: true,
    newPassword: targetPassword,
    newHash: calculatedHash,
    message: 'Новый пароль администратора успешно установлен в текущей сессии!',
    envInstruction: `Для постоянного сохранения добавьте в переменные окружения Vercel: ADMIN_PASSWORD_HASH=${calculatedHash}`,
  });
});
