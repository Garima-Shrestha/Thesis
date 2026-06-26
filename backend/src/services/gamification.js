import db from '../database/database.js';

export const computeLevel = (totalXp) => {
  if (totalXp < 100) return 1;
  if (totalXp < 250) return 2;
  if (totalXp < 500) return 3;
  if (totalXp < 1000) return 4;
  if (totalXp < 2000) return 5;
  if (totalXp < 3500) return 6;
  if (totalXp < 5000) return 7;
  if (totalXp < 7000) return 8;
  if (totalXp < 10000) return 9;
  return 10;
};

export const awardXP = (userId, amount, eventType, referenceId = null) => {
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO xp_events (user_id, amount, event_type, reference_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, amount, eventType, referenceId, created_at);

  const user = db.prepare('SELECT total_xp, weekly_xp FROM users WHERE id = ?').get(userId);
  const newTotalXp = user.total_xp + amount;
  const newWeeklyXp = user.weekly_xp + amount;
  const newLevel = computeLevel(newTotalXp);

  db.prepare(`
    UPDATE users SET total_xp = ?, weekly_xp = ?, current_level = ? WHERE id = ?
  `).run(newTotalXp, newWeeklyXp, newLevel, userId);

  return { newTotalXp, newLevel };
};

export const updateStreak = (userId) => {
  const user = db.prepare('SELECT current_streak, longest_streak, streak_last_date FROM users WHERE id = ?').get(userId);
  const today = new Date().toISOString().split('T')[0];

  if (user.streak_last_date === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = user.streak_last_date === yesterday ? user.current_streak + 1 : 1;
  let longestStreak = Math.max(newStreak, user.longest_streak);

  db.prepare(`
    UPDATE users SET current_streak = ?, longest_streak = ?, streak_last_date = ? WHERE id = ?
  `).run(newStreak, longestStreak, today, userId);
};

export const checkBadges = (userId) => {
  const user = db.prepare('SELECT problems_solved, current_streak, total_xp FROM users WHERE id = ?').get(userId);
  const allBadges = db.prepare('SELECT * FROM badges').all();
  const earned = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId).map(b => b.badge_id);

  for (const badge of allBadges) {
    if (earned.includes(badge.id)) continue;

    let qualified = false;
    if (badge.trigger_type === 'problems_solved' && user.problems_solved >= badge.trigger_value) qualified = true;
    if (badge.trigger_type === 'streak' && user.current_streak >= badge.trigger_value) qualified = true;
    if (badge.trigger_type === 'total_xp' && user.total_xp >= badge.trigger_value) qualified = true;

    if (qualified) {
      db.prepare(`
        INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)
      `).run(userId, badge.id, new Date().toISOString());
    }
  }
};

export const checkGroupUnlock = (userId) => {
  const allGroups = db.prepare(`
    SELECT * FROM challenge_groups ORDER BY order_index ASC
  `).all();

  for (const group of allGroups) {
    // Group A (order_index 1) is always unlocked
    if (group.order_index === 1) {
      const exists = db.prepare(`
        SELECT id FROM user_group_progress WHERE user_id = ? AND group_id = ?
      `).get(userId, group.id);
      if (!exists) {
        db.prepare(`
          INSERT INTO user_group_progress (user_id, group_id, is_unlocked)
          VALUES (?, ?, 1)
        `).run(userId, group.id);
      }
      continue;
    }

    // For other groups, check if previous group is fully completed
    const prevGroup = allGroups.find(g => g.order_index === group.order_index - 1);
    const totalInPrev = db.prepare(`
      SELECT COUNT(*) as count FROM challenges WHERE group_id = ? AND is_published = 1
    `).get(prevGroup.id).count;

    const solvedInPrev = db.prepare(`
      SELECT COUNT(DISTINCT challenge_id) as count FROM submissions
      WHERE user_id = ? AND status = 'accepted'
      AND challenge_id IN (SELECT id FROM challenges WHERE group_id = ?)
    `).get(userId, prevGroup.id).count;

    const alreadyUnlocked = db.prepare(`
      SELECT id FROM user_group_progress WHERE user_id = ? AND group_id = ?
    `).get(userId, group.id);

    if (solvedInPrev >= totalInPrev && !alreadyUnlocked) {
      db.prepare(`
        INSERT INTO user_group_progress (user_id, group_id, is_unlocked)
        VALUES (?, ?, 1)
      `).run(userId, group.id);
    }
  }
};