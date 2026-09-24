import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Basic Middleware setup
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
