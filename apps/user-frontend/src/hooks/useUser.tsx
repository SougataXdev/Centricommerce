"use client";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/libs/axiosInterceptor';
import { usePathname } from 'next/navigation';
import axios from 'axios';

const AUTH_ROUTES = new Set(['/login', '/register', '/signup', '/forgot-password']);

const useUser = () => {
  const pathname = usePathname();
  const isAuthPage = pathname ? AUTH_ROUTES.has(pathname) : false;

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/me', {
          skipAuthRedirect: true,
        });
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }

        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    enabled: !isAuthPage,
  });
};

export default useUser;
