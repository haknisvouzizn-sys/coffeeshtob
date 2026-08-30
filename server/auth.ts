import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Cookie name for HttpOnly session
export const SESSION_COOKIE_NAME = 'kofeshtab_session';

// Fallback session secret if not specified in environment
const DEFAULT_SESSION_SECRET = 'kofeshtab_secret_session_key_v2025_prod_safe';

// Default PBKDF2 hashes for out-of-the-box operation:
// Corresponds to password: 'kofeshtab2025'
const DEFAULT_ADMIN_HASH =
  'pbkdf2$100000$b43e48e1b2fb93d8addbf1d2d509d959$6f442b37f90f469655b72b6f1f75b64c74b9ab2c857119c93d57e77ff437de146c73b8a8407d17bae6688a5014b940968a489fdc77df19eaad00da457efbf25b';

// Corresponds to password: 'owner2025'
const DEFAULT_OWNER_HASH =
  'pbkdf2$100000$0d5e714f9aa47c520e9722731fe4bdd9$271709ab8f936a12987e7007e240960e914520ad9b08d2b2eafbbd121cacb1c6cb3f9abfa3a76086a7c6f6ef84b916d5fc2fe3a469eb750035e9111369b7426a';

// Secret key for signing session tokens
export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length > 0) {
    return process.env.SESSION_SECRET.trim();
  }
  return DEFAULT_SESSION_SECRET;
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

export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_KEY_LEN = 64;
export const PBKDF2_DIGEST = 'sha512';

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

// Runtime dynamic password override (if reset by Owner during current server runtime)
let runtimeAdminPasswordHash: string | null = null;

export function setRuntimeAdminPasswordHash(hash: string): void {
  runtimeAdminPasswordHash = hash;
}

export function getExpectedAdminHash(): string {
  if (runtimeAdminPasswordHash) return runtimeAdminPasswordHash;
  if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim().length > 0) {
    return process.env.ADMIN_PASSWORD_HASH.trim();
  }
  return DEFAULT_ADMIN_HASH;
}

export function getExpectedOwnerHash(): string {
  if (process.env.OWNER_PASSWORD_HASH && process.env.OWNER_PASSWORD_HASH.trim().length > 0) {
    return process.env.OWNER_PASSWORD_HASH.trim();
  }
  return DEFAULT_OWNER_HASH;
}

/**
 * Verifies password against expected PBKDF2 hash with constant-time comparison.
 * Exclusively supports the standard PBKDF2 format (pbkdf2$iterations$saltHex$hashHex).
 */
export function verifyPassword(password: string, expectedHash: string | null | undefined): boolean {
  if (!password || !expectedHash) return false;
  const trimmed = password.trim();

  // Strict PBKDF2 format check
  if (!expectedHash.startsWith('pbkdf2$')) {
    return false;
  }

  const parts = expectedHash.split('$');
  if (parts.length !== 4) {
    return false;
  }

  const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
  const salt = parts[2];
  const targetHashHex = parts[3];

  if (!salt || !targetHashHex) {
    return false;
  }

  try {
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
  } catch {
    return false;
  }

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
  const secret = getSessionSecret();

  const payload: SessionPayload = {
    role,
    userId: role,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies and parses a signed session token
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const secret = getSessionSecret();
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
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

export function extractToken(req: Request): string | undefined {
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }
  const rawCookie = req.headers?.cookie;
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) return decodeURIComponent(match[1]);
  }
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return undefined;
}

/**
 * Middleware to require admin or owner authentication
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
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
  const token = extractToken(req);
  const session = verifySessionToken(token);

  if (!session || session.role !== 'owner') {
    res.status(403).json({ error: 'Forbidden', message: 'Доступ разрешен только для Владельца / Разработчика' });
    return;
  }

  (req as any).userSession = session;
  next();
}
