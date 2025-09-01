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
  if (await redis.get(`otp_lock:${email}`)) {
    return next(new ValidationError('Account is locked'));
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(new ValidationError('Too many request ! try again later'));
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(new ValidationError('wait for 1 minutes to generate new otp'));
  }
};


export const recordOtpAttempt = async(email:string , next : NextFunction)=>{
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");
    if(otpRequests >= 2){
        await redis.set(`spam_lock:${email}` , "locked" , "EX" , 3600);
    }

    await redis.set(otpRequestKey , otpRequests+1 , "EX" , 3600 )
}

export const sendOtp = async (
  email: string,
  name: String,
  template: string
) => {
  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  await sendEmail(email, 'verify your email', template, {
    name: name,
    otp: generatedOtp,
  });
  await redis.set(`otp:${email}`, generatedOtp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};



