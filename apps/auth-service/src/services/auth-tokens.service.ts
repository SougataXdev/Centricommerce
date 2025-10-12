import { Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRole = 'user' | 'seller' | 'admin';

export interface AuthTokenPayload {
  id: string;
  role: AuthRole;
  email?: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const ACCESS_TOKEN_MAX_AGE = ACCESS_TOKEN_TTL_SECONDS * 1000;
const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_TTL_SECONDS * 1000;

const isProduction = process.env.NODE_ENV === 'production';

export const generateAccessToken = (payload: AuthTokenPayload): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not configured');
  }

  const { email: _email, ...rest } = payload;
  console.log("rest:",rest);

  return jwt.sign(rest, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
};

export const generateRefreshToken = (
  payload: Required<AuthTokenPayload>
): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not configured');
  }

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });
};

export const setAuthCookies = (
  res: Response,
  tokens: Partial<AuthTokenPair> & { accessToken: string }
) => {
  res.cookie('accessToken', tokens.accessToken, {
    sameSite: 'strict',
    httpOnly: true,
    secure: isProduction,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  if (tokens.refreshToken) {
    res.cookie('refreshToken', tokens.refreshToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: isProduction,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
};

export const issueAuthTokens = (
  res: Response,
  payload: Required<AuthTokenPayload>
): AuthTokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  setAuthCookies(res, { accessToken, refreshToken });

  return { accessToken, refreshToken };
};
