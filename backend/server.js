// Synergy Reader - Node.js / Express backend
require('dotenv').config();
const express = require('express');
const path = require('path');
const { loadState, saveState, listBooks, DB_FILE } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const AI_KEY = process.env.ANTHROPIC_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-5-5';

app.use(express.json({ limit: '25mb' }));            // notes may contain small images
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- health: tells the frontend whether AI is configured ----
app.get('/api/health', (req, res) => res.json({ ok: true, ai: !!AI_KEY }));

// ---- database: books and chapters (read only) ----
app.get('/api/books', (req, res) => res.json(listBooks()));

// ---- progress storage in the SQLite database (students, reading position, notes, stars) ----
app.get('/api/state', (req, res) => {
  try { res.json(loadState()); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not read saved data' }); }
});

app.put('/api/state', (req, res) => {
  if (!req.body || !Array.isArray(req.body.users)) return res.status(400).json({ error: 'Invalid data' });
  try { saveState(req.body); res.json({ saved: true }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not save data' }); }
});

// ---- AI proxy: chapter summary, doubt answers, recap + quiz ----
app.post('/api/ai', async (req, res) => {
  if (!AI_KEY) return res.status(503).json({ error: 'AI key not set on the server' });
  const prompt = String((req.body && req.body.prompt) || '').slice(0, 20000);
  if (!prompt) return res.status(400).json({ error: 'Empty prompt' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: AI_MODEL, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI request failed' });
    res.json({ text: d.content.map(b => b.text || '').join('') });
  } catch (e) { res.status(502).json({ error: 'Could not reach AI service' }); }
});

app.listen(PORT, () => console.log(`Synergy Reader running at http://localhost:${PORT}  (database: ${DB_FILE})`));
