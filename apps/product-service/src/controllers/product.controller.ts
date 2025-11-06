import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../../../libs/prisma/index';
import { imagekit } from '../../../../libs/imagekit';
import {
  CreateDiscountCodeSchema,
  CreateProductSchema,
} from '../schemas/product.schema';

type SellerPrincipal = {
  id: string;
  role?: string;
};

type SellerRequest = Request & {
  user?: SellerPrincipal;
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

  try {
    const validatedData = CreateDiscountCodeSchema.parse(req.body ?? {});

    const existingCode = await prisma.discountCodes.findFirst({
      where: {
        code: validatedData.code,
        sellerId,
      },
    });

    if (existingCode) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const newDiscountCode = await prisma.discountCodes.create({
      data: {
        code: validatedData.code,
        publicName: validatedData.publicName,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        sellerId,
        usageLimit: validatedData.usageLimit ?? undefined,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
      },
    });

    return res.status(201).json(newDiscountCode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res
        .status(400)
        .json({ message: 'Validation error', errors: fieldErrors });
    }
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

export const uploadImageToImageKit = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const fileName = `product_${Date.now()}`;

    const response = await imagekit.upload({
      file: image,
      fileName: fileName,
      folder: '/products/',
    });

    return res.status(200).json({
      url: response.url,
      id: response.fileId,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: 'Image upload failed', error });
  }
};

export const deleteImageFromImageKit = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'No image ID provided' });
    }

    await imagekit.deleteFile(id);

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Image deletion failed', error });
  }
};

export const createProduct = async (req: SellerRequest, res: Response) => {
  const sellerId = req.user?.id;

  if (!sellerId || req.user?.role !== 'seller') {
    return res.status(403).json({ message: 'Seller authentication required' });
  }

  try {
    // Validate request body with Zod
    const validatedData = CreateProductSchema.parse(req.body ?? {});

    const requestedDiscountCodes = Array.from(
      new Set(validatedData.discountCode ?? [])
    );

    let verifiedDiscountCodes: string[] = [];

    if (requestedDiscountCodes.length > 0) {
      const discountCodes = await prisma.discountCodes.findMany({
        where: {
          sellerId,
          code: {
            in: requestedDiscountCodes,
          },
        },
        select: {
          code: true,
        },
      });

      const foundCodes = new Set(discountCodes.map((code) => code.code));
      const missingCodes = requestedDiscountCodes.filter(
        (code) => !foundCodes.has(code)
      );

      if (missingCodes.length > 0) {
        return res.status(400).json({
          message: 'One or more selected discount codes are invalid',
          invalidCodes: missingCodes,
        });
      }

      verifiedDiscountCodes = [...foundCodes];
    }

    const productImages = validatedData.images ?? [];
    const productImagesJson: Prisma.InputJsonValue = productImages;
    const customSpecificationsJson: Prisma.InputJsonValue =
      validatedData.custom_specifications ?? [];
    const derivedPrimaryImage =
      validatedData.primaryImage?.trim() || productImages[0]?.file_url || null;

    // Check for duplicate slug
    const existingProduct = await prisma.products.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Slug must be unique' });
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      return res.status(404).json({ message: 'Seller shop not found' });
    }

    const newProduct = await prisma.products.create({
      data: {
        productTitle: validatedData.productTitle,
        shortDescription: validatedData.shortDescription,
        tags: validatedData.tags,
        warranty: validatedData.warranty,
        brand: validatedData.brand,
        slug: validatedData.slug,
        videoUrl: validatedData.videoUrl || undefined,
        category: validatedData.category,
        subCategory: validatedData.subCategory,
        regularPrice: validatedData.regularPrice,
        salePrice: validatedData.salePrice,
        stock: validatedData.stock,
        cashOnDelivery: validatedData.cashOnDelivery,
        sizes: validatedData.sizes,
        colors: validatedData.colors,
        custom_specifications: customSpecificationsJson,
        images: productImagesJson,
        primaryImage: derivedPrimaryImage ?? undefined,
        discountCodes: verifiedDiscountCodes,
        status: validatedData.status,
        rating: 0,
        totalReviews: 0,
        isDeleted: false,
        sellerId,
        shopId: shop.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res
        .status(400)
        .json({ message: 'Validation error', errors: fieldErrors });
    }
    console.error('Error creating product:', {
      message: error?.message,
      code: error?.code,
      details: error?.meta,
    });
    return res.status(500).json({
      message: 'Internal server error',
      error: error?.message || 'Unknown error',
    });
  }
};
