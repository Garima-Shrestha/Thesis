import express from 'express';
import { runCode, submitCode } from '../services/submission.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import db from '../database/database.js';

const router = express.Router();

// Run against sample test cases only
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { code, challengeId } = req.body;
    const results = await runCode(code, challengeId);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit against all test cases [This requires the code to have at least one meaningful Java keyword and be long enough (needs atleast 80 non-whitespace chars).]
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { code, challengeId } = req.body;
    const strippedCode = code.replace(/\/\/.*$/gm, '').replace(/\s/g, '');
    const hasScanner = code.includes('Scanner') || code.includes('System.out') || code.includes('return') || code.includes('for') || code.includes('while') || code.includes('if');
    if (!hasScanner || strippedCode.length < 80) {
      return res.status(400).json({ message: 'Please write a proper solution before submitting. Your code seems incomplete.' });
    }
    const result = await submitCode(req.user.id, challengeId, code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get submission history for a challenge
router.get('/history/:challengeId', authMiddleware, (req, res) => {
  const submissions = db.prepare(`
    SELECT id, status, submitted_at FROM submissions
    WHERE user_id = ? AND challenge_id = ?
    ORDER BY submitted_at DESC
  `).all(req.user.id, req.params.challengeId);
  res.json(submissions);
});

export default router;