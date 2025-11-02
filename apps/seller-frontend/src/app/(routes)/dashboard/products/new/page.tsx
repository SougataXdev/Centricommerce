'use client';
import ImageUploader from '@/components/image-uploader';
import ColorSelector from '@/components/color-selector';
import CustomSpecifications from '@/components/custom-specifications';
import { ChevronRight, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/libs/axiosInterceptor';

type Props = {};

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
  casn_on_delivery: string;
}

const page = (props: Props) => {
  const [openImageModel, setOpenImageModel] = useState(false);
  const [isChanged, setIsChnaged] = useState(false);
  const [images, setImages] = useState<Array<File | null>>([null]);
  const [loading, setLoading] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState<boolean>(false);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
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
      casn_on_delivery: 'yes',
    },
  });

  const {data , isLoading , isError} = useQuery({
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
    retry:2
  });


  const categories = data?.categories || [];
  const subCategories = data?.subCategories || [];

  const selectedCategory = watch('category');

  console.log('Categories:', categories);
  console.log('SubCategories:', subCategories);

  // const regularPrice = watch('regular_price');

  const onsubmit = (data: ProductFormData) => {
    console.log('Form Data:', data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updateImages = [...images];
    updateImages[index] = file;
    if (index === images.length - 1 && images.length < 8) {
      updateImages.push(null);
    }
    setImages(updateImages);
    setValue('images', updateImages);
    setIsChnaged(true);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      let updatedImages = [...prev];

      if (index == -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }
      if (updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });
    setValue('images', images);
  };

  // Slug validation function
  const validateSlug = (value: string): string | true => {
    if (!value) {
      return 'Slug is required';
    }
    if (value.length > 50) {
      return 'Slug must be max 50 characters';
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    return true;
  };

  return (
    <form
      className="w-full m-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg border border-slate-200 shadow-sm"
      onSubmit={handleSubmit(onsubmit)}
    >
      <h2 className="text-xl sm:text-2xl py-2 font-semibold font-Poppins text-slate-900">
        Create Product
      </h2>
      <div className="flex items-center text-xs sm:text-sm text-slate-600">
        <span className="cursor-pointer">Dashboard</span>
        <ChevronRight size={16} className="opacity-60 mx-1 sm:mx-2" />
        <span>Create Product</span>
      </div>

      <div className="py-6 sm:py-8 w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Side - Image Upload */}
        <div className="w-full lg:w-[35%]">
          <ImageUploader
            setImageOpenModel={setOpenImageModel}
            size="765 x 850"
            small={false}
            index={0}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
          />
        </div>

        {/* Right Side - Form Fields */}
        <div className="w-full lg:flex-1 space-y-4 sm:space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product title"
              {...register('productTitle', {
                required: 'Product title is required',
              })}
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.productTitle && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.productTitle.message}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Short Description <span className="text-red-500">*</span> (Max 150
              words)
            </label>
            <textarea
              placeholder="Enter product description for quick view"
              {...register('shortDescription', {
                required: 'Short description is required',
                maxLength: { value: 500, message: 'Max 500 characters' },
              })}
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
            {errors.shortDescription && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="apple,flagship"
              {...register('tags', { required: 'Tags are required' })}
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.tags && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.tags.message}</p>
            )}
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Warranty <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="1 Year / No Warranty"
              {...register('warranty', { required: 'Warranty is required' })}
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.warranty && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.warranty.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="product_slug"
              {...register('slug', {
                required: 'Slug is required',
                validate: validateSlug,
                onChange: (e) => {
                  const value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '');
                  setValue('slug', value);
                },
              })}
              className={`w-full px-3 py-2 text-sm sm:text-base bg-white border rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:outline-none transition ${
                errors.slug
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {errors.slug && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.slug.message}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Brand
            </label>
            <input
              type="text"
              placeholder="Apple"
              {...register('brand')}
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-3">
              Colors
            </label>
            <ColorSelector
              defaultColors={['#00FF00']}
              onColorsChange={(colors) => {
                setValue('colors', colors);
              }}
            />
          </div>

          {/* Custom Specifications Dropdown */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSpecifications(!showSpecifications)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition duration-200 font-semibold text-xs sm:text-sm text-slate-900"
            >
              <span>Custom Specifications</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  showSpecifications ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Content */}
            {showSpecifications && (
              <div className="p-3 sm:p-4 bg-white border-t border-slate-300">
                <CustomSpecifications control={control} errors={errors} />
              </div>
            )}
          </div>

          {/* Cash on Delivery */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Cash on Delivery <span className="text-red-500">*</span>
            </label>
            <select
              {...register('casn_on_delivery', {
                required: 'Cash on Delivery is required',
              })}
              defaultValue="yes"
              className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.casn_on_delivery && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.casn_on_delivery.message}
              </p>
            )}
          </div>

          {/* Category and Sub-Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Main Category */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category', {
                  required: 'Category is required',
                })}
                className="w-full px-3 py-2 text-sm sm:text-base bg-white border border-slate-300 rounded text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories?.map((category: string) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs sm:text-sm text-red-500 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Sub-Category */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                Sub-Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('subCategory', {
                  required: 'Sub-category is required',
                  validate: (value) => {
                    if (!selectedCategory) {
                      return 'Please select a category first';
                    }
                    return true;
                  },
                })}
                className={`w-full px-3 py-2 text-sm sm:text-base bg-white border rounded text-slate-900 focus:ring-2 focus:outline-none transition ${
                  !selectedCategory
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Select Sub-Category</option>
                {selectedCategory &&
                  subCategories?.[selectedCategory as keyof typeof subCategories]?.map(
                    (subCategory: string) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    )
                  )}
              </select>
              {errors.subCategory && (
                <p className="text-xs sm:text-sm text-red-500 mt-1">
                  {errors.subCategory.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          type="submit"
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Create Product
        </button>
      </div>
    </form>
  );
};

export default page;
