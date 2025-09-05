import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../../libs/prisma';
import bcrypt from 'bcrypt';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.validatedData!;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const createdUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        usertype: 'user'
      },
      select: {
        id: true,
        name: true,
        email: true,
        usertype: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: "User created successfully",
      user: createdUser,
      success: true
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      message: "Failed to create user",
      success: false
    });
  }
};
