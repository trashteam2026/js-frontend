// Single source of truth for the backend base URL.
//
// Every caller that talks to the backend resolves the base URL through here so
// the unset-env behavior is consistent. A missing VITE_BACKEND_URL must FAIL
// LOUDLY — in production a blank backend URL is a misconfiguration, and silently
// falling back to localhost (or building an `undefined/...` URL) hides it until
// requests mysteriously fail. The trailing slash is stripped so callers can
// always concatenate endpoint paths that begin with `/`.

export function getBackendUrl() {
  const raw = import.meta.env.VITE_BACKEND_URL;
  if (!raw || !raw.trim()) {
    throw new Error(
      'VITE_BACKEND_URL is not set. Configure the backend base URL in your ' +
        'environment (e.g. .env) before starting the app.'
    );
  }
  return raw.trim().replace(/\/$/, '');
}
