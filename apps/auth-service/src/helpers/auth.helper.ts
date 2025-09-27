import { ValidationError } from '../../../../libs/middlewares';
import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';
import redis from '../../../../libs/redis';
import { sendEmail } from './mail';

// validateSignupData moved to middleware/validate-signup.ts

export const sendOtp = async (
  email: string,
  name: String,
  template: string
) => {
  try {
    const generatedOtp = crypto.randomInt(100000, 999999).toString();

    await sendEmail(email, 'verify your email', template, {
      name: name,
      otp: generatedOtp,
    });

    await redis.set(`otp:${email}`, generatedOtp, 'EX', 300);
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);

    console.log('otp sent successfully', generatedOtp);
  } catch (error) {
    console.error('Error in sendOtp:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required'));
    }

    const dbOtp = await redis.get(`otp:${email}`);

    if (!dbOtp) {
      return next(new ValidationError('Invalid or expired OTP'));
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || '0'
    );

    if (dbOtp !== otp) {
      if (failedAttempts >= 2) {
        await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
        await redis.del(`otp:${email}`, failedAttemptsKey);
        return next(new ValidationError('Too many failed attempts'));
      }
      await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
      return next(new ValidationError('Invalid OTP'));
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);
    next();
  } catch (error) {
    console.error('OTP verification error:', error);
    return next(new ValidationError('OTP verification failed'));
  }
};

export const forgetPassVerifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required'));
    }

    const dbOtp = await redis.get(`otp:${email}`);

    if (!dbOtp) {
      return next(new ValidationError('Invalid or expired OTP'));
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || '0'
    );

    if (dbOtp !== otp) {
      if (failedAttempts >= 2) {
        await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
        await redis.del(`otp:${email}`, failedAttemptsKey);
        return next(new ValidationError('Too many failed attempts'));
      }
      await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
      return next(new ValidationError('Invalid OTP'));
    }

    // OTP is correct; invalidate OTP and failed attempts
    await redis.del(`otp:${email}`, failedAttemptsKey);

    // Issue a short-lived password reset token (stored as token->email) and set as httpOnly cookie
    const resetToken = crypto.randomBytes(32).toString('hex');
    await redis.set(`password_reset_token:${resetToken}`, email, 'EX', 600);

    res.cookie('pwd_reset', resetToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'OTP verification successful',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return next(new ValidationError('OTP verification failed'));
  }
};

export const verifyResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.pwd_reset as string | undefined;

    if (!token) {
      return next(new ValidationError('Reset token cookie is missing'));
    }

    const email = await redis.get(`password_reset_token:${token}`);
    if (!email) {
      return next(new ValidationError('Invalid or expired reset token'));
    }

    //invalidate right away and attach email to request
    await redis.del(`password_reset_token:${token}`);
    req.resetEmail = email;
    next();
  } catch (error) {
    console.error('Reset token verification error:', error);
    return next(new ValidationError('Reset token verification failed'));
  }
};
