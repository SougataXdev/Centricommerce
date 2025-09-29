import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../../../libs/prisma';

interface JwtPayload {
  id: string;
  role: string;
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      console.log("token is auth middleware " , token

      )

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Missing or invalid token' });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!decoded?.id) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token payload' });
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        usertype: true,
      },
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User does not exist' });
    }

    req.user = user as any;

    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return res
      .status(401)
      .json({ success: false, message: 'Token expired or invalid' });
  }
};
