import { Request, Response, NextFunction } from 'express';
import { z as zod } from 'zod';
import { ValidationError } from '../../../../libs/middlewares';

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
