// hooks/useImageUpload.ts
import { useState } from 'react';
import axiosInstance from '@/libs/axiosInterceptor';

export interface UploadResponse {
  url: string;
  id: string;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file: File): Promise<UploadResponse | null> => {
    setUploading(true);
    setError(null);
    try {
      const imageBase64 = await convertToBase64(file);

      const response = await axiosInstance.post(
        '/products/api/upload-image',
        { image: imageBase64 },
        {
          withCredentials: true,
        }
      );

      return {
        url: response.data.url,
        id: response.data.id,
      };
    } catch (err) {
      setError('Failed to upload image');
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    try {
      await axiosInstance.delete(`/products/api/delete-image/${imageId}`);
      return true;
    } catch (err) {
      setError('Failed to delete image');
      console.error('Delete error:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { uploadImage, deleteImage, uploading, deleting, error };
};
