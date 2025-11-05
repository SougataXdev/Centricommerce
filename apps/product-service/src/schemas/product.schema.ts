import { z } from 'zod';

const ProductImageSchema = z.object({
  fileId: z.string().trim().min(1, 'Image file id is required'),
  file_url: z.string().trim().min(1, 'Image url is required'),
});

export const CreateDiscountCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'Code is required'),
  publicName: z
    .string()
    .trim()
    .min(1, 'Public name is required'),
  discountType: z
    .enum(['percentage', 'fixed'])
    .transform(val => val.toLowerCase()),
  discountValue: z
    .number()
    .positive('Discount value must be greater than zero'),
  usageLimit: z
    .number()
    .int('Usage limit must be a whole number')
    .nonnegative('Usage limit must be non-negative')
    .optional()
    .nullable(),
  startDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform(val => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform(val => (val ? new Date(val) : undefined)),
}).superRefine((data, ctx) => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discountValue'],
      message: 'Percentage discounts cannot exceed 100%',
    });
  }

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be after the start date',
    });
  }
});

export type CreateDiscountCodeInput = z.infer<typeof CreateDiscountCodeSchema>;

// Product Schema
export const CreateProductSchema = z.object({
  productTitle: z
    .string()
    .trim()
    .min(1, 'Product title is required'),
  shortDescription: z
    .string()
    .trim()
    .min(1, 'Short description is required'),
  tags: z
    .union([
      z.array(z.string().trim()),
      z.string().trim().transform(val => 
        val.split(',').map(tag => tag.trim()).filter(Boolean)
      ),
    ])
    .default([]),
  warranty: z
    .string()
    .trim()
    .optional()
    .default(''),
  brand: z
    .string()
    .trim()
    .optional()
    .nullable(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required'),
  videoUrl: z
    .string()
    .trim()
    .refine(val => val === '' || z.string().url().safeParse(val).success, 'Invalid URL')
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required'),
  subCategory: z
    .string()
    .trim()
    .min(1, 'Sub-category is required'),
  regularPrice: z
    .union([z.number(), z.string()])
    .transform(val => Number(val))
    .refine(val => val > 0, 'Regular price must be a positive number'),
  salePrice: z
    .union([z.number(), z.string()])
    .transform(val => Number(val))
    .refine(val => val > 0, 'Sale price must be a positive number'),
  stock: z
    .union([z.number(), z.string()])
    .transform(val => Number(val))
    .refine(val => Number.isInteger(val), 'Stock must be an integer')
    .refine(val => val >= 0, 'Stock must be non-negative'),
  cashOnDelivery: z
    .boolean()
    .default(true),
  sizes: z
    .array(z.string().trim())
    .default([]),
  colors: z
    .array(z.any())
    .default([]),
  custom_specifications: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Specification name is required'),
        value: z.string().trim().min(1, 'Specification value is required'),
      })
    )
    .optional()
    .transform(specs => specs ?? []),
  images: z
    .array(ProductImageSchema)
    .max(8, 'You can upload up to 8 images')
    .optional()
    .transform(images => images ?? []),
  primaryImage: z
    .string()
    .optional()
    .nullable(),
  discountCode: z
    .union([
      z.array(z.string()),
      z.string(),
    ])
    .optional()
    .transform(val => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(String);
      return [String(val)];
    }),
  status: z
    .enum(['active', 'pending', 'draft'])
    .default('active'),
}).superRefine((data, ctx) => {
  if (data.salePrice > data.regularPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['salePrice'],
      message: 'Sale price cannot exceed regular price',
    });
  }
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type ProductImageInput = z.infer<typeof ProductImageSchema>;
