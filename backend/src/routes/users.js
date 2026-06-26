import express from 'express';
import db from '../database/database.js';
import { config } from '../config/index.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT id, display_name, email, role, total_xp, current_level,
    current_streak, longest_streak, weekly_xp, problems_solved, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json({ message: 'User not found.' });

  const badges = db.prepare(`
    SELECT b.id, b.name, b.description, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = ?
  `).all(req.user.id);

  res.json({ ...user, badges });
});

router.get('/leaderboard', authMiddleware, (req, res) => {
  const users = db.prepare(`
    SELECT id, display_name, total_xp, weekly_xp, current_level, problems_solved
    FROM users
    ORDER BY weekly_xp DESC, total_xp DESC
    LIMIT 20
  `).all();
  res.json(users);
});

router.post('/ai-assist', authMiddleware, async (req, res) => {
  const { challengeDescription, code, userMessage, history = [] } = req.body;

  const user = db.prepare('SELECT ai_requests_today, ai_reset_date FROM users WHERE id = ?').get(req.user.id);
  const today = new Date().toISOString().split('T')[0];

  if (user.ai_reset_date !== today) {
    db.prepare('UPDATE users SET ai_requests_today = 0, ai_reset_date = ? WHERE id = ?').run(today, req.user.id);
    user.ai_requests_today = 0;
  }

  const models = [
    'gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'openrouter/free',
  ];

  const systemPrompt = `You are a friendly Java tutor for absolute beginners — students in their very first semester who have never coded before. Always assume the student knows nothing.

  RULES:
  1. Use extremely simple language. No technical jargon without explanation. Explain terms like "variable", "method", "import" in plain English first.
  2. Be encouraging and warm. Never make the student feel stupid.
  3. Guide step by step — one small step at a time. Don't jump ahead.
  4. You may show ONE short line of code as a hint only when the student is clearly stuck after multiple tries.
  5. NEVER show a complete working solution.
  6. Keep responses short — max 3-4 sentences. Simple words only.
  7. Do NOT start every message with "Hi", "Hello", or any greeting. Only greet once if the student says hello first. After that, just respond naturally. Guide, hint, and ask leading questions instead if needed.
  8. If asked anything unrelated to Java or programming — say: "I'm here to help with Java and programming!"
  9. If asked something harmful or illegal — say: "I can't help with that."`;

  try {
    let aiMessage = null;

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openRouterApiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 500,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Challenge Description:\n${challengeDescription}` },
              { role: 'assistant', content: 'Understood! I will guide the student without giving full solutions.' },
              ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: `Current Code:\n${code}\n\nQuestion: ${userMessage}` }
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const data = await response.json();

        if (!data.error && data.choices?.[0]?.message?.content) {
          aiMessage = data.choices[0].message.content;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // if (!aiMessage) {
    //   return res.json({ message: 'All AI models are busy right now. Please try again in a moment.', requestsUsed: user.ai_requests_today });
    // }


    if (!aiMessage) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const retryResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.openRouterApiKey}` },
          body: JSON.stringify({
            model: 'openrouter/free',
            max_tokens: 500,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: `Current Code:\n${code}\n\nQuestion: ${userMessage}` }
            ],
          }),
        });
        const retryData = await retryResponse.json();
        if (!retryData.error && retryData.choices?.[0]?.message?.content) {
          aiMessage = retryData.choices[0].message.content;
        }
      } catch(e) {}
    }

    if (!aiMessage) {
      return res.json({ message: 'AI is temporarily busy. Please try again in a few seconds.', requestsUsed: user.ai_requests_today });
    }


    db.prepare('UPDATE users SET ai_requests_today = ai_requests_today + 1 WHERE id = ?').run(req.user.id);
    const updated = db.prepare('SELECT ai_requests_today FROM users WHERE id = ?').get(req.user.id);

    res.json({ message: aiMessage, requestsUsed: updated.ai_requests_today });
  } catch (err) {
    res.status(500).json({ message: 'AI service error.' });
  }
});

export default router;
