import { Request, Response } from 'express';
import prisma from '../../../../libs/prisma';
import { sendOtp } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';
import { z as zod } from 'zod';
import { issueAuthTokens } from '../services/auth-tokens.service';

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

    await sendOtp(email, name, 'User-verification-mail');

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

    const tokens = issueAuthTokens(res, {
      id: user.id,
      email: user.email,
      role: 'user',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      accessToken: tokens.accessToken,
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
      await sendOtp(
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
