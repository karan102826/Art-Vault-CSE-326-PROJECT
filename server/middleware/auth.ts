import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'artvault_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'buyer' | 'admin';
    fullName: string;
  };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: 'buyer' | 'admin'; fullName: string };
    const user = db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
  }
}

export function optionalToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: 'buyer' | 'admin'; fullName: string };
      const user = db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        };
      }
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
}
