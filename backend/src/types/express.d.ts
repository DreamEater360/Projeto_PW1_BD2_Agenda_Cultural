import { ITokenPayload } from './ITokenPayload'

declare global {
  namespace Express {
    export interface Request {
      user?: ITokenPayload
    }
  }
}