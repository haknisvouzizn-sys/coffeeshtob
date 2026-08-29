/**
 * GitHub API synchronization for direct commits to repository
 */

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
}

const GITHUB_CONFIG_KEY = 'kofeshtab_github_config';

export function getStoredGitHubConfig(): GitHubConfig {
  try {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load GitHub config from localStorage', e);
  }

  return {
    owner: '',
    repo: '',
    branch: 'main',
    filePath: 'public/content.json',
    token: '',
  };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save GitHub config to localStorage', e);
  }
}

/**
 * UTF-8 safe Base64 encoder for browser
 */
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * Commit updated content.json directly to GitHub repository via GitHub REST API
 */
export async function commitContentToGitHub(
  content: unknown,
  config: GitHubConfig,
  commitMessage = 'Обновление контента сайта через админку Кофештаб'
): Promise<{ success: boolean; message: string; commitUrl?: string; sha?: string }> {
  if (!config.owner || !config.repo || !config.token) {
    throw new Error('Пожалуйста, укажите владельца (owner), репозиторий (repo) и GitHub Personal Access Token (токен).');
  }

  const cleanOwner = config.owner.trim().replace(/^https?:\/\/github\.com\//, '').split('/')[0];
  const cleanRepo = config.repo.trim().replace(/^https?:\/\/github\.com\//, '').split('/').pop() || config.repo.trim();
  const cleanBranch = (config.branch || 'main').trim();
  const cleanPath = (config.filePath || 'public/content.json').trim().replace(/^\//, '');

  const apiUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}?ref=${cleanBranch}`;

  // Step 1: Get existing file SHA if it exists
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${config.token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      existingSha = data.sha;
    } else if (getRes.status === 401) {
      throw new Error('Неверный GitHub токен (401 Unauthorized). Проверьте права и срок действия токена.');
    } else if (getRes.status === 404) {
      // File does not exist yet, will be created
      existingSha = undefined;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('401')) {
      throw err;
    }
    // Network or other non-fatal error, proceed to try PUT
  }

  // Step 2: Prepare JSON content & base64 encoding
  const jsonString = JSON.stringify(content, null, 2) + '\n';
  const base64Content = utf8ToBase64(jsonString);

  // Step 3: Send PUT request to create/update file
  const putUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}`;
  const bodyPayload: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch: cleanBranch,
  };

  if (existingSha) {
    bodyPayload.sha = existingSha;
  }

  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!putRes.ok) {
    const errorData = await putRes.json().catch(() => ({}));
    const errMessage = errorData.message || `Ошибка GitHub API: HTTP ${putRes.status}`;
    throw new Error(errMessage);
  }

  const resultData = await putRes.json();
  const commitUrl = resultData.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commits/${cleanBranch}`;
  const sha = resultData.content?.sha || resultData.commit?.sha;

  return {
    success: true,
    message: 'Файл успешно обновлен и закоммичен в репозиторий GitHub!',
    commitUrl,
    sha,
  };
}

/**
 * Verify GitHub Token and Repository access
 */
export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string; repoName?: string }> {
  if (!config.owner || !config.repo || !config.token) {
    throw new Error('Заполните владельца, имя репозитория и токен');
  }

  const cleanOwner = config.owner.trim().replace(/^https?:\/\/github\.com\//, '').split('/')[0];
  const cleanRepo = config.repo.trim().replace(/^https?:\/\/github\.com\//, '').split('/').pop() || config.repo.trim();

  const res = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Неверный GitHub токен авторизации (401).');
    if (res.status === 404) throw new Error(`Репозиторий ${cleanOwner}/${cleanRepo} не найден или токен не имеет к нему доступа (404).`);
    throw new Error(`Ошибка подключения: HTTP ${res.status}`);
  }

  const repo = await res.json();
  return {
    success: true,
    message: `Подключение успешно! Доступ к репозиторию "${repo.full_name}" подтвержден.`,
    repoName: repo.full_name,
  };
}

/**
 * Optimizes an image file (resizes if too large, compresses to JPEG/WebP) and returns base64 and dataURL
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
 * Uploads an image file directly to the GitHub repository into `public/images/`
 */
export async function uploadImageToGitHub(
  file: File,
  config: GitHubConfig,
  customFolderPath = 'public/images'
): Promise<{ success: boolean; rawUrl: string; repoPath: string; commitUrl?: string }> {
  if (!config.owner || !config.repo || !config.token) {
    throw new Error('Для загрузки на GitHub заполните настройки во вкладке «Синхронизация с GitHub» (Owner, Repo, Token)');
  }

  const { base64, dataUrl, filename } = await optimizeImageFile(file);

  const cleanOwner = config.owner.trim().replace(/^https?:\/\/github\.com\//, '').split('/')[0];
  const cleanRepo = config.repo.trim().replace(/^https?:\/\/github\.com\//, '').split('/').pop() || config.repo.trim();
  const cleanBranch = (config.branch || 'main').trim();
  const cleanFolder = customFolderPath.replace(/^\/|\/$/g, '');
  const filePath = `${cleanFolder}/${filename}`;

  const apiUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}`;

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${config.token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Загрузка изображения ${filename} через админку Кофештаб`,
      content: base64,
      branch: cleanBranch,
    }),
  });

  if (!putRes.ok) {
    const errorData = await putRes.json().catch(() => ({}));
    const errMessage = errorData.message || `Ошибка загрузки на GitHub: HTTP ${putRes.status}`;
    throw new Error(errMessage);
  }

  const resultData = await putRes.json();
  const commitUrl = resultData.commit?.html_url;

  // Path relative to public folder (e.g. /images/filename.jpg) or full raw git url
  // In Vite/React public folder assets are served from root (e.g. /images/xyz.jpg)
  const webPath = `/${filePath.replace(/^public\//, '')}`;

  return {
    success: true,
    rawUrl: webPath,
    repoPath: filePath,
    commitUrl,
  };
}

