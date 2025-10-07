import { Request, Response } from 'express';
import type { ValidatedData } from '../types/express';
import prisma from '../../../../libs/prisma';
import { ValidationError } from '../../../../libs/middlewares';
import { sendOtp } from '../helpers/auth.helper';
import bcrypt from 'bcrypt';

export const sendSellerSignUpOtp = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.validatedData as ValidatedData;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: 'all fields are required', success: false });
    }
    const isExistingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (isExistingUser) {
      throw new ValidationError('seller already exists on this email');
    }

    await sendOtp(email, name, 'Seller-verification-mail');

    return res.status(200).json({
      message: 'OTP sent successfully',
      email,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'internal server error', success: false });
  }
};

export const createSeller = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, country, password } = req.body;

    const isExistingUser = await prisma.sellers.findUnique({
      where: { email },
    });

    if (isExistingUser) {
      return res.status(409).json({
        success: false,
        message: "Seller with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 20);


    const createdSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        phoneNumber,
        country,
      },
      select: {
        name: true,
        email: true,
        country: true,
        phoneNumber: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller: createdSeller,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
