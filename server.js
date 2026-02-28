import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const app = express();
const port = process.env.PORT || 8080;

// Replace placeholder API key in built files before serving if running in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const replaceKeyInDirectory = (dir) => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        replaceKeyInDirectory(filePath);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // We only want to replace the literal string "GEMINI_API_KEY" if it was used as a placeholder
        // which Vite define will output as "GEMINI_API_KEY"
        if (content.includes('"GEMINI_API_KEY"')) {
          const actualKey = process.env.GEMINI_API_KEY || '';
          content = content.replace(/"GEMINI_API_KEY"/g, `"${actualKey}"`);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Replaced API key placeholder in ${file}`);
        }
      }
    });
  };

  try {
    replaceKeyInDirectory(distPath);
  } catch (err) {
    console.error("Error replacing API key placeholder:", err);
  }
}

// Security Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Legacy XSS Protection (still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve index.html for all other routes (SPA)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
