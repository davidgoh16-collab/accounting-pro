## 2026-05-16 - Prevent Sensitive File Exposure
**Vulnerability:** The Express server was serving the root directory `__dirname` as static files, exposing sensitive files like `.env`, `server.js`, and `package.json`.
**Learning:** Adding fallback static directories during development can easily lead to critical data exposure in production if the root directory is included.
**Prevention:** Only serve specific, intended build directories (e.g., `dist`) as static files. Never serve the application root directory.

## 2024-05-24 - SSRF in Secure Proxy Endpoint
**Vulnerability:** A "secure proxy" endpoint intended to proxy video files to avoid exposing an API key allowed requesting ANY path on the upstream host (e.g. `generativelanguage.googleapis.com`), enabling an attacker to call arbitrary endpoints (like `/v1beta/models`) with the server API key attached.
**Learning:** Checking only the hostname is insufficient for SSRF protection when the upstream host has multiple services or data scopes. This creates a confused deputy vulnerability.
**Prevention:** Always restrict both the hostname and the precise base path (e.g., `/v1beta/files/`) for proxy endpoints, and avoid overly permissive whitelists for third-party service endpoints.
