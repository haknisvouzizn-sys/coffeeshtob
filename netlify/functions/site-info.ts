interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || 'tryphonbrooks/kofeshtab';
  const githubBranch = process.env.GITHUB_BRANCH || 'main';

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      hasToken: Boolean(githubToken),
      repo: githubRepo,
      branch: githubBranch,
      environment: process.env.NODE_ENV || 'production',
      serverlessProvider: 'Netlify Functions',
    }),
  };
};
