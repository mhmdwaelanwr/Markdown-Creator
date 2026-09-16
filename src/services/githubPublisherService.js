// GitHubPublisherService (React Native)
// Uses fetch for GitHub API
export class GitHubPublisherService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.github.com';
  }

  setToken(token) {
    this.accessToken = token;
  }

  _headers() {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (this.accessToken) {
      headers['Authorization'] = `token ${this.accessToken}`;
    }
    return headers;
  }

  _encodeBase64(content) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(content, 'utf8').toString('base64');
    }
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(content)));
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = unescape(encodeURIComponent(content));
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = str.charCodeAt(i += 3 / 4);
      if (charCode > 0xFF) {
        throw new Error('Invalid character for base64 encoding.');
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  async publishReadme({ owner, repo, content, branchName = 'main', commitMessage = 'Update README', path = 'README.md' }) {
    if (!this.accessToken) throw new Error('GitHub Access Token is required for publishing.');
    if (!owner || !repo) throw new Error('Owner and repo are required.');

    const fileUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branchName}`;
    let sha = null;

    const existing = await fetch(fileUrl, { headers: this._headers() });
    if (existing.status === 200) {
      const json = await existing.json();
      sha = json.sha;
    } else if (existing.status !== 404) {
      const message = await existing.text();
      throw new Error(message || 'Unable to access repository content.');
    }

    const payload = {
      message: commitMessage,
      content: this._encodeBase64(content),
      branch: branchName,
    };
    if (sha) payload.sha = sha;

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...this._headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Publish failed.');
    }

    return response.json();
  }
}

export default new GitHubPublisherService();
