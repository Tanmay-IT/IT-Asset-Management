import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import { requireAuth } from './middleware/requireAuth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
  app.use(express.json());

  // /api/auth/login is the only unauthenticated route; everything else
  // under /api requires a valid token.
  app.use('/api/auth', authRoutes);
  app.use('/api', requireAuth, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
