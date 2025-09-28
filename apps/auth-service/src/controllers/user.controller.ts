import { NextFunction, Request, Response } from 'express';
import prisma from '../../../../libs/prisma';
import { sendOtp as sendOtpEmail } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z as zod } from 'zod';

const SALT_ROUNDS = 12;

export const sendSignupOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validated = req.validatedData;
    console.log('validated data in signup :', validated);
    if (!validated) {
      res.status(400).json({ message: 'Invalid request', success: false });
      return;
    }

    const { name, email } = validated;

    if (!name || !email) {
      res
        .status(400)
        .json({ message: 'Name and email are required', success: false });
      return;
    }

    const isUserExist = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });

    if (isUserExist) {
      res.status(400).json({
        message: 'User already exists',
        success: false,
      });
      return;
    }

    await sendOtpEmail(email, name, 'User-verification-mail');

    res.status(200).json({
      message: 'OTP sent successfully',
      email,
      success: true,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      message: 'Failed to send OTP',
      success: false,
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (existingUser) {
      res.status(400).json({
        message: 'User already exists',
        success: false,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const createdUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: createdUser,
      success: true,
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      message: 'Failed to create user',
      success: false,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { email: user.email, id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      accessToken, // optional for frontend
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = req.user;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('getUserInfo error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const forgotPasswordRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { name: true, email: true },
    });

    if (user) {
      await sendOtpEmail(
        user.email,
        user.name || 'User',
        'User-forget-password-mail'
      );
    }

    res.status(200).json({
      success: true,
      message: 'If the account exists, an OTP has been sent.',
    });
  } catch (error) {
    console.error('Forgot password request error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to process request' });
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { newPassword } = req.body || {};
    const emailFromToken = req.resetEmail;

    const schema = zod.object({
      newPassword: zod
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be at most 100 characters long'),
    });

    const parsed = schema.safeParse({ newPassword });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.message });
      return;
    }

    if (!emailFromToken) {
      res.status(400).json({ success: false, message: 'Invalid reset flow' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email: emailFromToken },
      select: { id: true },
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, SALT_ROUNDS);
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    res.clearCookie('pwd_reset');
    res
      .status(200)
      .json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Forgot password reset error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to reset password' });
  }
};

export const renewAccessToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token missing' });
    }

    let decoded: { id: string; role: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { id: string; role: string };
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired refresh token' });
    }

    if (!decoded || !decoded.id || !decoded.role) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid token payload' });
    }

    let user: { id: string } | null = null;
    if (decoded.role === 'user') {
      user = await prisma.users.findUnique({
        where: { id: decoded.id },
        select: { id: true },
      });
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Unsupported role' });
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }

    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', accessToken, {
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ success: true, message: 'Access token renewed successfully' });
  } catch (error) {
    console.error('renewAccessToken error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to renew access token' });
  }
};
