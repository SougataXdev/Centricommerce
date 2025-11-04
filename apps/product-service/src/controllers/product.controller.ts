import { Request, Response } from 'express';
import prisma from '../../../../libs/prisma';
import { imagekit } from '../../../../libs/imagekit';

type SellerPrincipal = {
  id: string;
  role?: string;
};

type SellerRequest = Request & {
  user?: SellerPrincipal;
};

const parseOptionalDate = (value?: unknown) => {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

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

export const createDiscountCode = async (req: SellerRequest, res: Response) => {
  const sellerId = req.user?.id;
  if (!sellerId || req.user?.role !== 'seller') {
    return res.status(403).json({ message: 'Seller authentication required' });
  }

  const {
    code,
    discountType,
    discountValue,
    publicName,
    usageLimit,
    startDate,
    endDate,
  } = req.body ?? {};

  const normalizedCode = String(code ?? '')
    .trim()
    .toUpperCase();
  const normalizedType = String(discountType ?? '')
    .trim()
    .toLowerCase();
  const normalizedName = String(publicName ?? '').trim();
  const numericDiscountValue = Number(discountValue);
  const numericUsageLimit =
    usageLimit === undefined || usageLimit === null || usageLimit === ''
      ? null
      : Number(usageLimit);
  const parsedStartDate = parseOptionalDate(startDate);
  const parsedEndDate = parseOptionalDate(endDate);

  if (!normalizedCode || !normalizedType || !normalizedName) {
    return res
      .status(400)
      .json({ message: 'Code, name and type are required' });
  }

  if (!Number.isFinite(numericDiscountValue) || numericDiscountValue <= 0) {
    return res
      .status(400)
      .json({ message: 'Discount value must be greater than zero' });
  }

  if (normalizedType === 'percentage' && numericDiscountValue > 100) {
    return res
      .status(400)
      .json({ message: 'Percentage discounts cannot exceed 100%' });
  }

  if (normalizedType !== 'percentage' && normalizedType !== 'fixed') {
    return res.status(400).json({ message: 'Unsupported discount type' });
  }

  if (numericUsageLimit !== null) {
    if (!Number.isInteger(numericUsageLimit) || numericUsageLimit < 0) {
      return res
        .status(400)
        .json({ message: 'Usage limit must be a positive whole number' });
    }
  }

  if (startDate && !parsedStartDate) {
    return res.status(400).json({ message: 'Invalid start date' });
  }

  if (endDate && !parsedEndDate) {
    return res.status(400).json({ message: 'Invalid end date' });
  }

  if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
    return res
      .status(400)
      .json({ message: 'End date must be after the start date' });
  }

  const existingCode = await prisma.discountCodes.findFirst({
    where: {
      code: normalizedCode,
      sellerId,
    },
  });

  if (existingCode) {
    return res.status(400).json({ message: 'Discount code already exists' });
  }

  try {
    const newDiscountCode = await prisma.discountCodes.create({
      data: {
        code: normalizedCode,
        publicName: normalizedName,
        discountType: normalizedType,
        discountValue: numericDiscountValue,
        sellerId,
        usageLimit: numericUsageLimit ?? undefined,
        startDate: parsedStartDate ?? undefined,
        endDate: parsedEndDate ?? undefined,
      },
    });

    return res.status(201).json(newDiscountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDiscountCodes = async (req: SellerRequest, res: Response) => {
  const sellerId = req.user?.id;

  if (!sellerId) {
    return res.status(403).json({ message: 'Seller authentication required' });
  }

  try {
    const discountCodes = await prisma.discountCodes.findMany({
      where: {
        sellerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(discountCodes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDiscountCode = async (req: SellerRequest, res: Response) => {
  const { id } = req.params;
  const sellerId = req.user?.id;

  if (!sellerId) {
    return res.status(403).json({ message: 'Seller authentication required' });
  }

  if (!id) {
    return res.status(400).json({ message: 'Discount code ID is required' });
  }

  try {
    const discountCode = await prisma.discountCodes.findUnique({
      where: { id },
      select: {
        sellerId: true,
      },
    });

    if (!discountCode || discountCode.sellerId !== sellerId) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    await prisma.discountCodes.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const uploadImageToImageKit = async ( req:Request , res :Response)=>{
  try {
    const { image } = req.body;
    console.log("image in the contoller ",image);
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const fileName = `product_${Date.now()}`;

    const response = await imagekit.upload({
      file: image,
      fileName: fileName,
      folder: "/products/"
    });

    res.status(200).json({
      url: response.url,
      id: response.fileId
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error });
  }
};


export const deleteImageFromImageKit = async(req:Request , res:Response)=>{
  try {
    const { id } = req.params;

    if(!id){
      return res.status(400).json({message : 'No image ID provided'});
    } 

    await imagekit.deleteFile(id);

    res.status(200).json({message : 'Image deleted successfully'});

  } catch (error) {
    res.status(500).json({message : 'Image deletion failed', error});
  }
}