import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { httpLogger } from './middleware/logger.js';
import { limiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Rotas
import userRoutes from './modules/user/user.routes.js';
import projectRoutes from './modules/project/project.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(limiter);

// Rotas da API
app.use(express.json());
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Tratamento de erros (deve ser o último middleware)
app.use(errorHandler);