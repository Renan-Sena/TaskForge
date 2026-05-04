import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { httpLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// ROUTES
import projectRoutes from './modules/project/project.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import authRoutes from './modules/auth/auth.routes.js'; 
import helmet from 'helmet';
import notificationRoutes from './modules/notification/notification.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(helmet());

app.use((req, res, next) => {
  console.log('📨 Complete headers received:');
  console.log(JSON.stringify(req.headers, null, 2));
  next();
});

// APIA routes
app.use('/api/v1/auth', authRoutes);      
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);  
app.use('/api/v1/notifications', notificationRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});


app.use(errorHandler);