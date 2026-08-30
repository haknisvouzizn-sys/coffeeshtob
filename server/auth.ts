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

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Creates a salted PBKDF2 hash of a password string:
 * Format: pbkdf2$iterations$saltHex$hashHex
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(
    password.trim(),
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LEN,
    PBKDF2_DIGEST
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey.toString('hex')}`;
}

// Runtime dynamic password override (if reset by Owner during process lifecycle)
let runtimeAdminPasswordHash: string | null = null;

export function setRuntimeAdminPasswordHash(hash: string): void {
  runtimeAdminPasswordHash = hash;
}

// Default development fallback PBKDF2 hash (corresponds to password 'kofeshtab2025')
const DEFAULT_DEV_ADMIN_HASH =
  'pbkdf2$100000$b43e48e1b2fb93d8addbf1d2d509d959$6f442b37f90f469655b72b6f1f75b64c74b9ab2c857119c93d57e77ff437de146c73b8a8407d17bae6688a5014b940968a489fdc77df19eaad00da457efbf25b';

// Default development fallback PBKDF2 hash (corresponds to password 'owner2025')
const DEFAULT_DEV_OWNER_HASH =
  'pbkdf2$100000$1dcf3af2e7be6a32309722c1411569ec$092d2ded377a48698c48edfb017888747dcfb8c9c75874cd311b71701d380e4cae1880e58c441ec0159730471e26f406b8e6e849bfe7df1209f69661acb194d8';

export function getExpectedAdminHash(): string {
  if (runtimeAdminPasswordHash) return runtimeAdminPasswordHash;
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH.trim();
  return DEFAULT_DEV_ADMIN_HASH;
}

export function getExpectedOwnerHash(): string {
  if (process.env.OWNER_PASSWORD_HASH) return process.env.OWNER_PASSWORD_HASH.trim();
  return DEFAULT_DEV_OWNER_HASH;
}

/**
 * Verifies password against expected PBKDF2 hash with constant-time comparison.
 * Also supports legacy/plain SHA-256 fallback if user configured a raw hex string.
 */
export function verifyPassword(password: string, expectedHash: string): boolean {
  if (!password || !expectedHash) return false;
  const trimmed = password.trim();

  // 1. Standard PBKDF2 format check
  if (expectedHash.startsWith('pbkdf2$')) {
    const parts = expectedHash.split('$');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
      const salt = parts[2];
      const targetHashHex = parts[3];

      const derivedKey = crypto.pbkdf2Sync(
        trimmed,
        salt,
        iterations,
        PBKDF2_KEY_LEN,
        PBKDF2_DIGEST
      );
      const targetBuffer = Buffer.from(targetHashHex, 'hex');
      if (derivedKey.length === targetBuffer.length) {
        return crypto.timingSafeEqual(derivedKey, targetBuffer);
      }
    }
  }

  // 2. Legacy fallback support for unsalted or salted SHA-256
  const sha256Hex = crypto.createHash('sha256').update(trimmed).digest('hex');
  if (sha256Hex === expectedHash) return true;

  const saltedSha256 = crypto
    .createHash('sha256')
    .update(trimmed + 'kofeshtab_secure_salt_v2025')
    .digest('hex');
  if (saltedSha256 === expectedHash) return true;

  return false;
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
