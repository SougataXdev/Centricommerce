import React from 'react';

import { useForm } from 'react-hook-form';

type Props = {};

const SignupPage = (props: Props) => {
  return (
    <div className="flex justify-center lg:pt-20">
      <div className="flex flex-col w-full max-w-md gap-6 px-4">
        <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
          <form className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Create an Account</h1>
              <p className="text-gray-500">Sign up for Centricommerce</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                required
                minLength={3}
                className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                minLength={6}
                className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                required
                minLength={6}
                className="px-4 py-2 text-sm bg-gray-200 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>

            <div className="relative text-sm text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <span className="relative px-2 text-gray-500 bg-white">
                Or continue with
              </span>
            </div>

            <div className="text-sm text-center">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </div>

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
