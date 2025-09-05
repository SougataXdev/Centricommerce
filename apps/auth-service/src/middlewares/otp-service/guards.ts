import { Request, Response, NextFunction } from 'express';
import redis from '../../../../../libs/redis';
import { ValidationError } from '../../../../../libs/middlewares';

export const otpEligibilityGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = (req.validatedData?.email || req.body?.email || '').toLowerCase();
    if (!email) return next(new ValidationError('Email is required'));

    const otpLock = await redis.get(`otp_lock:${email}`);
    if (otpLock) return next(new ValidationError('Account is locked'));

    const spamLock = await redis.get(`otp_spam_lock:${email}`);
    if (spamLock) return next(new ValidationError('Too many requests! Try again later'));

    const cooldown = await redis.get(`otp_cooldown:${email}`);
    if (cooldown) return next(new ValidationError('Wait for 1 minute to generate new OTP'));

    next();
  } catch (error) {
    console.error('otpEligibilityGuard error:', error);
    next(new ValidationError('Service temporarily unavailable'));
  }
};


export const otpRequestRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = (req.validatedData?.email || req.body?.email || '').toLowerCase();
    if (!email) return next(new ValidationError('Email is required'));

    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

    if (otpRequests >= 2) {
      await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
    next();
  } catch (error) {
    console.error('otpRequestRecord error:', error);
    next(new ValidationError('Service temporarily unavailable'));
  }
};
