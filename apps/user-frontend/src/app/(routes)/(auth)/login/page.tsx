'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { error } from 'console';

type FormData = {
  email: string;
  password: string;
};

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    loginmutation.mutate(data);
  };

  const loginmutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post('http://localhost:8080/api/login', data, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      router.push('/');
    },
    onError:(error:AxiosError)=>{
      const errorMessage = (error.response?.data as {message?:string})?.message || 'Login failed';
      console.error('Login error:', errorMessage);
    }
  });

  return (
    <div className="flex justify-center overflow-y-hidden lg:pt-20">
      <div className="flex flex-col w-full max-w-md gap-6 px-4">
        <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 p-6 md:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-gray-500">
                Login to your Centricommerce Account
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Enter a valid email',
                  },
                })}
                className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href={'/forgot-password'}
                  className="text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className="w-full px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-600 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-800 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loginmutation.isPending ? 'Logging in...' : 'Login'}
            </button>

            <div className="relative text-sm text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <span className="relative px-2 text-gray-500 bg-white">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              className="flex items-center justify-center w-full gap-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.92 2.63 30.29 0 24 0 14.64 0 6.52 5.55 2.56 13.64l7.98 6.2C12.26 13.09 17.62 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.64-.15-3.21-.43-4.71H24v9.02h12.7c-.55 2.95-2.27 5.45-4.83 7.13l7.59 5.88C43.71 37.2 46.5 31.3 46.5 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.54 28.84a14.48 14.48 0 0 1-.76-4.34c0-1.5.27-2.95.76-4.34l-7.98-6.2A23.94 23.94 0 0 0 0 24.5c0 3.92.94 7.63 2.56 10.93l7.98-6.59z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.59-5.88c-2.1 1.42-4.77 2.25-8.3 2.25-6.38 0-11.74-3.59-14.46-8.84l-7.98 6.59C6.52 42.45 14.64 48 24 48z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="text-sm text-center">
              Don&apos;t have an account?{' '}
              <Link href={'/signup'} className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <div className="text-xs text-center text-gray-500">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline underline-offset-4">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default Page;
