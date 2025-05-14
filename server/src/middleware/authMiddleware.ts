import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

// Add user property to Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT secret from env or default
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      // @ts-ignore - Ignoring type checking for jwt.verify to bypass TypeScript issues
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
}; 