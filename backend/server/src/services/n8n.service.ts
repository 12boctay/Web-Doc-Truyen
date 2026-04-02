import { env } from '../config/env';

export async function triggerCrawl(siteName: string, comicUrls?: string[]) {
  const crawlerUrl = (env as any).CRAWLER_SERVICE_URL;

  const endpoint = comicUrls?.length ? '/crawl/all' : '/crawl';
  const body = comicUrls?.length ? { siteName, comicUrls } : { siteName, sourceUrl: '' };

  const response = await fetch(`${crawlerUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw Object.assign(new Error((err as any).error || 'Failed to trigger crawl'), {
      status: response.status,
    });
  }

  return response.json();
}

export async function listWorkflows() {
  const n8nUrl = (env as any).N8N_URL;

  const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw Object.assign(new Error('Failed to fetch n8n workflows'), { status: response.status });
  }

  return response.json();
}

export async function listExecutions(workflowId?: string) {
  const n8nUrl = (env as any).N8N_URL;

  let url = `${n8nUrl}/api/v1/executions?limit=20`;
  if (workflowId) {
    url += `&workflowId=${workflowId}`;
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw Object.assign(new Error('Failed to fetch n8n executions'), { status: response.status });
  }

  return response.json();
}

export async function getCrawlerStatus() {
  const crawlerUrl = (env as any).CRAWLER_SERVICE_URL;

  const response = await fetch(`${crawlerUrl}/crawl/status`);

  if (!response.ok) {
    throw Object.assign(new Error('Failed to fetch crawler status'), { status: response.status });
  }

  return response.json();
}
