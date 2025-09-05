import { Request, Response } from 'express';
import prisma from '../../../../libs/prisma';
import { sendOtp as sendOtpEmail } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const sendSignupOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validated = req.validatedData;
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
  res: Response,
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
      res.status(404).json({ success: false, message: 'User does not exist' });
      return;
    }

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (!isPassMatch) {
      res.status(401).json({ success: false, message: 'Invalid password' });
      return;
    }

    // TODO: generate JWT / session and return it
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
