import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errors/apiError'
import { ZodError } from 'zod'

export const errorMiddleware = (
  error: Error & Partial<ApiError>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ [ERRO]:", error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação nos dados enviados",
      errors: error.issues.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message
      }))
    });
  }

  // Captura erros conhecidos da API (404, 401, 403, etc)
  const statusCode = error.statusCode ?? 500
  const message = error.statusCode ? error.message : 'Erro interno no servidor'
  
  return res.status(statusCode).json({ 
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
  })
}