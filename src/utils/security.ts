/**
 * Security, anti-brute force, hashing and password management for Kofeshtab Admin Panel
 */

const PASSWORD_HASH_KEY = 'kofeshtab_admin_pwd_hash';
const LOCKOUT_KEY = 'kofeshtab_admin_lockout';
const SESSION_EXPIRY_KEY = 'kofeshtab_session_expiry';

const SALT = 'kofeshtab_secure_salt_v2025';

// Default password SHA-256 hash (corresponds to 'kofeshtab2025' with salt)
const DEFAULT_PASS_HASH = '9db2f51fba04aaecae272e2cf57c9636250785ddf45be04fe606e12e12fa28f4';

/**
 * Computes SHA-256 hash of a string with salt using Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates entered password against stored custom hash or default hash
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  const storedCustomHash = localStorage.getItem(PASSWORD_HASH_KEY);

  if (storedCustomHash) {
    return inputHash === storedCustomHash;
  }

  // Fallback check against default password
  if (password === 'kofeshtab2025') {
    return true;
  }
  return inputHash === DEFAULT_PASS_HASH;
}

/**
 * Saves a new custom hashed password
 */
export async function changeAdminPassword(newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов');
  }
  const newHash = await hashPassword(newPassword);
  localStorage.setItem(PASSWORD_HASH_KEY, newHash);
}

/**
 * Resets custom password back to default
 */
export function resetAdminPasswordToDefault(): void {
  localStorage.removeItem(PASSWORD_HASH_KEY);
}

/**
 * Checks if custom password is set
 */
export function hasCustomPassword(): boolean {
  return !!localStorage.getItem(PASSWORD_HASH_KEY);
}

/**
 * Anti-brute force rate limiting (max 5 attempts, then 2 min lockout)
 */
export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
}

export function checkLockout(): LockoutStatus {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: 5 };
    }
    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockUntil && data.lockUntil > now) {
      const remainingSeconds = Math.ceil((data.lockUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
    }

    if (data.lockUntil && data.lockUntil <= now) {
      localStorage.removeItem(LOCKOUT_KEY);
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: 5 };
    }

    const attempts = data.attempts || 0;
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft: Math.max(0, 5 - attempts),
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 5 };
  }
}

export function recordFailedAttempt(): LockoutStatus {
  const raw = localStorage.getItem(LOCKOUT_KEY);
  const data = raw ? JSON.parse(raw) : { attempts: 0 };
  data.attempts = (data.attempts || 0) + 1;

  if (data.attempts >= 5) {
    data.lockUntil = Date.now() + 2 * 60 * 1000; // 2 minutes lock
  }

  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
  return checkLockout();
}

export function resetLockout(): void {
  localStorage.removeItem(LOCKOUT_KEY);
}

/**
 * Session management with auto-expiration
 */
export function setSessionWithExpiry(minutes = 60): void {
  sessionStorage.setItem('kofeshtab_admin_authenticated', 'true');
  sessionStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + minutes * 60 * 1000).toString());
}

export function isSessionValid(): boolean {
  const auth = sessionStorage.getItem('kofeshtab_admin_authenticated');
  const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  if (auth !== 'true' || !expiry) return false;

  if (Date.now() > parseInt(expiry, 10)) {
    sessionStorage.removeItem('kofeshtab_admin_authenticated');
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    return false;
  }
  return true;
}

export function clearAdminSession(): void {
  sessionStorage.removeItem('kofeshtab_admin_authenticated');
  sessionStorage.removeItem(SESSION_EXPIRY_KEY);
}
