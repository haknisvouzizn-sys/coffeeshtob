/**
 * Server-side API client for CoffeeShtob Admin & Owner portals
 * Uses HttpOnly cookie-based credentials
 */

import { SiteContent } from '../types';

export interface AuthStatus {
  authenticated: boolean;
  role?: 'admin' | 'owner';
}

export interface OwnerStatusData {
  status: string;
  environment: string;
  github: {
    configured: boolean;
    owner: string;
    repo: string;
    branch: string;
    tokenConfigured: boolean;
  };
  security: {
    adminPasswordCustomHash: boolean;
    ownerPasswordCustomHash: boolean;
    sessionSecretSet: boolean;
  };
}

// --------------------------------------------------------------------------
// ADMIN API
// --------------------------------------------------------------------------

export async function loginAdmin(password: string): Promise<{ success: boolean; role: string; message?: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Ошибка входа (${res.status})`);
  }

  return data;
}

export async function logoutAdmin(): Promise<void> {
  await fetch('/api/admin/logout', {
    method: 'POST',
  }).catch(() => {});
}

export async function checkAdminSession(): Promise<AuthStatus> {
  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Session check error:', err);
  }
  return { authenticated: false };
}

export async function publishContentToServer(content: SiteContent): Promise<{ success: boolean; message: string; sha?: string }> {
  const res = await fetch('/api/admin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Не удалось опубликовать изменения. Ваши изменения сохранены локально. Попробуйте ещё раз.');
  }

  return data;
}

export async function uploadImageToServer(file: File): Promise<{ success: boolean; url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения'));
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData,
            fileName: file.name,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || `Ошибка загрузки (${res.status})`);
        }

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

// --------------------------------------------------------------------------
// OWNER API
// --------------------------------------------------------------------------

export async function loginOwner(password: string): Promise<{ success: boolean; role: string }> {
  const res = await fetch('/api/owner/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Ошибка входа разработчика (${res.status})`);
  }

  return data;
}

export async function getOwnerStatus(): Promise<OwnerStatusData> {
  const res = await fetch('/api/owner/status', {
    headers: { 'Cache-Control': 'no-cache' },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Ошибка получения статуса (${res.status})`);
  }

  return data;
}

export async function resetClientPassword(params: {
  newPassword?: string;
  generateRandom?: boolean;
}): Promise<{ success: boolean; newPassword: string; newHash: string; message: string; envInstruction: string }> {
  const res = await fetch('/api/owner/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Ошибка сброса пароля (${res.status})`);
  }

  return data;
}
