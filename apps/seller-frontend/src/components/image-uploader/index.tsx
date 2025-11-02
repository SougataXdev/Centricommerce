import { Trash2, WandSparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

type Props = {
  size: string;
  small: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemoveImage: (index: number) => void;
  defaultImage?: string | null;
  setImageOpenModel: (openImgModel: boolean) => void;
  index?: any;
};

const ImageUploader = ({
  size,
  small,
  onImageChange,
  onRemoveImage,
  defaultImage = null,
  index = null,
  setImageOpenModel,
}: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  };

  function onRemove(imageIndex: number): void {
    if (!imagePreview) {
      alert('A product must have at least one image');
      return;
    }
    setImagePreview(null);
    onRemoveImage(imageIndex);
    const fileInput = document.getElementById(`image-upload-${imageIndex}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

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
          <button className="absolute top-2 right-12 bg-blue-300 p-1 rounded-md ">
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
          src={imagePreview}
          alt="Uploaded Image"
          className="h-full w-full object-cover rounded-lg"
          onClick={() => setImageOpenModel(true)}
          width={200}
          height={200}
        />
        )}  

    </div>
  );
};

export default ImageUploader;
