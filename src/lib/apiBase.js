/**
 * Optional origin for API calls when the SPA is hosted separately from the backend.
 * Example: VITE_API_BASE_URL=https://hritiksharma.me
 * Leave unset to use same-origin paths (e.g. Vite dev proxy or static host + edge functions).
 */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return p;
  return `${base}${p}`;
}
