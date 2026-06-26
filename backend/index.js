import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/database/database.js';
import authRoutes from './src/routes/auth.js';
import challengeRoutes from './src/routes/challenges.js';
import submissionRoutes from './src/routes/submissions.js';
import adminRoutes from './src/routes/admin.js';
import userRoutes from './src/routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Gamified Coding Platform API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});