import express from 'express';
import { registerUser, loginUser } from '../services/auth.js';

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const user = registerUser(req.body.display_name, req.body.email, req.body.password);
    res.status(201).json({ message: 'Account created.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const result = loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

export default router;