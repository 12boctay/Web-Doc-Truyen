const PROXY_DOMAINS = ['hinhhinh.com', 'truyenqqno.com'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function proxyImageUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (PROXY_DOMAINS.some((d) => parsed.hostname.endsWith(d))) {
      return `${API_URL}/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // invalid URL, return as-is
  }
  return url;
}
