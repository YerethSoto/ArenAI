// Central API base resolver. Use Vite env VITE_API_BASE to override in builds.
export const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export function buildUrl(path: string) {
  // ensure no double slashes
  if (!API_BASE) return path;
  return API_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
