## 2026-05-16 - Prevent Sensitive File Exposure
**Vulnerability:** The Express server was serving the root directory `__dirname` as static files, exposing sensitive files like `.env`, `server.js`, and `package.json`.
**Learning:** Adding fallback static directories during development can easily lead to critical data exposure in production if the root directory is included.
**Prevention:** Only serve specific, intended build directories (e.g., `dist`) as static files. Never serve the application root directory.

## 2024-05-24 - SSRF in Secure Proxy Endpoint
**Vulnerability:** A "secure proxy" endpoint intended to proxy video files to avoid exposing an API key allowed requesting ANY path on the upstream host (e.g. `generativelanguage.googleapis.com`), enabling an attacker to call arbitrary endpoints (like `/v1beta/models`) with the server API key attached.
**Learning:** Checking only the hostname is insufficient for SSRF protection when the upstream host has multiple services or data scopes. This creates a confused deputy vulnerability.
**Prevention:** Always restrict both the hostname and the precise base path (e.g., `/v1beta/files/`) for proxy endpoints, and avoid overly permissive whitelists for third-party service endpoints.

## 2024-05-24 - SSRF Bypass via Path Traversal in Proxy
**Vulnerability:** The `/api/proxy-video` endpoint verified the path prefix using `pathname.startsWith('/v1beta/files/')`. However, by providing encoded path traversals (e.g. `..%2f`), an attacker could bypass this check because `URL.pathname` leaves certain encodings intact, while `fetch` or the upstream API decodes them, potentially allowing requests to other sensitive endpoints like `/v1beta/models`.
**Learning:** `startsWith` is insufficient for validating URL paths, especially when URL encodings could cause the upstream server to interpret the path differently (a form of path traversal SSRF bypass).
**Prevention:** Always decode paths using `decodeURIComponent` and validate them against a strict RegExp (e.g. `/^\/v1beta\/files\/[a-zA-Z0-9_-]+$/`) instead of simply checking the prefix.
