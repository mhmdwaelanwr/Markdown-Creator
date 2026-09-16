import { HttpError, requestJson, requestText } from './http';

type GitHubRepo = Record<string, any>;
type GitHubContributor = Record<string, any>;
type GitHubTree = { tree: any[] };

type CacheEntry<T> = { value: T; expiresAt: number };

const encodePath = (value: string) =>
  String(value || '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private cache = new Map<string, CacheEntry<any>>();

  private headers(accept: string, token?: string | null) {
    const headers: Record<string, string> = { Accept: accept };
    if (token) headers.Authorization = `token ${token}`;
    return headers;
  }

  private cached<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
    const now = Date.now();
    const existing = this.cache.get(key);
    if (existing && existing.expiresAt > now) return Promise.resolve(existing.value as T);

    return loader().then((value) => {
      this.cache.set(key, { value, expiresAt: now + ttlMs });
      return value;
    });
  }

  async fetchRepoDetails(owner: string, repo: string, token: string | null = null): Promise<GitHubRepo> {
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const cacheKey = `repo:${url}:${token ? 'auth' : 'anon'}`;
    return this.cached(cacheKey, 60_000, async () => {
      return requestJson(url, { headers: this.headers('application/vnd.github.v3+json', token) });
    });
  }

  async fetchContributors(owner: string, repo: string, token: string | null = null): Promise<GitHubContributor[]> {
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`;
    const cacheKey = `contributors:${url}:${token ? 'auth' : 'anon'}`;
    return this.cached(cacheKey, 60_000, async () => {
      return requestJson(url, { headers: this.headers('application/vnd.github.v3+json', token) });
    });
  }

  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    token: string | null = null,
    ref?: string,
  ): Promise<string> {
    const cleanPath = encodePath(path || 'README.md');
    const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : '';
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${cleanPath}${refQuery}`;
    const cacheKey = `file:${url}:${token ? 'auth' : 'anon'}`;

    return this.cached(cacheKey, 30_000, async () => {
      try {
        return await requestText(url, {
          headers: this.headers('application/vnd.github.v3.raw', token),
          timeoutMs: 20_000,
        });
      } catch (error) {
        if (error instanceof HttpError) {
          if (error.status === 404) {
            throw new Error(`File not found: ${owner}/${repo}/${path || 'README.md'}`);
          }
          if (error.status === 401) {
            throw new Error('Unauthorized: invalid GitHub token.');
          }
          if (error.status === 403) {
            throw new Error('Forbidden: token lacks permissions or you are rate-limited.');
          }
        }
        throw error;
      }
    });
  }

  async fetchRepoTree(
    owner: string,
    repo: string,
    token: string | null = null,
    branch = 'main',
  ): Promise<GitHubTree['tree']> {
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const cacheKey = `tree:${url}:${token ? 'auth' : 'anon'}`;
    return this.cached(cacheKey, 60_000, async () => {
      const data = await requestJson<GitHubTree>(url, { headers: this.headers('application/vnd.github.v3+json', token) });
      return Array.isArray(data?.tree) ? data.tree : [];
    });
  }

  async fetchViewer(token: string): Promise<Record<string, any>> {
    const url = `${this.baseUrl}/user`;
    try {
      return await requestJson(url, { headers: this.headers('application/vnd.github.v3+json', token) });
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 401) {
          throw new Error('Unauthorized: invalid GitHub token.');
        }
        if (error.status === 403) {
          throw new Error('Forbidden: token lacks permissions or you are rate-limited.');
        }
      }
      throw error;
    }
  }
}

export default new GitHubService();
