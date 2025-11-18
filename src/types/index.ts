import { Request } from 'express';
import { User } from '@prisma/client';

export interface RegisterUserPayload {
  username: string;
  email: string;
  role?: string;
  role_id: string;
  status: string;
  phone?: string;
  department_id?: number;
  location?: string;
  password?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}

export interface JwtPayload {
  userId: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}
