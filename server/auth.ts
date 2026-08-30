import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Cookie name for HttpOnly session
export const SESSION_COOKIE_NAME = 'kofeshtab_session';

// Secret key for signing session tokens
export function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'kofeshtab_default_session_secret_change_in_prod';
}

// In-memory rate limiting for login attempts (IP -> { attempts, lockUntil })
const loginAttempts = new Map<string, { attempts: number; lockUntil: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockUntil > now) {
    const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (record.lockUntil <= now && record.attempts >= 5) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, lockUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.lockUntil = now + 2 * 60 * 1000; // 2 minute lock
  }

  loginAttempts.set(ip, record);
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Computes SHA-256 hash of a string
 */
export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Runtime dynamic password override (if reset by Owner during process lifecycle)
let runtimeAdminPasswordHash: string | null = null;

export function setRuntimeAdminPasswordHash(hash: string): void {
  runtimeAdminPasswordHash = hash;
}

export function getExpectedAdminHash(): string {
  if (runtimeAdminPasswordHash) return runtimeAdminPasswordHash;
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH.trim();
  // Default development fallback hash (corresponds to sha256('kofeshtab2025'))
  return '9db2f51fba04aaecae272e2cf57c9636250785ddf45be04fe606e12e12fa28f4';
}

export function getExpectedOwnerHash(): string {
  if (process.env.OWNER_PASSWORD_HASH) return process.env.OWNER_PASSWORD_HASH.trim();
  // Default owner fallback hash (corresponds to sha256('owner2025'))
  return '018b1eaef4df3b88b0a996fbe532dfc53ff7df89be9d4a36f6d54cf8e3f9479b';
}

/**
 * Verify password against expected hash (handles direct plain match for dev fallback or salted/unsalted sha256)
 */
export function verifyPassword(password: string, expectedHash: string): boolean {
  if (!password || !expectedHash) return false;
  
  const trimmed = password.trim();
  const directHash = sha256(trimmed);
  const saltedHash = sha256(trimmed + 'kofeshtab_secure_salt_v2025');

  // Support direct sha256, salted sha256, or direct hash match
  return directHash === expectedHash || saltedHash === expectedHash;
}

export interface SessionPayload {
  role: 'admin' | 'owner';
  userId: string;
  exp: number; // Unix timestamp in ms
}

/**
 * Creates a cryptographically signed session token: base64(payload).signature
 */
export function createSessionToken(role: 'admin' | 'owner', expiresInHours = 48): string {
  const payload: SessionPayload = {
    role,
    userId: role,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies and parses a signed session token
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    if (payload.role !== 'admin' && payload.role !== 'owner') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware to require admin or owner authentication
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = verifySessionToken(token);

  if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Требуется авторизация администратора' });
    return;
  }

  (req as any).userSession = session;
  next();
}

/**
 * Middleware to require owner (developer) authentication
 */
export function requireOwnerAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = verifySessionToken(token);

  if (!session || session.role !== 'owner') {
    res.status(403).json({ error: 'Forbidden', message: 'Доступ разрешен только для Владельца / Разработчика' });
    return;
  }

  (req as any).userSession = session;
  next();
}
