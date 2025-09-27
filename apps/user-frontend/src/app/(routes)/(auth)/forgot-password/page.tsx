'use client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type ForgotPasswordForm = {
  email: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resend, setResend] = useState(true);
  // using httpOnly cookie for reset token now
  const [timer, setTimer] = useState(60);
    const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const resendTimer = () => {
    setResend(false);
    let count = 60;
    const interval = setInterval(() => {
      count -= 1;
      setTimer(count);
      if (count === 0) {
        clearInterval(interval);
        setResend(true);
      }
    }, 1000);
  };

  useEffect(() => {
  reset();
}, [step, reset]);

  
  const otpReqMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await axios.post(
        'http://localhost:8080/api/forgot-password/request',
        { email }
      );
      console.log('otp request response: ', res.data);
      return res.data;
    },
    onSuccess: (_, email) => {
      setEmail(email);
      setStep('otp');
      resendTimer();
    },
    onError: (error: any) => {
      console.error(error.message || 'Something went wrong');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const res = await axios.post(
        'http://localhost:8080/api/forgot-password/verify',
        { email, otp },
        { withCredentials: true }
      );
      return res.data as { success: boolean };
    },
    onSuccess: () => {
      setStep('reset');
    },
    onError: (error: any) => {
      console.error(error.message || 'Something went wrong');
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({
      email,
      newPassword,
    }: {
      email: string;
      newPassword: string;
    }) => {
      const res = await axios.post(
        'http://localhost:8080/api/forgot-password/reset',
        { email, newPassword },
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => {
      setStep('email');
      router.push('/login');
      alert('Password reset successful! Please log in with your new password.');
    },
    onError: (error: any) => {
      console.error(error.message || 'Something went wrong');
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    if (step === 'email') {
      otpReqMutation.mutate(data.email);
    } else if (step === 'otp') {
      verifyMutation.mutate({ email, otp: data.otp! });
    } else if (step === 'reset') {
      resetMutation.mutate({ email, newPassword: data.newPassword! });
    }
  };

  return (
    <div className="flex justify-center lg:pt-20">
      <div className="flex flex-col w-full max-w-md gap-6 px-4">
        <div className="overflow-hidden bg-white shadow-sm rounded-2xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 p-6 md:p-8"
          >
            {step === 'email' && (
              <>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-gray-500">
                    Enter your email to reset your password
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
                    {...register('email', { required: 'Email is required' })}
                    className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send OTP
                </button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Verify OTP</h1>
                  <p className="text-gray-500">
                    Enter the OTP sent to your email
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    {...register('otp', { required: 'OTP is required' })}
                    className="px-4 py-2 text-sm tracking-widest text-center bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.otp && (
                    <span className="text-xs text-red-500">
                      {errors.otp.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Verify OTP
                </button>

                <div className="flex items-center justify-between mt-2 text-sm">
                  {!resend ? (
                    <span className="text-gray-500">
                      Resend available in {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => otpReqMutation.mutate(email)}
                      className="text-blue-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 'reset' && (
              <>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-gray-500">Enter your new password</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.newPassword && (
                    <span className="text-xs text-red-500">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>

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
                    placeholder="Re-enter new password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) =>
                        val === watch('newPassword') ||
                        'Passwords do not match',
                    })}
                    className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirmPassword && (
                    <span className="text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset Password
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
