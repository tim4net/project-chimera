import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabaseServiceClient } from '../services/supabaseClient';

export interface AuthenticatedRequest extends Request {
  user: User;
}

const UNAUTHORIZED_RESPONSE = { error: 'Unauthorized' } as const;

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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

    const { data, error } = await supabaseServiceClient.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    req.user = data.user as User;
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Authentication middleware failed'));
  }
};

export default requireAuth;
