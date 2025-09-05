import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../../libs/prisma';
import {
  validateOtpEligibility,
  recordOtpAttempt,
  sendOtp,
} from '../../helpers/auth.helper';

export const issueAndSendOtp = async (
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

    console.log('otp sent successfully this is from {issueAndSendOtp} ');
    next();
  } catch (error) {
    console.error('otp issuing error', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
