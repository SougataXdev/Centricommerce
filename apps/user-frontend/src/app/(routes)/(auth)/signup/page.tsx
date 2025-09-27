'use client';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
  userType: 'user' | 'seller';
};

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [userData, setUserData] = useState<FormData | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (!canSend && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanSend(true);
    }
    return () => clearInterval(countdown);
  }, [canSend, timer]);

  const handleResendOtp = () => {
    console.log('Resending OTP...');
    setCanSend(false);
    setTimer(60);
  };

  const onSubmit = async (data: FormData) => {
    console.log(data);

    if (!showOtp) {
      const fullData = { ...data, usertype: 'user' };
      setUserData(fullData);

      await axios.post('http://localhost:8080/api/signup', fullData, {
        withCredentials: true,
      });

      setShowOtp(true);
    } else {
      if (data.otp?.length !== 6) {
        alert('Please enter a validDjsougata@567 6-digit OTP');
        return;
      }

      console.log('Verifying OTP with data:', userData);
      console.log('data', data);

      try {
        const res = await axios.post(
          'http://localhost:8080/api/signup/verify',
          data,
          {
            withCredentials: true,
          }
        );

        console.log('OTP verification response:', res.data);

        alert('Signup and OTP verification successful!');

        if (res.status === 200) {
          setShowOtp(false);
          router.push('/login');
        }
      } catch (error) {
        console.error('OTP verification failed:', error);
        alert('OTP verification failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center lg:pt-20">
      <div className="flex flex-col w-full max-w-md gap-6 px-4">
        <div className="overflow-hidden bg-white shadow-sm rounded-2xl">
          {!showOtp ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6 p-6 md:p-8"
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-gray-500">Sign up for Centricommerce</p>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                  })}
                  className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
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
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === watch('password') || 'Passwords do not match',
                  })}
                  className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.confirmPassword && (
                  <span className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sign Up
              </button>

              {/* Divider */}
              <div className="relative text-sm text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <span className="relative px-2 text-gray-500 bg-white">
                  Or continue with
                </span>
              </div>

              {/* Login Link */}
              <div className="text-sm text-center">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="flex flex-col w-full max-w-md gap-6 px-4">
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-6 p-6 md:p-8"
                >
                  {/* Title */}
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Verify OTP</h1>
                    <p className="text-gray-500">
                      Please enter the one-time password sent to your email.
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp" className="text-sm font-medium">
                      One-Time Password
                    </label>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      {...register('otp')}
                      className="px-4 py-2 text-sm tracking-widest text-center bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.otp && (
                      <span className="text-xs text-red-500">
                        {errors.otp.message}
                      </span>
                    )}
                  </div>

                  {/* Resend OTP */}
                  <div className="text-sm text-center">
                    {canSend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-blue-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-gray-500">Resend in {timer}s</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Verify
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="text-xs text-center text-gray-500">
          By signing up, you agree to our{' '}
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

export default SignupPage;
