interface NetlifyContext {
  clientContext?: {
    user?: {
      email?: string;
      sub?: string;
      app_metadata?: Record<string, unknown>;
      user_metadata?: Record<string, unknown>;
    };
  };
}

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  queryStringParameters?: Record<string, string>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Netlify Serverless Function: save-content
 * 
 * 1. Receives site content updates from the Admin Panel.
 * 2. Verifies Netlify Identity authentication.
 * 3. Commits changes directly to the GitHub repository using GITHUB_TOKEN from server environment variables.
 */
export const handler = async (event: NetlifyEvent, context: NetlifyContext) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    // 1. Verify Authentication via Netlify Identity
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const user = context.clientContext?.user;

    // Check if token exists in header or Netlify clientContext
    if (!authHeader && !user) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Unauthorized: Требуется авторизация через Netlify Identity',
        }),
      };
    }

    // 2. Read Server Environment Variables (never exposed to client browser)
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || 'tryphonbrooks/kofeshtab';
    const githubBranch = process.env.GITHUB_BRANCH || 'main';
    const githubFilePath = process.env.GITHUB_FILE_PATH || 'public/content.json';

    if (!githubToken) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GITHUB_TOKEN не настроен в переменных окружения Netlify (Site settings -> Environment variables).',
        }),
      };
    }

    if (!githubRepo) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GITHUB_REPO не настроен в переменных окружения Netlify (например: owner/repository).',
        }),
      };
    }

    // 3. Parse Request Payload
    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }

    const payload = JSON.parse(event.body);
    const content = payload.content;
    const userCommitMsg = payload.message || 'Обновление контента через админку Кофештаб (Netlify Function)';
    const authorEmail = user?.email || payload.authorEmail || 'admin@kofeshtab.ru';

    if (!content) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Поле content обязательно для сохранения.' }),
      };
    }

    // 4. Format owner and repo
    const cleanRepoPath = githubRepo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const cleanBranch = githubBranch.trim();
    const cleanPath = (payload.filePath || githubFilePath).trim().replace(/^\//, '');

    // 5. GitHub API: Step A - Fetch existing file SHA
    let existingSha: string | undefined;
    const githubApiUrl = `https://api.github.com/repos/${cleanRepoPath}/contents/${cleanPath}?ref=${cleanBranch}`;

    const getRes = await fetch(githubApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Netlify-Function-Kofeshtab-CMS',
      },
    });

    if (getRes.ok) {
      const existingData = await getRes.json() as { sha?: string };
      existingSha = existingData.sha;
    } else if (getRes.status === 401 || getRes.status === 403) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Ошибка доступа к GitHub API (401/403): проверьте GITHUB_TOKEN и права на запись в репозиторий.',
        }),
      };
    } else if (getRes.status === 404) {
      // File will be created
      existingSha = undefined;
    }

    // 6. GitHub API: Step B - Encode content to UTF-8 base64
    const jsonFormatted = JSON.stringify(content, null, 2) + '\n';
    const base64Content = Buffer.from(jsonFormatted, 'utf8').toString('base64');

    // 7. GitHub API: Step C - Commit new file version
    const putUrl = `https://api.github.com/repos/${cleanRepoPath}/contents/${cleanPath}`;
    const putBody: Record<string, unknown> = {
      message: `${userCommitMsg} [by ${authorEmail}]`,
      content: base64Content,
      branch: cleanBranch,
      committer: {
        name: 'Кофештаб Админка',
        email: authorEmail,
      },
      author: {
        name: 'Кофештаб Админка',
        email: authorEmail,
      },
    };

    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function-Kofeshtab-CMS',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({})) as { message?: string };
      return {
        statusCode: putRes.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: `GitHub API error: ${errData.message || putRes.statusText}`,
        }),
      };
    }

    const resultData = await putRes.json() as {
      commit?: { html_url?: string; sha?: string };
      content?: { sha?: string; html_url?: string };
    };

    const commitUrl = resultData.commit?.html_url || `https://github.com/${cleanRepoPath}/commits/${cleanBranch}`;
    const sha = resultData.content?.sha || resultData.commit?.sha;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Контент успешно закоммичен в GitHub через Netlify Function!',
        commitUrl,
        sha,
        repo: cleanRepoPath,
        branch: cleanBranch,
        savedBy: authorEmail,
      }),
    };
  } catch (error: unknown) {
    console.error('Serverless function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: (error as Error).message || 'Internal server error in save-content function',
      }),
    };
  }
};
