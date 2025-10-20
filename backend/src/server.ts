import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cleanupStaleRequests } from './services/assetCache';

import characterRoutes from './routes/characters';
import worldRoutes from './routes/world';
import assetRoutes from './routes/assets';
import activeRoutes from './routes/active';
import activeEventsRoutes from './routes/activeEvents';
import idleRoutes from './routes/idle';
import mapsRoutes from './routes/maps';
import tensionRoutes from './routes/tension';
import subclassRoutes from './routes/subclass';
import nameGenerationRoutes from './routes/nameGeneration';
import spellsRoutes from './routes/spells';
// import dmChatRoutes from './routes/dmChat'; // OLD insecure version
import dmChatSecureRoutes from './routes/dmChatSecure'; // NEW secure architecture

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Nuaibria Backend is running!');
});

// Health check endpoint for monitoring and TUI connection verification
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'nuaibria-backend',
  });
});

app.use('/api/characters', characterRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/active', activeRoutes);
app.use('/api/active-events', activeEventsRoutes);
app.use('/api/idle', idleRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/tension', tensionRoutes); // Vague warnings (no mechanics exposed)
app.use('/api/subclass', subclassRoutes); // Subclass selection and management
app.use('/api/names', nameGenerationRoutes); // Fantasy name generation
app.use('/api/spells', spellsRoutes); // D&D 5e spells database
app.use('/api/chat/dm', dmChatSecureRoutes); // PRIMARY GAMEPLAY INTERFACE (secure architecture)

const port = Number(process.env.PORT ?? 3001);

export const startServer = (): void => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${port}`);

    // Cleanup stale asset requests on startup
    cleanupStaleRequests(30).then(count => {
      console.log(`[Startup] Cleaned up ${count} stale asset requests`);
    }).catch(err => {
      console.error('[Startup] Asset cleanup failed:', err);
    });
  });
};

if (require.main === module) {
  startServer();
}
