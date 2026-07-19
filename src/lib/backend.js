export function buildBackendUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const backendBaseUrl = (process.env.API_URL?.trim() || "http://127.0.0.1:5000").replace(/\/$/, "");
  return `${backendBaseUrl}/api${normalizedPath}`;
}
