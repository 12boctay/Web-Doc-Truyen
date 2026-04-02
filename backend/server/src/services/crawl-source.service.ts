import { CrawlSource } from '../models/CrawlSource';

export async function list() {
  return CrawlSource.find().sort({ createdAt: -1 });
}

export async function getById(id: string) {
  const source = await CrawlSource.findById(id);
  if (!source) {
    throw Object.assign(new Error('CrawlSource not found'), { status: 404 });
  }
  return source;
}

export async function create(data: {
  name: string;
  baseUrl: string;
  selectors?: Record<string, string>;
  headers?: Record<string, string>;
  schedule?: string;
}) {
  return CrawlSource.create(data);
}

export async function update(id: string, data: Record<string, any>) {
  const source = await CrawlSource.findByIdAndUpdate(id, data, { new: true });
  if (!source) {
    throw Object.assign(new Error('CrawlSource not found'), { status: 404 });
  }
  return source;
}

export async function remove(id: string) {
  const source = await CrawlSource.findByIdAndDelete(id);
  if (!source) {
    throw Object.assign(new Error('CrawlSource not found'), { status: 404 });
  }
  return source;
}

export async function testSource(id: string) {
  const source = await CrawlSource.findById(id);
  if (!source) {
    throw Object.assign(new Error('CrawlSource not found'), { status: 404 });
  }

  try {
    const response = await fetch(source.baseUrl, {
      headers: source.headers as Record<string, string> || {},
    });
    return {
      reachable: response.ok,
      status: response.status,
      url: source.baseUrl,
    };
  } catch (err: any) {
    return {
      reachable: false,
      status: 0,
      url: source.baseUrl,
      error: err.message,
    };
  }
}
