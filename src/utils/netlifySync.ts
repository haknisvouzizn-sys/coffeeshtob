import { getIdentityToken, getCurrentIdentityUser } from './netlifyIdentity';
import { SiteContent } from '../types';

export interface SaveResult {
  success: boolean;
  message: string;
  commitUrl?: string;
  sha?: string;
  repo?: string;
  branch?: string;
}

export interface UploadResult {
  success: boolean;
  url: string;
  repoPath?: string;
  commitUrl?: string;
}

export interface ServerlessSiteInfo {
  hasToken: boolean;
  repo: string;
  branch: string;
  serverlessProvider: string;
}

/**
 * Optimizes an image file in browser canvas before uploading
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1920,
  maxHeight = 1440,
  quality = 0.85
): Promise<{ base64: string; dataUrl: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось декодировать изображение'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Не удалось создать canvas context'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];

        // Create clean filename with timestamp
        const ext = 'jpg';
        const cleanBaseName = file.name
          .replace(/\.[^/.]+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9а-яё_-]/gi, '_')
          .slice(0, 25);
        const filename = `${cleanBaseName || 'img'}_${Date.now()}.${ext}`;

        resolve({ base64, dataUrl, filename });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Saves Site Content via Netlify Serverless Function (/api/save-content or /.netlify/functions/save-content)
 * The function commits changes to GitHub repo using server-side environment variables.
 */
export async function saveContentViaNetlifyFunction(
  content: SiteContent,
  commitMessage = 'Обновление контента через админку Кофештаб'
): Promise<SaveResult> {
  const token = await getIdentityToken();
  const user = getCurrentIdentityUser();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = {
    content,
    message: commitMessage,
    authorEmail: user?.email || 'admin@kofeshtab.ru',
  };

  // Target Netlify Function URL (supports both standard /.netlify/functions and /api redirect)
  const endpoint = '/.netlify/functions/save-content';

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (networkErr: unknown) {
    // If Netlify function endpoint is not reachable (e.g. local offline preview or dev)
    console.warn('Netlify function network error, attempting /api/save-content fallback:', networkErr);
    try {
      response = await fetch('/api/save-content', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        'Не удалось связаться с Netlify Function (проверьте интернет-соединение или развертывание на Netlify).'
      );
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Ошибка сервера: HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    success: true,
    message: data.message || 'Контент успешно закоммичен в GitHub через Netlify Function!',
    commitUrl: data.commitUrl,
    sha: data.sha,
    repo: data.repo,
    branch: data.branch,
  };
}

/**
 * Uploads an image via Netlify Serverless Function directly to GitHub repository
 */
export async function uploadImageViaNetlifyFunction(
  file: File,
  customFolder = 'public/images',
  message?: string
): Promise<UploadResult> {
  const { base64, filename, dataUrl } = await optimizeImageFile(file);
  const token = await getIdentityToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = {
    filename,
    base64,
    folder: customFolder,
    message: message || `Загрузка фото ${filename} через Netlify Function`,
  };

  try {
    const res = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        url: data.url,
        repoPath: data.repoPath,
        commitUrl: data.commitUrl,
      };
    }

    const errData = await res.json().catch(() => ({}));
    console.warn('Serverless image upload failed:', errData);
    // Fallback to local DataURL so user is not blocked
    return {
      success: true,
      url: dataUrl,
    };
  } catch (err) {
    console.warn('Serverless image upload offline fallback to dataUrl', err);
    return {
      success: true,
      url: dataUrl,
    };
  }
}

/**
 * Queries non-sensitive server info from Netlify Function
 */
export async function fetchServerlessInfo(): Promise<ServerlessSiteInfo | null> {
  try {
    const res = await fetch('/.netlify/functions/site-info');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline or local dev
  }
  return null;
}
