export class HttpError extends Error {
  status: number;
  url: string;
  bodyText?: string;

  constructor(message: string, options: { status: number; url: string; bodyText?: string }) {
    super(message);
    this.name = 'HttpError';
    this.status = options.status;
    this.url = options.url;
    this.bodyText = options.bodyText;
  }
}

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  signal?: AbortSignal;
};

const attachSignal = (target: AbortController, signal?: AbortSignal) => {
  if (!signal) return () => {};
  if (signal.aborted) {
    try {
      target.abort();
    } catch (_) {
      // ignore
    }
    return () => {};
  }

  const handler = () => {
    try {
      target.abort();
    } catch (_) {
      // ignore
    }
  };

  signal.addEventListener('abort', handler);
  return () => signal.removeEventListener('abort', handler);
};

const request = async (url: string, options: RequestOptions) => {
  const controller = new AbortController();
  const cleanupSignal = attachSignal(controller, options.signal);

  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 15_000;
  const timeout = setTimeout(() => {
    try {
      controller.abort();
    } catch (_) {
      // ignore
    }
  }, timeoutMs);

  try {
    return await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });
  } catch (error: any) {
    throw new HttpError(error?.message || 'Network request failed', { status: 0, url });
  } finally {
    clearTimeout(timeout);
    cleanupSignal();
  }
};

export async function requestText(url: string, options: RequestOptions = {}) {
  const response = await request(url, options);
  const bodyText = await response.text();
  if (!response.ok) {
    throw new HttpError(
      `Request failed (${response.status})`,
      { status: response.status, url, bodyText },
    );
  }
  return bodyText;
}

export async function requestJson<T>(url: string, options: RequestOptions = {}) {
  const response = await request(url, options);
  const bodyText = await response.text();
  if (!response.ok) {
    throw new HttpError(
      `Request failed (${response.status})`,
      { status: response.status, url, bodyText },
    );
  }
  try {
    return JSON.parse(bodyText) as T;
  } catch (error: any) {
    throw new HttpError(error?.message || 'Invalid JSON response', { status: response.status, url, bodyText });
  }
}

