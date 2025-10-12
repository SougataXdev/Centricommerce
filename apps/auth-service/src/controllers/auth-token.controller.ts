import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  AuthRole,
  generateAccessToken,
  setAuthCookies,
} from '../services/auth-tokens.service';
import { findAccountByRole } from '../services/account.service';

interface RefreshPayload {
  id: string;
  role: AuthRole;
  email?: string;
}

export const renewAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token missing' });
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not configured');
    }

    let decoded: RefreshPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as RefreshPayload;
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired refresh token' });
    }

    if (!decoded?.id || !decoded.role) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid token payload' });
    }

    const principal = await findAccountByRole(decoded.role, decoded.id);

    if (!principal) {
      return res
        .status(401)
        .json({ success: false, message: 'Account not found' });
    }

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    setAuthCookies(res, { accessToken });

    return res.status(200).json({
      success: true,
      message: 'Access token renewed successfully',
      role: decoded.role,
    });
  } catch (error) {
    console.error('renewAccessToken error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to renew access token' });
  }
};
