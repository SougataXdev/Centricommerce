'use client';
import ImageUploader from '@/components/image-uploader';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {};

const page = (props: Props) => {
  const [openImageModel, setOpenImageModel] = useState(false);
  const [isChanged, setIsChnaged] = useState(false);
  const [images, setImages] = useState<Array<File | null>>([null]);
  const [loading, setLoading] = useState(false);

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

  return (
    <form
      className="w-full m-auto p-8 shadow-md rounded-lg border"
      onSubmit={handleSubmit(onsubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opaxity-[.8]" />
        <span>Create Product</span>
      </div>

      <div className="py-4 w-full flex gap-6 ">
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
      </div>
    </form>
  );
};

export default page;
