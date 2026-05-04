import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Security Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Allow Firebase auth popups to communicate back to the opener window
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize Gemini Client
const getAiClient = () => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set.");
    throw new Error("API Key not available.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

app.post('/api/generate-content', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const ai = getAiClient();

    // Check if tools (Google Search) are requested
    // The SDK handles tools configuration in `config` object passed to `generateContent`

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config
    });

    res.json({
      text: response.text,
      candidates: response.candidates
    });
  } catch (error) {
    console.error("Error in /api/generate-content:", error);
    res.status(500).json({ error: error.message });
  }
});

// Secure proxy for fetching case study videos to avoid exposing API key
app.get('/api/proxy-video', async (req, res) => {
  try {
    const videoUrlStr = req.query.url;
    if (!videoUrlStr || typeof videoUrlStr !== 'string') {
      return res.status(400).send('Missing url parameter');
    }

    // Basic SSRF protection - ensure it's a valid URL and uses HTTPS
    let parsedUrl;
    try {
      parsedUrl = new URL(videoUrlStr);
    } catch (err) {
      return res.status(400).send('Invalid URL format');
    }

    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).send('Only HTTPS URLs are allowed');
    }

    // Strict SSRF protection - only allow requests to Google APIs
    const ALLOWED_HOSTS = ['generativelanguage.googleapis.com'];
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
       return res.status(403).send('Forbidden: Target host not allowed');
    }

    // Append API Key securely
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).send('API Key not configured on server');
    }
    parsedUrl.searchParams.append('key', API_KEY);

    const response = await fetch(parsedUrl.toString());

    if (!response.ok) {
       console.error(`Proxy request failed with status ${response.status}`);
       return res.status(response.status).send(`Upstream request failed: ${response.statusText}`);
    }

    if (!response.body) {
      return res.status(500).send('No body in upstream response');
    }

    // Forward headers from the upstream response
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Pipe stream directly to client using Readable.fromWeb
    // Note: Node 18+ global fetch Response.body is a web stream, not a Node stream
    Readable.fromWeb(response.body).pipe(res);

  } catch (error) {
    console.error("Error in /api/proxy-video:", error);
    res.status(500).send(error.message || 'Failed to proxy video');
  }
});

app.post('/api/generate-content-stream', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const ai = getAiClient();

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: config
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of responseStream) {
      const data = JSON.stringify({
        text: chunk.text || '',
        candidates: chunk.candidates
      });
      res.write(data + '\n');
    }
    res.end();
  } catch (error) {
    console.error("Error in /api/generate-content-stream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
});

app.post('/api/generate-images', async (req, res) => {
  try {
    const { model, prompt, config } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateImages({
      model: model,
      prompt: prompt,
      config: config
    });

    res.json({
      generatedImages: response.generatedImages
    });
  } catch (error) {
    console.error("Error in /api/generate-images:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-song', async (req, res) => {
  try {
    const { prompt } = req.body;
    const ai = getAiClient();

    const responseStream = await ai.models.generateContentStream({
      model: "lyria-3-pro-preview",
      contents: prompt,
      config: {
        responseModalities: ["AUDIO", "TEXT"],
      },
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of responseStream) {
      const data = JSON.stringify({
        candidates: chunk.candidates
      });
      res.write(data + '\n');
    }
    res.end();
  } catch (error) {
    console.error("Error in /api/generate-song:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
});

app.post('/api/safeguarding-alert', async (req, res) => {
  try {
    const powerAutomateUrl = process.env.POWER_AUTOMATE_URL;
    if (!powerAutomateUrl) {
      console.warn("POWER_AUTOMATE_URL is not configured.");
      return res.status(500).json({ error: "Webhook URL not configured" });
    }

    const payload = req.body;

    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status} ${response.statusText}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /api/safeguarding-alert:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/check-admin', (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ isAdmin: false });
  const adminUIDs = process.env.ADMIN_USER_IDS
    ? process.env.ADMIN_USER_IDS.split(',').map(id => id.trim())
    : [];
  res.json({ isAdmin: adminUIDs.includes(uid) });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve index.html for all other routes (SPA)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

// Increase timeouts to handle long-running AI generations (5 minutes)
server.keepAliveTimeout = 300000;
server.headersTimeout = 305000;
server.requestTimeout = 300000;
server.timeout = 300000;
