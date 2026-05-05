import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { globalErrorHandler } from './middleware/errorHandler';

// Route Imports
import intelRoutes from './routes/intel.routes';
import progressRoutes from './routes/progress.routes';
import profileRoutes from './routes/profile.routes';
import aiRoutes from './routes/ai.routes';
import resourceRoutes from './routes/resource.routes';
import sessionsRoutes from './routes/sessions.routes';


const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173', // Default Vite port
  'http://localhost:4000',
  process.env.FRONTEND_URL,
  /^https:\/\/hail-mary.*\.vercel\.app$/
].filter((origin): origin is string | RegExp => Boolean(origin));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok', project: 'Project Hail Mary', version: '2.0.0-enterprise' });
});

app.use('/api/intel', intelRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/sessions', sessionsRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(` Project Hail Mary API running → http://localhost:${PORT}`);

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
