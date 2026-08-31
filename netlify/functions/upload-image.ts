interface NetlifyContext {
  clientContext?: {
    user?: {
      email?: string;
      sub?: string;
    };
  };
}

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Netlify Serverless Function: upload-image
 * 
 * 1. Receives base64 image data from the Admin Panel.
 * 2. Authenticates via Netlify Identity.
 * 3. Commits image directly into public/images/ using server-side GITHUB_TOKEN.
 */
export const handler = async (event: NetlifyEvent, context: NetlifyContext) => {
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
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 1. Verify Auth
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const user = context.clientContext?.user;

    if (!authHeader && !user) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Unauthorized: Требуется вход через Netlify Identity' }),
      };
    }

    // 2. Read Server Env Vars
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || 'tryphonbrooks/kofeshtab';
    const githubBranch = process.env.GITHUB_BRANCH || 'main';

    if (!githubToken || !githubRepo) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'GITHUB_TOKEN или GITHUB_REPO не настроены в переменных окружения Netlify',
        }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }

    const payload = JSON.parse(event.body);
    const { filename, base64, folder = 'public/images', message } = payload;

    if (!filename || !base64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'filename и base64 обязательны для загрузки фото' }),
      };
    }

    // Clean filename
    const cleanFileName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const cleanFolder = folder.replace(/^\/|\/$/g, '');
    const fullPath = `${cleanFolder}/${cleanFileName}`;
    const cleanRepoPath = githubRepo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const cleanBranch = githubBranch.trim();

    // Check existing SHA
    const apiUrl = `https://api.github.com/repos/${cleanRepoPath}/contents/${fullPath}?ref=${cleanBranch}`;
    let existingSha: string | undefined;

    const getRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Netlify-Function-Kofeshtab-CMS',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json() as { sha?: string };
      existingSha = data.sha;
    }

    // Clean base64 data (strip data:image/jpeg;base64, prefix if included)
    const pureBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const putBody: Record<string, unknown> = {
      message: message || `Загрузка изображения ${cleanFileName} через Netlify Function`,
      content: pureBase64,
      branch: cleanBranch,
    };

    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
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
          error: `GitHub upload error: ${errData.message || putRes.statusText}`,
        }),
      };
    }

    const resData = await putRes.json() as { commit?: { html_url?: string } };
    const publicWebUrl = `/${fullPath.replace(/^public\//, '')}`;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        url: publicWebUrl,
        repoPath: fullPath,
        commitUrl: resData.commit?.html_url,
      }),
    };
  } catch (error: unknown) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
