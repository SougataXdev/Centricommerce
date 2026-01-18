'use client';

import ImageUploader from '@/components/image-uploader';
import ImageEnhancementModal from '@/components/AI-Model';
import ColorSelector from '@/components/color-selector';
import SizeSelector from '@/components/size-selector';
import CustomSpecifications from '@/components/custom-specifications';
import axiosInstance from '@/libs/axiosInterceptor';
import {
  validateSlug,
  validateVideoUrl,
  validatePrice,
} from '@/utils/validators';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

interface ProductFormData {
  productTitle: string;
  shortDescription: string;
  tags: string;
  warranty: string;
  slug: string;
  brand: string;
  category: string;
  subCategory: string;
  colors: string[];
  images: (File | null)[];
  custom_specifications: Array<{ name: string; value: string }>;
  cashOnDelivery: string;
  videoUrl: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  sizes: string[];
  discountCodes: string;
}

const DRAFT_STORAGE_KEY = 'seller-product-create-draft';

const createDefaultValues = (): ProductFormData => ({
  productTitle: '',
  shortDescription: '',
  tags: '',
  warranty: '',
  slug: '',
  brand: '',
  category: '',
  subCategory: '',
  colors: [],
  images: [],
  custom_specifications: [],
  cashOnDelivery: 'yes',
  videoUrl: '',
  regularPrice: '',
  salePrice: '',
  stock: '',
  sizes: [],
  discountCodes: '',
});

const ProductCreatePage = () => {
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [enhancedImages, setEnhancedImages] = useState<Record<number, string>>(
    {}
  );
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<Array<File | null>>([null]);
  const [uploadedImageData, setUploadedImageData] = useState<Array<{ fileId: string; file_url: string } | null>>([null]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState<boolean>(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    trigger,
    reset,
    getValues,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<ProductFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: createDefaultValues(),
  });

  const {
    data: discountCodes,
    isLoading,
    isError: discountFetchingError,
  } = useQuery({
    queryKey: ['discountCodes'],
    queryFn: async () => {
      try {
  const res = await axiosInstance.get('/products/api/discountcodes');
        return res.data;
      } catch (error) {
        console.error('Error fetching discount codes:', error);
      }
    },
  });

  const discountCodeOptions = useMemo(() => {
    if (!Array.isArray(discountCodes)) {
      return [];
    }
    return discountCodes;
  }, [discountCodes]);

  const {
    data,
    isLoading: isCategoryLoading,
    isError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/products/api/get-categories');
        return res.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const categories: string[] = data?.categories || [];
  const subCategories: Record<string, string[]> = data?.subCategories || {};

  const selectedCategory = watch('category');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!storedDraft) {
      return;
    }
    try {
      const parsedDraft = JSON.parse(storedDraft);
      const { savedAt, ...rest } = parsedDraft;
      reset({
        ...createDefaultValues(),
        ...rest,
        colors: Array.isArray(rest.colors) ? rest.colors : [],
        sizes: Array.isArray(rest.sizes) ? rest.sizes : [],
        custom_specifications: Array.isArray(rest.custom_specifications)
          ? rest.custom_specifications
          : [],
        images: [],
      });
      setImages([null]);
      setDraftSavedAt(savedAt ?? null);
      setIsChanged(false);
    } catch (error) {
      console.error('Error loading saved draft:', error);
    }
  }, [reset]);

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return subCategories?.[selectedCategory] || [];
  }, [selectedCategory, subCategories]);

  const regularPriceValue = watch('regularPrice');
  const hasUnsavedChanges = isDirty || isChanged;

  const formattedDraftSavedTime = useMemo(() => {
    if (!draftSavedAt) {
      return null;
    }
    const date = new Date(draftSavedAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  }, [draftSavedAt]);

  const createProductMutation = useMutation({
    mutationFn: async (transformedData: any) => {
      const res = await axiosInstance.post('/products/api/create-product', transformedData);
      return res.data;
    },
    onSuccess: () => {
      // Reset form
      reset(createDefaultValues());
      setImages([null]);
      setUploadedImageData([null]);
      setEnhancedImages({});
      setIsChanged(false);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      
      alert('Product created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create product';
      alert(`Error: ${errorMessage}`);
    },
  });

  const onsubmit = async (formData: ProductFormData) => {
    const images = uploadedImageData
      .filter((img) => img !== null && img.file_url)
      .map((img) => ({
        fileId: img!.fileId,
        file_url: img!.file_url,
      }));

    const transformedData = {
      productTitle: formData.productTitle,
      shortDescription: formData.shortDescription,
      tags: formData.tags,
      warranty: formData.warranty,
      slug: formData.slug,
      brand: formData.brand,
      category: formData.category,
      subCategory: formData.subCategory,
      colors: formData.colors,
      images: images, 
      custom_specifications: formData.custom_specifications,
      cashOnDelivery: formData.cashOnDelivery === 'yes', 
      videoUrl: formData.videoUrl || '', 
      regularPrice: Number(formData.regularPrice),
      salePrice: Number(formData.salePrice),
      stock: Number(formData.stock),
      sizes: formData.sizes,
      discountCode: formData.discountCodes || undefined, 
      primaryImage: enhancedImages[0] || undefined, 
    };

    await createProductMutation.mutateAsync(transformedData);
  };

  type UploadedImageData = {
    url: string;
    id: string;
  };

  const handleImageChange = (
    file: File | null,
    uploadedData: UploadedImageData | null,
    index: number
  ) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = file;

      const hasEmptySlot = updated.some((image) => image === null);
      if (!hasEmptySlot && updated.length < 8) {
        updated.push(null);
      }

      setValue('images', updated);
      return updated;
    });

    setUploadedImageData((prev) => {
      const updated = [...prev];
      if (uploadedData) {
        updated[index] = {
          fileId: uploadedData.id,
          file_url: uploadedData.url,
        };
      } else {
        updated[index] = null;
      }
      return updated;
    });

    setIsChanged(true);
  };

  const handleRemoveImage = (imageId: string, index: number) => {
    setImages((prev) => {
      let updated = [...prev];

      if (index === -1) {
        updated[0] = null;
      } else {
        updated.splice(index, 1);
      }

      if (!updated.length) {
        updated = [null];
      }

      if (updated.length < 8 && !updated.includes(null)) {
        updated.push(null);
      }

      setValue('images', updated);
      return updated;
    });

    setUploadedImageData((prev) => {
      let updated = [...prev];
      if (index === -1) {
        updated[0] = null;
      } else {
        updated.splice(index, 1);
      }
      if (!updated.length) {
        updated = [null];
      }
      return updated;
    });
    setIsChanged(true);
  };

  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  useEffect(() => {
    trigger('salePrice');
  }, [regularPriceValue, trigger]);

  const handleSaveDraft = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const currentValues = getValues();
    const { images: imageFiles, ...persistableValues } = currentValues;
    const savedAt = new Date().toISOString();
    const payload = {
      ...createDefaultValues(),
      ...persistableValues,
      colors: persistableValues.colors ?? [],
      sizes: persistableValues.sizes ?? [],
      custom_specifications: persistableValues.custom_specifications ?? [],
      savedAt,
    };

    setSavingDraft(true);
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setDraftSavedAt(savedAt);
      reset({
        ...currentValues,
        images: imageFiles,
      });
      setImages(imageFiles && imageFiles.length ? imageFiles : [null]);
      setValue('images', imageFiles && imageFiles.length ? imageFiles : []);
      setIsChanged(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSavingDraft(false);
    }
  };

  // Stock validation function
  const validateStock = (value: string): string | true => {
    if (!value) {
      return 'Stock is required';
    }
    if (!Number.isInteger(parseFloat(value)) || parseFloat(value) < 0) {
      return 'Stock must be a valid positive integer';
    }
    return true;
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/30 p-6 shadow-soft backdrop-blur"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center text-xs sm:text-sm text-slate-500">
              <span className="cursor-pointer transition hover:text-slate-700">
                Dashboard
              </span>
              <ChevronRight size={14} className="mx-2 opacity-60" />
              <span className="cursor-pointer transition hover:text-slate-700">
                Products
              </span>
              <ChevronRight size={14} className="mx-2 opacity-60" />
              <span className="font-semibold text-slate-900">Create</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <motion.span 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft"
              >
                <Sparkles className="h-5 w-5" />
              </motion.span>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Create product
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Craft a compelling listing with rich media, pricing, and detailed specs.
                </p>
              </div>
            </div>
          </div>
          {hasUnsavedChanges && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </motion.span>
          )}
        </div>
      </motion.header>

      <form
        onSubmit={handleSubmit(onsubmit)}
        className="flex-1 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <section className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-hover p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Product overview
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Tell customers what makes this product special
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>
                    Product Title <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Apple iPhone 16 Pro Max"
                  {...register('productTitle', {
                    required: 'Product title is required',
                  })}
                  className="input-primary mt-2"
                />
                {errors.productTitle && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.productTitle.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-900">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Share a persuasive overview highlighting key features in under 150 words."
                  {...register('shortDescription', {
                    required: 'Short description is required',
                    maxLength: { value: 500, message: 'Max 500 characters' },
                  })}
                  className="input-primary mt-2 min-h-[120px]"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Appears in quick views, search cards, and social shares.
                </p>
                {errors.shortDescription && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Tags <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="apple, flagship, 256gb"
                  {...register('tags', { required: 'Tags are required' })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate tags with commas for better discovery.
                </p>
                {errors.tags && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.tags.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Warranty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="24 months manufacturer warranty"
                  {...register('warranty', {
                    required: 'Warranty is required',
                  })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.warranty && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.warranty.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Brand
                </label>
                <input
                  type="text"
                  placeholder="Apple"
                  {...register('brand')}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="iphone-16-pro-max"
                  {...register('slug', {
                    required: 'Slug is required',
                    validate: validateSlug,
                    onChange: (event) => {
                      const value = event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '');
                      setValue('slug', value);
                    },
                  })}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.slug
                      ? 'border-red-500 focus:ring-red-400/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.slug.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Use lowercase, numbers, and hyphens only.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-900">
                  Video URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=your-demo"
                  {...register('videoUrl', {
                    validate: validateVideoUrl,
                  })}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.videoUrl
                      ? 'border-red-500 focus:ring-red-400/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Optional. Supports YouTube and Vimeo embeds.
                </p>
                {errors.videoUrl && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.videoUrl.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card-hover p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Pricing & inventory
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Stay competitive while protecting your margins
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Regular Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="200.00"
                  step="0.01"
                  {...register('regularPrice', {
                    required: 'Regular price is required',
                    validate: validatePrice,
                  })}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.regularPrice
                      ? 'border-red-500 focus:ring-red-400/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.regularPrice && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.regularPrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Sale Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="180.00"
                  step="0.01"
                  {...register('salePrice', {
                    required: 'Sale price is required',
                    validate: {
                      price: validatePrice,
                      compareWithRegular: (value) => {
                        if (!regularPriceValue) {
                          return true;
                        }
                        const sale = parseFloat(value);
                        const regular = parseFloat(regularPriceValue);
                        if (
                          !Number.isFinite(sale) ||
                          !Number.isFinite(regular)
                        ) {
                          return true;
                        }
                        return (
                          sale <= regular ||
                          'Sale price cannot exceed regular price'
                        );
                      },
                    },
                  })}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.salePrice
                      ? 'border-red-500 focus:ring-red-400/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.salePrice && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.salePrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="120"
                  {...register('stock', {
                    required: 'Stock is required',
                    validate: validateStock,
                  })}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    errors.stock
                      ? 'border-red-500 focus:ring-red-400/40'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.stock && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Cash on Delivery <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('cashOnDelivery', {
                    required: 'Cash on Delivery is required',
                  })}
                  defaultValue="yes"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="yes">Available</option>
                  <option value="no">Unavailable</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Communicate fulfilment options transparently.
                </p>
                {errors.cashOnDelivery && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.cashOnDelivery.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 flex flex-col w-full">
                <label className="text-xs font-semibold text-slate-900">
                  Discount codes
                </label>
                <select
                  {...register('discountCodes')}
                  disabled={isLoading || discountFetchingError}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isLoading
                      ? 'Loading discount codes…'
                      : discountFetchingError
                      ? 'Unable to load discount codes'
                      : 'Select discount codes'}
                  </option>
                  {discountCodeOptions.map(
                    (code: { id: string; code: string }) => (
                      <option key={code.id} value={code.code}>
                        {code.code}
                      </option>
                    )
                  )}
                </select>
                {discountFetchingError && (
                  <p className="mt-1 text-xs text-red-500">
                    Discount codes cannot be fetched right now.
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card-hover p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Categorisation
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Help buyers find your listing faster
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    {...register('category', {
                      required: 'Category is required',
                    })}
                    disabled={isCategoryLoading || isError}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {isCategoryLoading
                        ? 'Loading categories…'
                        : 'Select category'}
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {isCategoryLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.category.message}
                  </p>
                )}
                {isError && (
                  <p className="mt-1 text-xs text-red-500">
                    Unable to load categories. Please retry.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('subCategory', {
                    required: 'Sub-category is required',
                    validate: (value) => {
                      if (!selectedCategory) {
                        return 'Please select a category first';
                      }
                      if (!value) {
                        return 'Sub-category is required';
                      }
                      return true;
                    },
                  })}
                  disabled={!selectedCategory}
                  className={`mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    !selectedCategory
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">
                    {selectedCategory
                      ? 'Select sub-category'
                      : 'Choose a category first'}
                  </option>
                  {availableSubCategories.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.subCategory.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="card-hover p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Variants & options
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Showcase every choice available to shoppers
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900">
                    Sizes
                  </label>
                  <span className="text-xs text-slate-500">
                    Select all sizes currently in stock.
                  </span>
                </div>
                <div className="mt-3">
                  <SizeSelector
                    selectedSizes={watch('sizes') || []}
                    onSizesChange={(sizes) => {
                      setValue('sizes', sizes);
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900">
                    Colors
                  </label>
                  <span className="text-xs text-slate-500">
                    Highlight signature shades and limited drops.
                  </span>
                </div>
                <div className="mt-3">
                  <ColorSelector
                    defaultColors={['#00FF00']}
                    onColorsChange={(colors) => {
                      setValue('colors', colors);
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="card-hover p-6"
          >
            <button
              type="button"
              onClick={() => setShowSpecifications((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Custom specifications
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Surface premium details buyers care about
                </h2>
              </div>
              <span className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    showSpecifications ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </button>

            {showSpecifications && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <CustomSpecifications control={control} errors={errors} />
              </div>
            )}
            {!showSpecifications && (
              <p className="mt-4 text-xs text-slate-500">
                Add storage capacity, material composition, certifications, and
                more tailored specs.
              </p>
            )}
          </motion.div>
        </section>

        <aside className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-hover p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Gallery
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Elevate visual storytelling
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Upload up to 8 high-resolution images. Primary image appears
                  in search and listings.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <ImageUploader
                size="765 x 850"
                small={false}
                index={0}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                onEnhanceImage={setModalImageUrl}
                enhancedImageUrl={enhancedImages[0]}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-hover p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Listing guidelines
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use neutral backgrounds, include lifestyle photos, and keep
                  file sizes under 5MB for fast loading.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-xs text-slate-500">
              <li>• Showcase key angles: front, detail, scale, packaging.</li>
              <li>• Keep titles under 80 characters for optimal truncation.</li>
              <li>
                • Ensure sale price is lower than regular price to display
                badges.
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-large"
          >
            <h2 className="text-lg font-semibold">Ready to launch?</h2>
            <p className="mt-1 text-sm text-slate-200/80">
              Review your details before publishing. You can always edit after
              publishing.
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={createProductMutation.isPending || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-white/60 disabled:text-slate-500"
              >
                {(createProductMutation.isPending || isSubmitting) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Publish product
              </button>
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/70"
                >
                  {savingDraft && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save draft
                </button>
              )}
              {formattedDraftSavedTime && (
                <p className="text-center text-xs text-slate-200/80">
                  Last saved {formattedDraftSavedTime}
                </p>
              )}
            </div>
          </motion.div>
        </aside>
      </form>

      {modalImageUrl && (
        <ImageEnhancementModal
          imageUrl={modalImageUrl}
          onClose={() => setModalImageUrl(null)}
          onApply={(enhancedUrl) => {
            setEnhancedImages((prev) => ({
              ...prev,
              0: enhancedUrl,
            }));
            setModalImageUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductCreatePage;
