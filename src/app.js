const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: 5432,
  database: process.env.POSTGRES_DB || 'coredb',
  user: process.env.POSTGRES_USER || 'core',
  password: process.env.POSTGRES_PASSWORD || 'secret',
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:9000';

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: process.env.SERVICE_VERSION || 'v0.1.0' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Evaluate policy (nghiệp vụ trung tâm)
app.post('/evaluate', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token || token !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(401).json({ type: 'Unauthorized', title: 'Missing or invalid token', status: 401 });
  }

  const { source, payload } = req.body;
  if (!source || !payload) {
    return res.status(400).json({ type: 'BadRequest', title: 'Missing source or payload', status: 400 });
  }

  // Gọi AI service nội bộ
  let aiResult = null;
  try {
    const fetch = (await import('node-fetch')).default;
    const aiRes = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, payload }),
    });
    aiResult = await aiRes.json();
  } catch (e) {
    aiResult = { prediction: 'unavailable' };
  }

  // Lưu vào DB
  const result = await pool.query(
    `INSERT INTO evaluations (source, payload, ai_result, created_at)
     VALUES ($1, $2, $3, NOW()) RETURNING id`,
    [source, JSON.stringify(payload), JSON.stringify(aiResult)]
  );

  res.status(201).json({
    evaluationId: result.rows[0].id,
    source,
    decision: aiResult.prediction === 'alert' ? 'DENY' : 'ALLOW',
    aiResult,
  });
});

// Lấy danh sách evaluations
app.get('/evaluations', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token || token !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(401).json({ type: 'Unauthorized', title: 'Missing or invalid token', status: 401 });
  }
  const rows = await pool.query('SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 20');
  res.json({ items: rows.rows });
});

// Init DB table
pool.query(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    payload JSONB,
    ai_result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log('DB ready'));

const PORT = process.env.APP_PORT || 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Core API running on port ${PORT}`));