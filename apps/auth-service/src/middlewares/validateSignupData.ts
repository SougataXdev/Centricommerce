import { Request, Response, NextFunction } from 'express';
import { z as zod } from 'zod';
import { ValidationError } from '../../../../libs/middlewares';

export const validateSignupData = (userType: 'seller' | 'user' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Base schema
    let schema = zod.object({
      name: zod
        .string()
        .min(3, 'Name must be at least 3 characters long')
        .max(100, 'Name must be at most 100 characters long'),
      email: zod.string().email('Please provide a valid email address'),
      password: zod
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be at most 100 characters long'),
      usertype: zod
        .enum(['seller', 'user', 'admin'])
        .refine((val) => val === userType, {
          message: `Usertype must be '${userType}'`,
        }),
      phoneNumber: zod.string().optional(),
      country: zod.string().optional(),
    });

    // Extra validation for seller
    if (userType === 'seller') {
      schema = schema.refine(
        (data) => !!data.phoneNumber && !!data.country,
        {
          message: 'Phone number and country are required for sellers',
          path: ['phoneNumber'],
        }
      );
    }

    const result = schema.safeParse({
      ...req.body,
      usertype: userType, 
    });

    if (!result.success) {
      console.log('user data verifier middleware triggered');
      throw new ValidationError(result.error.message, result.error.issues);
    }

    next();
  };
};
