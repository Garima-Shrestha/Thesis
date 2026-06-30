import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterApiUrl: process.env.OPENROUTER_API_URL,
};