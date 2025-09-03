import { Request, Response, NextFunction } from 'express';
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
): Promise<void> => {
  try {
    const { name, email } = req.validatedData!;

    const isUserExist = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (isUserExist) {
      res.status(400).json({
        message: 'User already exists',
      });
      return;
    }

    await validateOtpEligibility(email, next);
    await recordOtpAttempt(email, next);

    await sendOtp(email, name, 'User-verification-mail');

    res.status(200).json({
      message: 'OTP sent successfully',
      email: email,
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
