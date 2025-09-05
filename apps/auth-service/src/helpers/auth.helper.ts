import { z as zod } from 'zod';
import { ValidationError } from '../../../../libs/middlewares';
import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';
import redis from '../../../../libs/redis';
import { sendEmail } from './mail';


export const validateSignupData = (userType: 'seller' | 'user') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = zod
      .object({
        name: zod
          .string()
          .min(3, 'Name must be at least 3 characters long')
          .max(100, 'Name must be at most 100 characters long'),
        email: zod.string().email('Please provide a valid email address'),
        password: zod
          .string()
          .min(6, 'Password must be at least 6 characters long')
          .max(100, 'Password must be at most 100 characters long'),
        usertype: zod.enum(['admin', 'seller', 'user'], {
          message: 'Usertype must be one of: admin, seller, user',
        }),
        phoneNumber: zod.string().optional(),
        country: zod.string().optional(),
      })
      .refine(
        (data) =>
          data.usertype !== 'seller' || (!!data.phoneNumber && !!data.country),
        {
          message: 'Phone number and country are required for sellers',
          path: ['phoneNumber'],
        }
      );

    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(result.error.message, result.error.issues);
    }
    req.validatedData = result.data;
    next();
  };
};

export const validateOtpEligibility = async (
  email: string,
  next: NextFunction
) => {
  try {
    const otpLock = await redis.get(`otp_lock:${email}`);
    if (otpLock) {
      return next(new ValidationError('Account is locked'));
    }

    const spamLock = await redis.get(`otp_spam_lock:${email}`);
    if (spamLock) {
      return next(new ValidationError('Too many requests! Try again later'));
    }

    const cooldown = await redis.get(`otp_cooldown:${email}`);
    if (cooldown) {
      return next(new ValidationError('Wait for 1 minute to generate new OTP'));
    }
  } catch (error) {
    console.error('Redis error in validateOtpEligibility:', error);
    return next(new ValidationError('Service temporarily unavailable'));
  }
};

export const recordOtpAttempt = async (email: string, next: NextFunction) => {
  try {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

    if (otpRequests >= 2) {
      await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
  } catch (error) {
    console.error('Redis error in recordOtpAttempt:', error);
    return next(new ValidationError('Service temporarily unavailable'));
  }
};

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
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

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


