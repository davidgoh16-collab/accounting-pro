## 2026-05-16 - Prevent Sensitive File Exposure
**Vulnerability:** The Express server was serving the root directory `__dirname` as static files, exposing sensitive files like `.env`, `server.js`, and `package.json`.
**Learning:** Adding fallback static directories during development can easily lead to critical data exposure in production if the root directory is included.
**Prevention:** Only serve specific, intended build directories (e.g., `dist`) as static files. Never serve the application root directory.
