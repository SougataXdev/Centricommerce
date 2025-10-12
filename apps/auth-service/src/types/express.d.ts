import { Request } from 'express';
import type { AuthRole } from '../services/auth-tokens.service';

export type ValidatedData = {
  name: string;
  email: string;
  password: string;
  usertype: 'admin' | 'seller' | 'user';
  phoneNumber?: string;
  country?: string;
  otp?: string;
};

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedData;
      resetEmail?: string;
      user?: {
        id: string;
        role?: AuthRole | string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}
