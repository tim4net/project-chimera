import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabaseServiceClient } from '../services/supabaseClient';

export interface AuthenticatedRequest extends Request {
  user: User;
}

const UNAUTHORIZED_RESPONSE = { error: 'Unauthorized' } as const;

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // DEVELOPMENT MODE: Allow mock authentication via X-Mock-User-Id header
    const AUTH_MODE = process.env.AUTH_MODE || 'strict';
    const isProduction = process.env.NODE_ENV === 'production';
    const mockUserId = req.headers['x-mock-user-id'] as string;

    if (AUTH_MODE === 'mock' && !isProduction && mockUserId) {
      console.log('[Auth] ✅ Development mode: Using mock user:', mockUserId);
      (req as AuthenticatedRequest).user = {
        id: mockUserId,
        email: `${mockUserId}@dev.local`,
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    // Validate JWT with Supabase (primary validation)
    const { data, error } = await supabaseServiceClient.auth.getUser(token);

    if (error || !data?.user) {
      console.warn('[Auth] Token validation failed:', error?.message);
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    // Additional JWT claims validation (defense-in-depth)
    try {
      const jwtPayload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      // Check expiration (redundant with getUser(), but adds defense-in-depth)
      if (jwtPayload.exp && jwtPayload.exp < Date.now() / 1000) {
        console.warn('[Auth] Expired token detected for user:', data.user.id);
        res.status(401).json({ error: 'Token expired' });
        return;
      }

      // Optional: Check Authentication Assurance Level (AAL) for MFA
      // Uncomment if MFA is required for certain routes:
      // if (jwtPayload.aal && jwtPayload.aal !== 'aal2') {
      //   console.warn('[Auth] MFA required for user:', data.user.id);
      //   res.status(403).json({ error: 'Multi-factor authentication required' });
      //   return;
      // }

      // Optional: Validate session_id exists (ensures token is from active session)
      if (!jwtPayload.session_id) {
        console.warn('[Auth] Token missing session_id for user:', data.user.id);
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

    } catch (decodeError) {
      // If JWT decode fails, log but continue (getUser() already validated it)
      console.warn('[Auth] JWT decode error (continuing anyway):', decodeError);
    }

    (req as AuthenticatedRequest).user = data.user as User;
    next();
  } catch (error) {
    console.error('[Auth] Unexpected authentication error:', error);
    next(error instanceof Error ? error : new Error('Authentication middleware failed'));
  }
};

export default requireAuth;
