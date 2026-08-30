import fs from 'fs';
import path from 'path';

export interface GitHubEnvConfig {
  token?: string;
  owner?: string;
  repo?: string;
  branch: string;
}

export function getGitHubEnvConfig(): GitHubEnvConfig {
  return {
    token: process.env.GITHUB_TOKEN?.trim(),
    owner: process.env.GITHUB_OWNER?.trim(),
    repo: process.env.GITHUB_REPO?.trim(),
    branch: (process.env.GITHUB_BRANCH || 'main').trim(),
  };
}

export function isGitHubConfigured(): boolean {
  const cfg = getGitHubEnvConfig();
  return Boolean(cfg.token && cfg.owner && cfg.repo);
}

/**
 * Commits content.json to GitHub repository and updates local disk copy
 */
export async function commitContentToGitHubServer(
  content: unknown,
  commitMessage?: string
): Promise<{ success: boolean; message: string; sha?: string; localSaved: boolean }> {
  const config = getGitHubEnvConfig();
  const jsonString = JSON.stringify(content, null, 2) + '\n';

  // 1. Always update local disk copy if writable
  let localSaved = false;
  try {
    const publicContentPath = path.join(process.cwd(), 'public', 'content.json');
    if (fs.existsSync(path.dirname(publicContentPath))) {
      fs.writeFileSync(publicContentPath, jsonString, 'utf-8');
      localSaved = true;
    }
  } catch (err) {
    console.warn('Could not write local public/content.json:', err);
  }

  // 2. If GitHub is not configured, inform the user clearly
  if (!config.token || !config.owner || !config.repo) {
    return {
      success: true,
      localSaved,
      message: 'Изменения сохранены на сервере. (GITHUB_TOKEN / GITHUB_REPO не заданы в переменных окружения)',
    };
  }

  const cleanOwner = config.owner.replace(/^https?:\/\/github\.com\//, '').split('/')[0];
  const cleanRepo = config.repo.replace(/^https?:\/\/github\.com\//, '').split('/').pop() || config.repo;
  const filePath = 'public/content.json';
  const branch = config.branch || 'main';

  // Step A: Fetch current file SHA
  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${config.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'CoffeeShtob-Server-Admin',
        },
      }
    );

    if (checkRes.ok) {
      const checkData: any = await checkRes.json();
      existingSha = checkData.sha;
    } else if (checkRes.status === 401 || checkRes.status === 403) {
      throw new Error('Ошибка доступа GitHub (проверьте GITHUB_TOKEN и права repo)');
    }
  } catch (err: any) {
    if (err.message?.includes('GITHUB_TOKEN')) {
      throw err;
    }
    // File may not exist yet, which is fine
  }

  // Step B: Base64 encode JSON
  const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');

  // Step C: Send PUT commit to GitHub
  const putPayload: any = {
    message: commitMessage || `chore: update content via admin panel [${new Date().toISOString()}]`,
    content: base64Content,
    branch,
  };
  if (existingSha) {
    putPayload.sha = existingSha;
  }

  const putRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'CoffeeShtob-Server-Admin',
      },
      body: JSON.stringify(putPayload),
    }
  );

  if (!putRes.ok) {
    const errorBody: any = await putRes.json().catch(() => ({}));
    const safeError = errorBody.message || `HTTP ${putRes.status}`;
    throw new Error(`Не удалось закоммитить в GitHub: ${safeError}`);
  }

  const resData: any = await putRes.json();
  const commitSha = resData.commit?.sha?.substring(0, 7) || resData.content?.sha?.substring(0, 7) || 'OK';

  return {
    success: true,
    sha: commitSha,
    localSaved,
    message: `✓ Успешно опубликовано на GitHub в ветку ${branch} (коммит ${commitSha})`,
  };
}

/**
 * Uploads an image to GitHub (public/images/filename) and writes it locally to public/images/
 */
export async function commitImageToGitHubServer(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<{ success: boolean; url: string; sha?: string }> {
  // Validate & sanitize filename
  const cleanExt = path.extname(originalFilename).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
  if (!allowedExts.includes(cleanExt)) {
    throw new Error('Недопустимый формат изображения. Разрешены JPG, PNG, WEBP, AVIF, GIF.');
  }

  const baseName = path
    .basename(originalFilename, path.extname(originalFilename))
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]/gi, '_')
    .slice(0, 30);

  const finalFilename = `${baseName || 'photo'}_${Date.now()}.${cleanExt}`;
  const relativePublicPath = `/images/${finalFilename}`;
  const repoFilePath = `public/images/${finalFilename}`;

  // 1. Save locally to disk
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(imagesDir, finalFilename), fileBuffer);
  } catch (err) {
    console.warn('Could not save image to local public/images folder:', err);
  }

  // 2. Commit to GitHub if configured
  const config = getGitHubEnvConfig();
  let commitSha: string | undefined;

  if (config.token && config.owner && config.repo) {
    const cleanOwner = config.owner.replace(/^https?:\/\/github\.com\//, '').split('/')[0];
    const cleanRepo = config.repo.replace(/^https?:\/\/github\.com\//, '').split('/').pop() || config.repo;
    const branch = config.branch || 'main';
    const base64Data = fileBuffer.toString('base64');

    const putRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${repoFilePath}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${config.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'CoffeeShtob-Server-Admin',
        },
        body: JSON.stringify({
          message: `chore: upload image ${finalFilename} via admin panel`,
          content: base64Data,
          branch,
        }),
      }
    );

    if (putRes.ok) {
      const resData: any = await putRes.json();
      commitSha = resData.commit?.sha?.substring(0, 7);
    } else {
      console.warn('GitHub image upload returned error status:', putRes.status);
    }
  }

  return {
    success: true,
    url: relativePublicPath,
    sha: commitSha,
  };
}
