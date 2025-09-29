"use client";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/libs/axiosInterceptor';
import { usePathname } from 'next/navigation';

const useUser = () => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await axiosInstance.get('/me');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, 
    retry: 1,               
    refetchOnWindowFocus: false, 
    enabled: !isAuthPage, 
  });
};

export default useUser;
