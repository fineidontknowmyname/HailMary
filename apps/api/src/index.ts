import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { globalErrorHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';

import intelRoutes from './routes/intel.routes';
import progressRoutes from './routes/progress.routes';
import profileRoutes from './routes/profile.routes';
import aiRoutes from './routes/ai.routes';
import resourceRoutes from './routes/resource.routes';
import sessionsRoutes from './routes/sessions.routes';
import portfolioRoutes from './routes/portfolio.routes';


const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimit);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Project Hail Mary', version: '2.0.0-enterprise' });
});

app.use('/api/intel', intelRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(` Project Hail Mary API running → ${process.env.API_URL || `http://localhost:${PORT}`}`);

  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    setInterval(async () => {
      try {
        await fetch(`${process.env.RENDER_EXTERNAL_URL}/health`);
        console.log(' Keep-alive ping sent');
      } catch (e) {
        console.error(' Keep-alive failed', e);
      }
    }, 14 * 60 * 1000); 
  }
});
