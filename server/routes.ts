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
  getSessionSecret,
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
function setAuthCookie(res: Response, role: 'admin' | 'owner'): boolean {
  const token = createSessionToken(role, 48); // 48 hours expiry
  if (!token) {
    return false;
  }
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 48 * 60 * 60 * 1000,
  });
  return true;
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
  if (!expectedHash) {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Пароль администратора не настроен на сервере (ADMIN_PASSWORD_HASH отсутствует в переменных окружения)',
    });
    return;
  }

  const secret = getSessionSecret();
  if (!secret) {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Ключ сессии не настроен на сервере (SESSION_SECRET отсутствует в переменных окружения)',
    });
    return;
  }

  const isValid = verifyPassword(password, expectedHash);

  if (!isValid) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Unauthorized', message: 'Неверный пароль администратора' });
    return;
  }

  resetLoginAttempts(clientIp);
  const cookieSet = setAuthCookie(res, 'admin');
  if (!cookieSet) {
    res.status(500).json({ error: 'Configuration Error', message: 'Ошибка генерации сессии' });
    return;
  }

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
    const contentPath = path.join(process.cwd(), 'public', 'content.json');
    if (fs.existsSync(contentPath)) {
      const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
      res.json({ success: true, content: data });
    } else {
      res.status(404).json({ error: 'Not Found', message: 'content.json не найден' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Error', message: err?.message || 'Ошибка чтения контента' });
  }
});

apiRouter.post('/admin/publish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'object') {
      res.status(400).json({ error: 'Bad Request', message: 'Некорректная структура контента' });
      return;
    }

    // Validate and sanitize content
    const sanitizedContent = sanitizeSiteContent(content);

    // Save to local file system first
    const contentPath = path.join(process.cwd(), 'public', 'content.json');
    const contentJson = JSON.stringify(sanitizedContent, null, 2);
    try {
      fs.writeFileSync(contentPath, contentJson, 'utf8');
    } catch (fsErr) {
      console.warn('Could not write to local filesystem (e.g. read-only serverless):', fsErr);
    }

    // If GitHub is configured, push commit to trigger Vercel deployment
    if (isGitHubConfigured()) {
      const commitResult = await commitContentToGitHubServer(
        sanitizedContent,
        `chore(content): update website content via Admin Panel [${new Date().toISOString().slice(0, 10)}]`
      );

      if (!commitResult.success) {
        res.status(502).json({
          error: 'GitHub Sync Failed',
          message: commitResult.message || 'Ошибка публикации на GitHub',
          savedLocally: commitResult.localSaved,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Изменения успешно отправлены на GitHub! Vercel автоматически выполнит развертывание.',
        publishedToGitHub: true,
        commitSha: commitResult.sha,
      });
      return;
    }

    // If GitHub is not configured (e.g. development mode)
    res.json({
      success: true,
      message: 'Контент сохранен локально (переменные GITHUB_TOKEN/GITHUB_REPO не заданы)',
      publishedToGitHub: false,
    });
  } catch (err: any) {
    console.error('Publish handler error:', err);
    res.status(500).json({ error: 'Internal Error', message: err?.message || 'Ошибка при публикации' });
  }
});

apiRouter.post('/admin/upload', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { filename, base64Data } = req.body || {};

    if (!filename || !base64Data) {
      res.status(400).json({ error: 'Bad Request', message: 'Файл или имя файла не переданы' });
      return;
    }

    // Clean base64 string
    const pureBase64 = base64Data.replace(/^data:image\/[a-z0-9.+]+;base64,/, '');
    const buffer = Buffer.from(pureBase64, 'base64');

    const uploadResult = await commitImageToGitHubServer(buffer, filename);

    res.json({
      success: true,
      url: uploadResult.url,
      sha: uploadResult.sha,
      message: 'Изображение успешно загружено',
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Internal Error', message: err?.message || 'Ошибка загрузки изображения' });
  }
});

// --------------------------------------------------------------------------
// OWNER & DEVELOPER AUTHENTICATION & DIAGNOSTICS
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
  if (!expectedHash) {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Пароль разработчика не настроен на сервере (OWNER_PASSWORD_HASH отсутствует в переменных окружения)',
    });
    return;
  }

  const secret = getSessionSecret();
  if (!secret) {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Ключ сессии не настроен на сервере (SESSION_SECRET отсутствует в переменных окружения)',
    });
    return;
  }

  const isValid = verifyPassword(password, expectedHash);

  if (!isValid) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Unauthorized', message: 'Неверный пароль разработчика' });
    return;
  }

  resetLoginAttempts(clientIp);
  const cookieSet = setAuthCookie(res, 'owner');
  if (!cookieSet) {
    res.status(500).json({ error: 'Configuration Error', message: 'Ошибка генерации сессии' });
    return;
  }

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
