import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/:id/active-event', async (_req: Request, res: Response) => {
  res.json({});
});

router.post('/:id/active-event/choose', async (_req: Request, res: Response) => {
  res.json({ outcome: 'You defeated the goblin!' });
});

router.get('/:id/active-event/history', async (_req: Request, res: Response) => {
  res.json([{ event: 'You encountered a goblin!', outcome: 'You defeated the goblin!' }]);
});

export default router;
