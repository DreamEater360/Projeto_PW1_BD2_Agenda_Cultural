import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errors/apiError'

export const errorMiddleware = (
  error: Error & Partial<ApiError>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se o erro for uma instância da nossa classe ApiError, usamos o status code dela.
  // Caso contrário, é um erro inesperado do servidor (status 500).
  const statusCode = error.statusCode ?? 500
  const message = error.statusCode ? error.message : 'Errouuuuu'
  
  return res.status(statusCode).json({ message })
}