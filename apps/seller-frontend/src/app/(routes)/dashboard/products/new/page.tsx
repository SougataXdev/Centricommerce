'use client';
import ImageUploader from '@/components/image-uploader';
import Input from '@/components/input';
import ColorSelector from '@/components/color-selector';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {};

const page = (props: Props) => {
  const [openImageModel, setOpenImageModel] = useState(false);
  const [isChanged, setIsChnaged] = useState(false);
  const [images, setImages] = useState<Array<File | null>>([null]);
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState<string>('');
  const [slug, setSlug] = useState<string>('');

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onsubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updateImages = [...images];
    updateImages[index] = file;
    if (index === images.length - 1 && images.length < 8) {
      updateImages.push(null);
    }
    setImages(updateImages);
    setValue("images" , updateImages);
    setIsChnaged(true);
  };

  const handleRemoveImage = (index:number)=>{
    setImages((prev)=>{
        let updatedImages = [...prev];

        if(index == -1){
            updatedImages[0] = null;
        }else{
            updatedImages.splice(index, 1);
        }
        if(updatedImages.includes(null) && updatedImages.length <8){
           updatedImages.push(null);
        }

        return updatedImages;
    })
    setValue("images" , images);
  }

  // Slug validation function
  const validateSlug = (value: string): string => {
    if (!value) {
      return 'Slug is required';
    }
    if (value.length > 50) {
      return 'Slug must be max 50 characters';
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    return '';
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
    const error = validateSlug(value);
    setSlugError(error);
  };

  return (
    <form
      className="w-full m-auto p-8 bg-white rounded-lg border border-slate-200 shadow-sm"
      onSubmit={handleSubmit(onsubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-slate-900">
        Create Product
      </h2>
      <div className="flex items-center text-sm text-slate-600">
        <span className="cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-60 mx-1" />
        <span>Create Product</span>
      </div>

      <div className="py-8 w-full flex gap-8">
        {/* Left Side - Image Upload */}
        <div className="w-[35%]">
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
        <div className="flex-1 space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter product title"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Short Description <span className="text-red-500">*</span> (Max 150 words)
            </label>
            <Input
              type="textarea"
              placeholder="Enter product description for quick view"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="apple,flagship"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Warranty <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="1 Year / No Warranty"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="product_slug"
              className={`w-full px-3 py-2 bg-white border rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:outline-none transition ${
                slugError
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {slugError && (
              <p className="text-sm text-red-500 mt-1">{slugError}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Brand
            </label>
            <Input
              type="text"
              placeholder="Apple"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Colors
            </label>
            <ColorSelector
              defaultColors={['#00FF00']}
              onColorsChange={(colors) => {
                console.log('Colors changed:', colors);
              }}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Create Product
        </button>
      </div>
    </form>
  );
};

export default page;
