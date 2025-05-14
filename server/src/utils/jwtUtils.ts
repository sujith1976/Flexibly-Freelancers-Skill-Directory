import jwt from 'jsonwebtoken';
import { IUser } from '../models/userModel';

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

export const generateToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email
  };

  // @ts-ignore - Ignoring type checking for jwt.sign to bypass TypeScript issues
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    // @ts-ignore - Ignoring type checking for jwt.verify to bypass TypeScript issues
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
}; 