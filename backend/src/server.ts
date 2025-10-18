import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import characterRoutes from './routes/characters';
import worldRoutes from './routes/world';
import assetRoutes from './routes/assets';
import activeRoutes from './routes/active';
import activeEventsRoutes from './routes/activeEvents';
import idleRoutes from './routes/idle';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Project Chimera Backend is running!');
});

app.use('/api/characters', characterRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/active', activeRoutes);
app.use('/api/active-events', activeEventsRoutes);
app.use('/api/idle', idleRoutes);

const port = Number(process.env.PORT ?? 3001);

export const startServer = (): void => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${port}`);
  });
};

if (require.main === module) {
  startServer();
}
