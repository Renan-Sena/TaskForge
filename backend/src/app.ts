import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { httpLogger } from './middleware/logger.js';
import { limiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Rotas
import projectRoutes from './modules/project/project.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import authRoutes from './modules/auth/auth.routes.js'; 

export const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(limiter);

app.use((req, res, next) => {
  console.log('📨 Headers completos recebidos:');
  console.log(JSON.stringify(req.headers, null, 2));
  next();
});

// Rotas da API
app.use('/api/v1/auth', authRoutes);      
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);  


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});


app.use(errorHandler);