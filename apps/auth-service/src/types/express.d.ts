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
      resetEmail?: string;
      user?: {
        id: string;
        role?: 'user' | 'admin' | 'seller' | string;
        email?: string;
        // Allow additional Prisma user fields without importing types here
        [key: string]: any;
      };
    }
  }
}
