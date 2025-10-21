import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { cleanupStaleRequests } from './services/assetCache';
import { startCacheCleaner, stopCacheCleaner } from './services/gemini';
import { startCostTracking, stopCostTracking } from './routes/dmChatSecure';
import { TownGenerationService } from './services/townGenerationService';

import characterRoutes from './routes/characters';
import worldRoutes from './routes/world';
import assetRoutes from './routes/assets';
import activeRoutes from './routes/active';
import activeEventsRoutes from './routes/activeEvents';
import idleRoutes from './routes/idle';
import mapsRoutes from './routes/maps';
import strategicMapRoutes from './routes/strategicMap';
import tensionRoutes from './routes/tension';
import subclassRoutes from './routes/subclass';
import nameGenerationRoutes from './routes/nameGeneration';
import spellsRoutes from './routes/spells';
import partyRoutes from './routes/party';
// import dmChatRoutes from './routes/dmChat'; // OLD insecure version
import dmChatSecureRoutes from './routes/dmChatSecure'; // NEW secure architecture
import verificationRoutes from './routes/verification';

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

// Debug endpoint to manually trigger town generation
app.post('/api/admin/generate-town/:campaignSeed', async (req: Request, res: Response) => {
  try {
    const { campaignSeed } = req.params;
    console.log(`[Admin] Triggering town generation for campaign: ${campaignSeed}`);

    const town = await TownGenerationService.getOrGenerateTown({
      campaignSeed,
      campaignName: 'Nuaibria - Shared World',
      regionType: 'temperate forest',
    });

    res.status(200).json({
      success: true,
      message: 'Town generation triggered',
      townName: town.name,
      townRegion: town.region,
    });

    console.log(`[Admin] Town generated: ${town.name}`);
  } catch (error) {
    console.error('[Admin] Error generating town:', error);
    res.status(500).json({
      error: 'Failed to generate town',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api/characters', characterRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/active', activeRoutes);
app.use('/api/active-events', activeEventsRoutes);
app.use('/api/idle', idleRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/strategic-map', strategicMapRoutes); // Strategic world map with fog of war
app.use('/api/tension', tensionRoutes); // Vague warnings (no mechanics exposed)
app.use('/api/subclass', subclassRoutes); // Subclass selection and management
app.use('/api/names', nameGenerationRoutes); // Fantasy name generation
app.use('/api/spells', spellsRoutes); // D&D 5e spells database
app.use('/api/party', partyRoutes); // Party system for multiplayer (ADR-003, ADR-004)
app.use('/api/chat/dm', dmChatSecureRoutes); // PRIMARY GAMEPLAY INTERFACE (secure architecture)
app.use('/api', verificationRoutes);

const port = Number(process.env.PORT ?? 3001);

export const startServer = (): void => {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${port}`);

    // Start Gemini cache cleanup interval
    startCacheCleaner();

    // Start cost tracking cleanup interval
    startCostTracking();

    // Cleanup stale asset requests on startup
    cleanupStaleRequests(30).then(count => {
      console.log(`[Startup] Cleaned up ${count} stale asset requests`);
    }).catch(err => {
      console.error('[Startup] Asset cleanup failed:', err);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully...');
    stopCacheCleaner();
    stopCostTracking();
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully...');
    stopCacheCleaner();
    stopCostTracking();
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });
};

if (require.main === module) {
  startServer();
}
