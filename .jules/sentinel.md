## 2026-05-16 - Prevent Sensitive File Exposure
**Vulnerability:** The Express server was serving the root directory `__dirname` as static files, exposing sensitive files like `.env`, `server.js`, and `package.json`.
**Learning:** Adding fallback static directories during development can easily lead to critical data exposure in production if the root directory is included.
**Prevention:** Only serve specific, intended build directories (e.g., `dist`) as static files. Never serve the application root directory.

## 2024-05-24 - SSRF in Secure Proxy Endpoint
**Vulnerability:** A "secure proxy" endpoint intended to proxy video files to avoid exposing an API key allowed requesting ANY path on the upstream host (e.g. `generativelanguage.googleapis.com`), enabling an attacker to call arbitrary endpoints (like `/v1beta/models`) with the server API key attached.
**Learning:** Checking only the hostname is insufficient for SSRF protection when the upstream host has multiple services or data scopes. This creates a confused deputy vulnerability.
**Prevention:** Always restrict both the hostname and the precise base path (e.g., `/v1beta/files/`) for proxy endpoints, and avoid overly permissive whitelists for third-party service endpoints.

## 2024-06-27 - Path Traversal in Firebase Storage
**Vulnerability:** Firebase Storage functions (`downloadFileAsBase64` and `uploadBase64Image`) accepted paths without checking for directory traversal sequences like `..`.
**Learning:** If user-supplied input is ever concatenated into the `path` argument of `ref(storage, path)`, an attacker could construct payloads like `../` to break out of intended directories and access or overwrite unauthorized files in the Firebase Storage bucket.
**Prevention:** Always sanitize or strictly validate file paths before passing them to Firebase Storage `ref()` by checking for `..` sequences or enforcing absolute path structures.
