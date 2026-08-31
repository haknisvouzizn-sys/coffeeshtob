/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

export interface NetlifyIdentityUser {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
  token?: {
    access_token?: string;
    token_type?: string;
    expires_at?: number;
  };
  jwt?: (forceRefresh?: boolean) => Promise<string>;
}

export interface NetlifyIdentityWidget {
  init: (options?: { container?: string; APIUrl?: string; logo?: boolean }) => void;
  open: (tab?: 'login' | 'signup') => void;
  close: () => void;
  currentUser: () => NetlifyIdentityUser | null;
  logout: () => Promise<void> | void;
  on: (
    event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close',
    callback: (userOrErr?: any) => void
  ) => void;
  off: (
    event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close',
    callback?: (userOrErr?: any) => void
  ) => void;
  setLocale?: (locale: string) => void;
}

declare global {
  interface Window {
    netlifyIdentity?: NetlifyIdentityWidget;
  }
}

