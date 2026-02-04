import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errors/apiError'

export const errorMiddleware = (
  error: Error & Partial<ApiError>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // LOG NO TERMINAL PARA VOCÊ VER O QUE ESTÁ ACONTECENDO
  console.error("❌ [ERRO NO SERVIDOR]:", error);

  const statusCode = error.statusCode ?? 500
  const message = error.statusCode ? error.message : 'Erro interno no servidor'
  
  return res.status(statusCode).json({ 
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
  })
}