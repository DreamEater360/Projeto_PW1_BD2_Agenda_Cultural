import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/apiError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.papel)) {
      throw new ForbiddenError('Acesso negado. Permissão insuficiente.');
    }

    next();
  };
};