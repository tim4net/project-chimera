import { Router, type Request, type Response } from 'express';
import {
  loadMap,
  saveMap,
  updateMapById,
  listCampaignMaps
} from '../services/mapService';
import type { MapCreateRequest, MapUpdateRequest } from '../types/map';

const router = Router();

// IMPORTANT: Define the campaign listing route BEFORE the generic two-param route
// to avoid capturing "/campaign/:campaignSeed" by "/:campaignSeed/:zoneId"
router.get('/campaign/:campaignSeed', async (req: Request, res: Response) => {
  try {
    const { campaignSeed } = req.params;
    const items = await listCampaignMaps(campaignSeed);
    return res.status(200).json(items);
  } catch (err) {
    const e = err as any;
    console.error('[Maps] list error:', e);
    return res.status(e.status ?? 500).json({ error: e.message, code: e.code ?? 'internal_error' });
  }
});

router.get('/:campaignSeed/:zoneId', async (req: Request, res: Response) => {
  try {
    const { campaignSeed, zoneId } = req.params;
    const map = await loadMap(campaignSeed, zoneId);
    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }
    return res.status(200).json(map);
  } catch (err) {
    const e = err as any;
    console.error('[Maps] load error:', e);
    return res.status(e.status ?? 500).json({ error: e.message, code: e.code ?? 'internal_error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as MapCreateRequest;
    const created = await saveMap(body);
    return res.status(201).json(created);
  } catch (err) {
    const e = err as any;
    const status = e.status ?? 500;
    console.error('[Maps] save error:', e);
    return res.status(status).json({ error: e.message, code: e.code ?? 'internal_error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as MapUpdateRequest;
    const updated = await updateMapById(id, body);
    return res.status(200).json(updated);
  } catch (err) {
    const e = err as any;
    const status = e.status ?? 500;
    console.error('[Maps] update error:', e);
    return res.status(status).json({ error: e.message, code: e.code ?? 'internal_error' });
  }
});

export default router;
