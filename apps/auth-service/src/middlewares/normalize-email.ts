import { Request, Response, NextFunction } from 'express';

export const normalizeEmail = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body.email === 'string') {
    req.body.email = req.body.email.toLowerCase();
  }
  if (req.validatedData && typeof req.validatedData.email === 'string') {
    req.validatedData.email = req.validatedData.email.toLowerCase();
  }
  next();
};
