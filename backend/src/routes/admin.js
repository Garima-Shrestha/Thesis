import express from 'express';
import db from '../database/database.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Get all challenges (including unpublished)
router.get('/challenges', authMiddleware, adminMiddleware, (req, res) => {
  const challenges = db.prepare(`
    SELECT * FROM challenges ORDER BY created_at DESC
  `).all();
  const result = challenges.map(c => ({
    ...c,
    test_cases: db.prepare('SELECT * FROM test_cases WHERE challenge_id = ?').all(c.id)
  }));
  res.json(result);
});

// Create a new challenge
router.post('/challenges', authMiddleware, adminMiddleware, (req, res) => {
  const { title, description, difficulty, level_required, xp_reward, topic_tag, group_id, test_cases, solution_code } = req.body;

  if (!title || !description || !difficulty || !xp_reward || !topic_tag)
    return res.status(400).json({ message: 'All fields are required.' });

  if (!test_cases || test_cases.length === 0)
    return res.status(400).json({ message: 'At least one test case is required.' });

  const result = db.prepare(`
    INSERT INTO challenges (group_id, title, description, difficulty, level_required, xp_reward, topic_tag, solution_code, is_published, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(group_id || null, title, description, difficulty, level_required || 1, xp_reward, topic_tag, solution_code || null, new Date().toISOString());
  const challengeId = result.lastInsertRowid;

  const insertTC = db.prepare(`
    INSERT INTO test_cases (challenge_id, input, expected_output, is_sample)
    VALUES (?, ?, ?, ?)
  `);

  for (const tc of test_cases) {
    insertTC.run(challengeId, tc.input, tc.expected_output, tc.is_sample ? 1 : 0);
  }

  res.status(201).json({ message: 'Challenge created.', id: challengeId });
});

// Update challenge
router.put('/challenges/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { title, description, difficulty, level_required, xp_reward, topic_tag, is_published, solution_code, group_id, test_cases } = req.body;

  db.prepare(`
    UPDATE challenges SET title=?, description=?, difficulty=?, level_required=?,
    xp_reward=?, topic_tag=?, is_published=?, solution_code=?, group_id=? WHERE id=?
  `).run(title, description, difficulty, level_required, xp_reward, topic_tag, is_published ? 1 : 0, solution_code || null, group_id || null, req.params.id);

  if (test_cases && test_cases.length > 0) {
    db.prepare('DELETE FROM test_cases WHERE challenge_id = ?').run(req.params.id);
    const insertTC = db.prepare('INSERT INTO test_cases (challenge_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)');
    for (const tc of test_cases) {
      insertTC.run(req.params.id, tc.input || '', tc.expected_output, tc.is_sample ? 1 : 0);
    }
  }

  res.json({ message: 'Challenge updated.' });
});


// Delete challenge
router.delete('/challenges/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM test_cases WHERE challenge_id = ?').run(req.params.id);
  db.prepare('DELETE FROM challenges WHERE id = ?').run(req.params.id);
  res.json({ message: 'Challenge deleted.' });
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare(`
    SELECT id, display_name, email, role, total_xp, current_level, problems_solved, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  res.json(users);
});

export default router;