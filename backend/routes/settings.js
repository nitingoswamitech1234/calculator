import express from 'express';
import fs from 'fs';
import path from 'path';
const router = express.Router();

const DB_FILE = path.join(process.cwd(), 'backend', 'database', 'data.sqlite');

router.get('/backup', async (req, res) => {
  const backupName = `backup_${Date.now()}.sqlite`;
  const backupPath = path.join(process.cwd(), 'backend', 'database', backupName);
  fs.copyFileSync(DB_FILE, backupPath);
  // save to backups table
  const db = req.app.locals.db;
  await db.run('INSERT INTO backups (filename) VALUES (?)', [backupName]);
  res.download(backupPath);
});

router.post('/restore', async (req, res) => {
  // expect file upload handling (for simplicity assume path provided)
  // implementation depends on multer file upload. keep placeholder.
  res.json({ restored: false, message: 'Upload endpoint to be implemented with multer.' });
});

export default router;
