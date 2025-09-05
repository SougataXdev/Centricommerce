import { Request, Response, NextFunction } from 'express';
import redis from '../../../../../libs/redis';
import { ValidationError } from '../../../../../libs/middlewares';


/**
 * Middleware to check if the user is eligible to request an OTP.
 * Performs various checks like account lock, spam lock, and cooldown.
 */
export const otpEligibilityGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = (req.validatedData?.email || req.body?.email || '').toLowerCase();
    if (!email) return next(new ValidationError('Email is required'));

    // Check if account is locked
    const otpLock = await redis.get(`otp_lock:${email}`);
    if (otpLock) return next(new ValidationError('Account is locked'));

    // Check if account is spam locked
    const spamLock = await redis.get(`otp_spam_lock:${email}`);
    if (spamLock) return next(new ValidationError('Too many requests! Try again later'));

    // Check if in cooldown period
    const cooldown = await redis.get(`otp_cooldown:${email}`);
    if (cooldown) return next(new ValidationError('Wait for 1 minute to generate new OTP'));

    next();
  } catch (error) {
    console.error('otpEligibilityGuard error:', error);
    next(new ValidationError('Service temporarily unavailable'));
  }
};

/**
 * Middleware to record OTP requests and enforce spam protection.
 * Increments request count and locks account if too many requests.
 */
export const otpRequestRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = (req.validatedData?.email || req.body?.email || '').toLowerCase();
    if (!email) return next(new ValidationError('Email is required'));

    // Get current OTP request count
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

    // If requests exceed limit, lock the account
    if (otpRequests >= 2) {
      await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    }

    // Increment and set request count with expiration
    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
    next();
  } catch (error) {
    console.error('otpRequestRecord error:', error);
    next(new ValidationError('Service temporarily unavailable'));
  }
};
