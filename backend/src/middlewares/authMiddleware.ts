import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/apiError';
import { ITokenPayload } from '../types/ITokenPayload';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError('Token não fornecido.');

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as ITokenPayload;
    
    req.user = {
      id: decoded.id,
      papel: decoded.papel
    };

    return next();
  } catch (err) {
    throw new UnauthorizedError('Token inválido.');
  }
};