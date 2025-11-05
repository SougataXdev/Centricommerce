import { Trash2, WandSparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

type Props = {
  size: string;
  small: boolean;
  onImageChange: (file: File | null, uploadedData: { url: string; id: string } | null, index: number) => void;
  onRemoveImage: (imageId: string, index: number) => void;
  defaultImage?: string | null;
  defaultImageId?: string | null;
  onEnhanceImage?: (imageUrl: string) => void;
  enhancedImageUrl?: string;
  index: number;
};

const ImageUploader = ({
  size,
  small,
  onImageChange,
  onRemoveImage,
  defaultImage = null,
  defaultImageId = null,
  index,
  onEnhanceImage,
  enhancedImageUrl,
}: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
  const [imageId, setImageId] = useState<string | null>(defaultImageId);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, deleteImage } = useImageUpload();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;

      if (!file) {
        setImagePreview(null);
        setImageId(null);
        onImageChange(null, null, index);
        return;
      }

      // Show local preview immediately
      const localPreviewUrl = URL.createObjectURL(file);
      objectUrlRef.current = localPreviewUrl;
      setImagePreview(localPreviewUrl);

      // Upload to ImageKit 
      const uploadedData = await uploadImage(file);

      if (uploadedData) {
        setImagePreview(uploadedData.url); 
        setImageId(uploadedData.id);      
        onImageChange(file, uploadedData, index);
      } else {
        onImageChange(file, null, index);
      }
    },
    [index, onImageChange, uploadImage]
  );

  const onRemove = useCallback(
    async (imageIndex: number) => {
      if (!imagePreview) {
        alert('Cannot delete image. Please upload a new image first.');
        return;
      }

      // Delete from ImageKit if ID exists
      if (imageId) {
        const deleted = await deleteImage(imageId);
        if (!deleted) {
          alert('Failed to delete image from server');
          return;
        }
      }

      // Clean up
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setImagePreview(null);
      setImageId(null);
      onRemoveImage(imageId || '', imageIndex);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [imagePreview, imageId, deleteImage, onRemoveImage]
  );

  return (
    <div
      className={`relative ${
        small ? 'h-[180px]' : 'h-[200px]'
      } w-[200px] cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        id={`image-upload-${index}`}
        onChange={handleImageChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index!)}
            className="absolute top-2 right-3 text-red-500 bg-red-100 p-1 rounded-md"
          >
            <Trash2 />
          </button>
          <button
            type="button"
            onClick={() => onEnhanceImage?.(imagePreview!)}
            className="absolute top-2 right-12 bg-blue-300 p-1 rounded-md hover:bg-blue-400 transition"
          >
            <WandSparkles />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Click to upload</p>
            <p className="text-xs text-gray-400">Recommended size: {size}</p>
          </div>
        </label>
      )}

        {imagePreview && (  
        <Image
          src={enhancedImageUrl || imagePreview}
          alt="Uploaded Image"
          className="h-full w-full object-cover rounded-lg"
          width={200}
          height={200}
        />
        )}  

    </div>
  );
};

export default ImageUploader;
