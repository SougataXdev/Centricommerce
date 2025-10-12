"use client";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../libs/axiosInterceptor';
import { usePathname } from 'next/navigation';

const useSeller = () => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return useQuery({
    queryKey: ['seller'],
    queryFn: async () => {
      const res = await axiosInstance.get('/me');
      return res.data?.seller ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if ((error as any)?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    enabled: !isAuthPage,
  });
};

export default useSeller;
