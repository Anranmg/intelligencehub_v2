import express from 'express';
import cors from 'cors';
import multer from 'multer';
import db from './db.js';
import { analyzeSubmission } from './ai.js';

const app = express();
const upload = multer({ limits: { fileSize: 6 * 1024 * 1024 } });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'online' });
});

app.post('/api/intelligence', upload.single('image'), async (req, res, next) => {
  try {
    const content = (req.body.content || '').toString();
    const contributorName = (req.body.contributorName || '').toString().trim() || null;
    const isPublic = (req.body.isPublic || 'true').toString() === 'true' ? 1 : 0;
    const imageData = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;

    if (!content.trim() && !imageData) {
      return res.status(400).json({ error: 'Content or image is required.' });
    }

    const structured = await analyzeSubmission({ content, imageData });

    const info = db
      .prepare(
        `INSERT INTO intelligence (content, image_data, structured_json, summary, contributor_name, is_public)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(content, imageData, JSON.stringify(structured), structured.information_details || '', contributorName, isPublic);

    return res.status(201).json({
      data: {
        id: info.lastInsertRowid,
        structured
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/intelligence', (req, res, next) => {
  try {
    const search = (req.query.search || '').toString().trim().toLowerCase();
    const rows = db
      .prepare('SELECT * FROM intelligence WHERE is_public = 1 ORDER BY datetime(created_at) DESC, id DESC')
      .all()
      .map((row) => {
        const structured = JSON.parse(row.structured_json || '{}');
        return {
          id: row.id,
          content: row.content,
          image_data: row.image_data,
          information_category: structured.information_category || '未分类',
          related_product: structured.related_product || '未提及',
          information_details: structured.information_details || row.summary || '',
          contributor_name: row.contributor_name,
          create_at: row.created_at,
          structured
        };
      });

    const data = !search
      ? rows
      : rows.filter((row) => {
          const haystack = [
            row.content,
            row.information_category,
            row.related_product,
            row.information_details,
            row.structured?.record_timestamp,
            row.structured?.information_source,
            row.structured?.information_provider,
            row.structured?.information_region,
            row.structured?.information_org
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(search);
        });

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/ranking', (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT contributor_name, created_at FROM intelligence').all();

    const byContributor = new Map();
    const currentMonth = new Date().toISOString().slice(0, 7);

    rows.forEach((row) => {
      const name = row.contributor_name || 'Anonymous';
      const record = byContributor.get(name) || { name, submissions: 0, points: 0, monthly: 0 };
      record.submissions += 1;
      record.points += 1;
      if ((row.created_at || '').startsWith(currentMonth)) record.monthly += 1;
      byContributor.set(name, record);
    });

    const leaderboard = [...byContributor.values()].sort((a, b) => b.points - a.points || b.submissions - a.submissions);
    const monthlyStar = [...leaderboard].sort((a, b) => b.monthly - a.monthly)[0] || null;

    res.json({
      data: {
        monthlyStar,
        totalIntelligence: rows.length,
        activeMembers: byContributor.size,
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({ error: error.message || 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
