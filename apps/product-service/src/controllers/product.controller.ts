import { Request, Response } from 'express';
import prisma from '../../../auth-service/dist/libs/prisma/index';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.siteConfig.findFirst();

  if (!categories) {
    return res.status(404).json({ message: 'Categories not found' });
  }

  return res.status(200).json({
    categories: categories.categories,
    subCategories: categories.subCategories,
  });
};

export const createDiscountCode = async (req: Request, res: Response) => {
  const { code, discountType, discountValue, sellerId, publicName } = req.body;

  if (!code || !discountType || !discountValue || !sellerId || !publicName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const isAlreadyExists = await prisma.discountCodes.findUnique({
    where: { code },
  });

  if (isAlreadyExists) {
    return res.status(400).json({ message: 'Discount code already exists' });
  }

  try {
    const newDiscountCode = await prisma.discountCodes.create({
      data: {
        code,
        publicName,
        discountType,
        discountValue,
        sellerId,
      },
    });

    return res.status(201).json(newDiscountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDiscountCodes = async (req: any, res: Response) => {
  const sellerId  = req.seller.id;

  if (!sellerId) {
    return res.status(400).json({ message: 'Seller ID is required' });
  }

  try {
    const discountCodes = await prisma.discountCodes.findMany({
      where: {
        sellerId: String(sellerId),
      },
    });

    return res.status(200).json(discountCodes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDiscountCode = async (req: any, res: Response) => {
  const { id } = req.params;
  const sellerId = req.seller?.id;

  if (!sellerId) {
    return res.status(400).json({ message: 'Seller ID is required' });
  }

  if (!id) {
    return res.status(400).json({ message: 'Discount code ID is required' });
  }

  const discountCode = await prisma.discountCodes.findUnique({
    where: { id },
    select: {
      sellerId: true,
    },
  });

  if (!discountCode || discountCode.sellerId !== String(sellerId)) {
    return res.status(404).json({ message: 'Discount code not found' });
  }

  try {
    const deletedDiscountCode = await prisma.discountCodes.delete({
      where: { id },
    });

    return res.status(200).json(deletedDiscountCode);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
