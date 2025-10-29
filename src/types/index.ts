import { Request } from 'express';
import { User } from '@prisma/client';

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterUserPayload {
  username?: string;
  name?: string;
  email: string;
  role?: string;
  role_id?: string;
  status: string;
  phone?: string;
  department?: string;
  location?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
