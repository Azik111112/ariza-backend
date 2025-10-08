require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL ulanish
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'ariza',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

// === 1. User ariza yuboradi ===
app.post('/api/requests', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Ism va telefon raqam kiritilishi kerak' });
  }
  try {
    const q = 'INSERT INTO requests (name, phone) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(q, [name, phone]);
    res.json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Maʼlumot bazasi xatosi' });
  }
});

// === 2. Admin arizalarni ko‘radi ===
app.get('/api/requests', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Ruxsat yo‘q' });
  }
  try {
    const result = await pool.query('SELECT * FROM requests ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB xatosi' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend ${PORT}-portda ishlayapti`));
