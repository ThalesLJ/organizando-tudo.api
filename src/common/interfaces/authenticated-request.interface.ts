import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  username: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
