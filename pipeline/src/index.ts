import { startScheduler } from './jobs/scheduler.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Project Hail Mary: Pipeline Initialized');
startScheduler();