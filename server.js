import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

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
