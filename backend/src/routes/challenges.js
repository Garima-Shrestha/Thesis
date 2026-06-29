import express from 'express';
import db from '../database/database.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkGroupUnlock } from '../services/gamification.js';

const router = express.Router();

// Get all groups with their challenges and lock status
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;

  // Ensure Group A is unlocked for this user
  checkGroupUnlock(userId);

  const groups = db.prepare(`
    SELECT * FROM challenge_groups ORDER BY order_index ASC
  `).all();

  const result = groups.map(group => {
    const isUnlocked = db.prepare(`
      SELECT id FROM user_group_progress WHERE user_id = ? AND group_id = ? AND is_unlocked = 1
    `).get(userId, group.id);

    const challenges = db.prepare(`
      SELECT id, title, difficulty, level_required, xp_reward, topic_tag FROM challenges
      WHERE group_id = ? AND is_published = 1
      ORDER BY level_required ASC
    `).all(group.id);

    const solvedIds = db.prepare(`
      SELECT DISTINCT challenge_id FROM submissions
      WHERE user_id = ? AND status = 'accepted'
      AND challenge_id IN (SELECT id FROM challenges WHERE group_id = ?)
    `).all(userId, group.id).map(r => r.challenge_id);

    return {
      ...group,
      is_unlocked: isUnlocked ? 1 : 0,
      challenges: challenges.map(c => ({
        ...c,
        is_solved: solvedIds.includes(c.id),
      })),
    };
  });

  res.json(result);
});

// Get single challenge
router.get('/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const challenge = db.prepare(`
    SELECT * FROM challenges WHERE id = ? AND is_published = 1
  `).get(req.params.id);

  if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });

  // Check if user has access to this group
  const groupAccess = db.prepare(`
    SELECT id FROM user_group_progress WHERE user_id = ? AND group_id = ? AND is_unlocked = 1
  `).get(userId, challenge.group_id);

  if (!groupAccess) return res.status(403).json({ message: 'This group is locked. Complete the previous group first.' });

  // const testCases = db.prepare(`
  //   SELECT id, input, expected_output FROM test_cases
  //   WHERE challenge_id = ? AND is_sample = 1
  // `).all(req.params.id);

  // res.json({ ...challenge, sample_test_cases: testCases });

  const testCases = db.prepare(`
    SELECT id, input, expected_output FROM test_cases
    WHERE challenge_id = ? AND is_sample = 1
  `).all(req.params.id);

  const attemptCount = db.prepare(`
    SELECT COUNT(*) as count FROM submissions
    WHERE user_id = ? AND challenge_id = ?
  `).get(userId, req.params.id).count;

  const isSolved = db.prepare(`
    SELECT id FROM submissions
    WHERE user_id = ? AND challenge_id = ? AND status = 'accepted'
  `).get(userId, req.params.id);

  const totalSolvedCount = db.prepare(`
    SELECT COUNT(DISTINCT challenge_id) as count
    FROM submissions
    WHERE user_id = ?
    AND status = 'accepted'
  `).get(userId).count;

  const totalQuestionCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM challenges
    WHERE is_published = 1
  `).get().count;

  res.json({ ...challenge, sample_test_cases: testCases, attempt_count: attemptCount, is_solved: !!isSolved, total_solved_count: totalSolvedCount, total_question_count: totalQuestionCount });
});


router.get('/:id/solution', authMiddleware, (req, res) => {
  const userId = req.user.id;

  const attemptCount = db.prepare(`
    SELECT COUNT(*) as count FROM submissions
    WHERE user_id = ? AND challenge_id = ?
  `).get(userId, req.params.id).count;

  const alreadySolved = db.prepare(`
    SELECT id FROM submissions
    WHERE user_id = ? AND challenge_id = ? AND status = 'accepted'
  `).get(userId, req.params.id);

  if (!alreadySolved && attemptCount < 5) {
    return res.status(403).json({
      message: `You need at least 5 attempts to unlock the solution. You have ${attemptCount} so far.`,
      attempts: attemptCount
    });
  }

  const testCases = db.prepare(`
    SELECT input, expected_output FROM test_cases
    WHERE challenge_id = ? AND is_sample = 1
  `).all(req.params.id);

  const challenge = db.prepare('SELECT title, description, topic_tag FROM challenges WHERE id = ?').get(req.params.id);

  const fullChallenge = db.prepare('SELECT solution_code, topic_tag FROM challenges WHERE id = ?').get(req.params.id);
  res.json({ unlocked: true, attempts: attemptCount, solution_code: fullChallenge.solution_code, topic_tag: fullChallenge.topic_tag });
});


export default router;