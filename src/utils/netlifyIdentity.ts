import { NetlifyIdentityUser } from '../vite-env';

let isInitialized = false;
const listeners: Array<(user: NetlifyIdentityUser | null) => void> = [];

/**
 * Initializes Netlify Identity widget if available on window
 */
export function initNetlifyIdentity(onUserChange?: (user: NetlifyIdentityUser | null) => void): void {
  if (onUserChange) {
    listeners.push(onUserChange);
  }

  if (typeof window === 'undefined') return;

  const widget = window.netlifyIdentity;
  if (!widget) {
    // If widget script is loading asynchronously, try again on DOMContentLoaded / load
    if (!isInitialized) {
      window.addEventListener('DOMContentLoaded', () => initNetlifyIdentity());
    }
    return;
  }

  if (isInitialized) {
    if (onUserChange) {
      onUserChange(getCurrentIdentityUser());
    }
    return;
  }

  isInitialized = true;

  try {
    widget.init({
      logo: false,
    });

    widget.on('init', (user: NetlifyIdentityUser | null) => {
      notifyListeners(user || null);
    });

    widget.on('login', (user: NetlifyIdentityUser) => {
      notifyListeners(user);
      widget.close();
    });

    widget.on('logout', () => {
      notifyListeners(null);
    });

    widget.on('error', (err) => {
      console.warn('Netlify Identity error:', err);
    });
  } catch (err) {
    console.warn('Netlify Identity init error:', err);
  }
}

function notifyListeners(user: NetlifyIdentityUser | null) {
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.error('Error in Netlify Identity listener:', e);
    }
  });
}

/**
 * Retrieves currently logged in Netlify Identity user
 */
export function getCurrentIdentityUser(): NetlifyIdentityUser | null {
  if (typeof window === 'undefined') return null;
  return window.netlifyIdentity?.currentUser() || null;
}

/**
 * Returns true if a valid user is logged in
 */
export function isIdentityLoggedIn(): boolean {
  const user = getCurrentIdentityUser();
  return Boolean(user && user.email);
}

/**
 * Retrieves valid JWT access token for Authorization Bearer header
 */
export async function getIdentityToken(): Promise<string | null> {
  const user = getCurrentIdentityUser();
  if (!user) return null;

  try {
    if (typeof user.jwt === 'function') {
      return await user.jwt();
    }
    if (user.token?.access_token) {
      return user.token.access_token;
    }
  } catch (e) {
    console.warn('Failed to retrieve Netlify Identity JWT token', e);
  }

  return user.token?.access_token || null;
}

/**
 * Opens Netlify Identity Login modal
 */
export function openIdentityLogin(): void {
  if (typeof window === 'undefined') return;
  if (!window.netlifyIdentity) {
    alert('Система Netlify Identity загружается. Пожалуйста, повторите через пару секунд.');
    return;
  }
  window.netlifyIdentity.open('login');
}

/**
 * Opens Netlify Identity Sign up modal
 */
export function openIdentitySignup(): void {
  if (typeof window === 'undefined') return;
  if (!window.netlifyIdentity) {
    alert('Система Netlify Identity загружается. Пожалуйста, повторите через пару секунд.');
    return;
  }
  window.netlifyIdentity.open('signup');
}

/**
 * Logs out currently authenticated user
 */
export async function logoutIdentity(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.netlifyIdentity) {
    await window.netlifyIdentity.logout();
    notifyListeners(null);
  }
}

/**
 * Subscribe to identity state changes
 */
export function onIdentityStateChange(callback: (user: NetlifyIdentityUser | null) => void): () => void {
  listeners.push(callback);
  // Trigger immediately with current state
  callback(getCurrentIdentityUser());

  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  };
}
