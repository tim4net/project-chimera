import { Router, Request, Response } from 'express';
import { applyMigrations, checkMigrationsApplied } from '../services/migrationService';

const router = Router();

/**
 * POST /api/admin/migrations/apply
 * Apply pending database migrations
 * This endpoint should only be accessible in development or with proper auth
 */
router.post('/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Admin] Applying database migrations...');
    const results = await applyMigrations();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: failed === 0,
      results,
      summary: {
        successful,
        failed,
        total: results.length
      }
    });
  } catch (err: any) {
    console.error('[Admin] Migration error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/admin/migrations/status
 * Check if migrations have been applied
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await checkMigrationsApplied();

    const allApplied = Object.values(status).every(v => v === true);

    res.json({
      applied: allApplied,
      details: status
    });
  } catch (err: any) {
    console.error('[Admin] Status check error:', err);
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
