import { Request } from 'express';

export type ValidatedData = {
  name: string;
  email: string;
  password: string;
  usertype: 'admin' | 'seller' | 'user';
  phoneNumber?: string;
  country?: string;
};

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedData;
      resetEmail?: string;
      user?: {
        id: string;
        role?: 'user' | 'admin' | 'seller' | string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}
