import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRole } from '../services/auth-tokens.service';
import { findAccountByRole } from '../services/account.service';

interface JwtPayload {
  id: string;
  role: AuthRole;
  email?: string;
}

type AuthOptions = {
  roles?: AuthRole[];
};

const createAuthGuard = (options: AuthOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        console.log("token" , token); 

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: 'Missing or invalid token' });
      }

      if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not configured');
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      ) as JwtPayload;

      if (!decoded?.id || !decoded.role) {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid token payload' });
      }

      if (options.roles && !options.roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ success: false, message: 'Insufficient permissions' });
      }

      const principal = await findAccountByRole(decoded.role, decoded.id);

      if (!principal) {
        return res
          .status(401)
          .json({ success: false, message: 'Account does not exist' });
      }

      req.user = {
        ...principal,
        role: decoded.role,
      } as typeof req.user;

      return next();
    } catch (error) {
      console.error('Auth error:', error);
      return res
        .status(401)
        .json({ success: false, message: 'Token expired or invalid' });
    }
  };

export const isAuthenticated = createAuthGuard();
export const isSellerAuthenticated = createAuthGuard({ roles: ['seller'] });
export const isUserAuthenticated = createAuthGuard({ roles: ['user'] });
