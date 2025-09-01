import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      validatedData?: {
        name: string;
        email: string;
        password: string;
        usertype: 'admin' | 'seller' | 'user';
        phoneNumber?: string;
        country?: string;
      };
    }
  }
}
