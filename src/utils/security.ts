/**
 * Authentication and Session Management for Kofeshtab Admin Panel
 * Authenticates users exclusively via Netlify Identity (JWT) without hardcoded passwords or secrets.
 */
import {
  initNetlifyIdentity,
  getCurrentIdentityUser,
  isIdentityLoggedIn,
  getIdentityToken,
  openIdentityLogin,
  openIdentitySignup,
  logoutIdentity,
  onIdentityStateChange,
} from './netlifyIdentity';

export {
  initNetlifyIdentity,
  getCurrentIdentityUser,
  isIdentityLoggedIn,
  getIdentityToken,
  openIdentityLogin,
  openIdentitySignup,
  logoutIdentity,
  onIdentityStateChange,
};
