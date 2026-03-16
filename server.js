#!/usr/bin/env node

/**
 * Growth Strategy Agent - Web API Server
 * Serves the UI and /api/generate endpoint
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runGeneration } from './generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  try {
    const { companyInfo, format = 'md' } = req.body;
    if (!companyInfo) {
      return res.status(400).json({ error: 'companyInfo is required' });
    }
    const fmt = format === 'docx' ? 'docx' : 'md';
    const { markdown, docxBuffer } = await runGeneration(companyInfo, fmt);

    if (fmt === 'docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="growth-strategy.docx"');
      return res.send(docxBuffer);
    }
    return res.json({ markdown });
  } catch (err) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Growth Strategy Agent running at http://localhost:${PORT}`);
});
