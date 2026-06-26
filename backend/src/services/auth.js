import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/database.js';
import { config } from '../config/index.js';

export const registerUser = (display_name, email, password) => {
  // Validation
  if (!display_name || !email || !password)
    throw new Error('All fields are required.');

  if (display_name.length < 3 || display_name.length > 40)
    throw new Error('Display name must be 3 to 40 characters.');

  if (password.length < 8)
    throw new Error('Password must be at least 8 characters.');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    throw new Error('Invalid email format.');

  // Business logic
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) throw new Error('Email already in use.');

  const password_hash = bcrypt.hashSync(password, 10);
  const created_at = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO users (display_name, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(display_name, email.toLowerCase(), password_hash, created_at);

  return { id: result.lastInsertRowid, display_name, email };
};

export const loginUser = (email, password) => {
  // Validation
  if (!email || !password)
    throw new Error('Email and password are required.');

  // Business logic
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) throw new Error('Invalid email or password.');

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) throw new Error('Invalid email or password.');

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, display_name: user.display_name, role: user.role } };
};