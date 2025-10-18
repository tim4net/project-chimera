import type { NextFunction, Request, Response } from 'express';

export const requireAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

export default requireAuth;
