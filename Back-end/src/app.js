import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRouter from './routes/health.routes.js';
import contactRouter from './routes/contact.routes.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Basic Middleware setup
app.use(cors());
app.use(express.json({ limit: env.JSON_LIMIT }));

// API Routes
app.use('/api', healthRouter);
app.use('/api/contacts', contactRouter);

// Catch-all 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
