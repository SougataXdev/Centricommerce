import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../../libs/prisma';
import {
  validateOtpEligibility,
  recordOtpAttempt,
  sendOtp,
} from '../helpers/auth.helper';

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, usertype } = req.validatedData!;

    const isUserExist = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (isUserExist) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    await validateOtpEligibility(email, next);

    await recordOtpAttempt(email, next);
    await sendOtp(email, name, 'User activation Mail');

    res.status(200).json({
      message: 'OTP sent sucessfully',
    });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        usertype,
      },
      select: {
        id: true,
        name: true,
        email: true,
        usertype: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
