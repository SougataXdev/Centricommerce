"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  country: string;
  otp?: string;
  shopName?: string;
  bio?: string;
  address?: string;
  opening?: string;
  website?: string;
  category?: string;
};

type SellerAccountPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
  usertype: "seller";
};

type CreateShopPayload = {
  shopName: string;
  bio?: string;
  address: string;
  opening?: string;
  website?: string;
  category: string;
  sellerId: string;
};

const COUNTRY_OPTIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:8080/api";

export default function SellerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showOtp, setShowOtp] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [accountPayload, setAccountPayload] = useState<SellerAccountPayload | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { country: COUNTRY_OPTIONS[0]?.label ?? "" },
  });

  useEffect(() => {
    let id: number | undefined;
    if (!canSend && timer > 0) {
      id = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanSend(true);
      setTimer(60);
    }
    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [canSend, timer]);

  const sendOtpMutation = useMutation({
    mutationFn: async (payload: SellerAccountPayload) => {
      const res = await axios.post(`${API_BASE_URL}/seller/send-seller-otp`, payload, {
        withCredentials: true,
      });
      return res.data as { message?: string };
    },
    onSuccess: () => {
      setShowOtp(true);
      setCanSend(false);
      setTimer(60);
    },
    onError: (error: AxiosError<{ message?: string; issues?: Array<{ path?: string[]; message: string }> }>) => {
      const issue = error.response?.data?.issues?.[0];
      if (issue?.path?.length) {
        setError(issue.path[0] as keyof SignupForm, { message: issue.message });
        return;
      }
      const message = error.response?.data?.message;
      if (message) {
        setError("email", { message });
      }
    },
  });

  const verifySellerMutation = useMutation({
    mutationFn: async (payload: SellerAccountPayload & { otp: string }) => {
      const res = await axios.post(`${API_BASE_URL}/seller/verify-create-seller`, payload, {
        withCredentials: true,
      });
      return res.data as { success?: boolean; seller?: { id?: string; _id?: string }; sellerId?: string };
    },
    onSuccess: (data) => {
      const resolvedId = data?.seller?.id ?? data?.seller?._id ?? data?.sellerId ?? null;
      if (resolvedId) {
        setSellerId(resolvedId);
      }
      setShowOtp(false);
      setStep(2);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "OTP verification failed";
      setError("otp", { message });
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async (payload: CreateShopPayload) => {
      const res = await axios.post(`${API_BASE_URL}/seller/createshop`, payload, {
        withCredentials: true,
      });
      return res.data as { success?: boolean };
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to create shop";
      setError("shopName", { message });
    },
  });

  const handleResendOtp = () => {
    if (!accountPayload || !canSend || sendOtpMutation.isPending) {
      return;
    }
    sendOtpMutation.mutate(accountPayload);
  };

  const onSubmit = (data: SignupForm) => {
    if (step === 1 && !showOtp) {
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", { message: "Passwords do not match" });
        return;
      }

      const payload: SellerAccountPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        country: data.country,
        usertype: "seller",
      };

      setAccountPayload(payload);
      sendOtpMutation.mutate(payload);
      return;
    }

    if (step === 1 && showOtp) {
      if (!data.otp || data.otp.trim().length !== 6) {
        setError("otp", { message: "Enter a valid 6-digit OTP" });
        return;
      }

      if (!accountPayload) {
        setError("email", { message: "Please restart the signup flow" });
        return;
      }

      verifySellerMutation.mutate({ ...accountPayload, otp: data.otp.trim() });
      return;
    }

    if (step === 2) {
      if (!sellerId) {
        setError("shopName", { message: "Missing seller id. Please retry verification." });
        return;
      }

      const payload: CreateShopPayload = {
        shopName: data.shopName ?? "",
        bio: data.bio,
        address: data.address ?? "",
        opening: data.opening,
        website: data.website,
        category: data.category ?? "",
        sellerId,
      };

      createShopMutation.mutate(payload);
    }
  };

  const StepperHeader = () => {
    const steps = ["Seller details", "Shop setup"];
    return (
      <div className="flex items-center gap-4 mb-6">
        {steps.map((label, index) => {
          const idx = (index + 1) as 1 | 2;
          const active = idx === step;
          const done = idx < step;
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : done
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 text-gray-600 bg-white"
                }`}
              >
                {idx}
              </div>
              <div className={`text-sm ${active ? "text-gray-900 font-medium" : "text-gray-500"}`}>{label}</div>
              {index !== steps.length - 1 && <div className="w-8 h-0.5 bg-gray-200 mx-3" />}
            </div>
          );
        })}
      </div>
    );
  };

  const isSendingOtp = sendOtpMutation.isPending;
  const isVerifyingOtp = verifySellerMutation.isPending;
  const isCreatingShop = createShopMutation.isPending;

  return (
    <div className="flex justify-center lg:pt-20">
      <div className="w-full max-w-2xl px-4">
        <div className="p-6 bg-white shadow-sm rounded-2xl md:p-8">
          <StepperHeader />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      {...register("name", { required: "Name is required", minLength: { value: 3, message: "Name must be at least 3 characters" } })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Phone number</label>
                    <input
                      type="tel"
                      {...register("phoneNumber", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^\+?\d{7,15}$/,
                          message: "Enter a valid phone number",
                        },
                      })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="e.g. +919876543210"
                    />
                    {errors.phoneNumber && <span className="text-xs text-red-500">{errors.phoneNumber.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Enter a valid email",
                        },
                      })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="you@company.com"
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Country</label>
                    <select {...register("country", { required: "Country is required" })} className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md">
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {errors.country && <span className="text-xs text-red-500">{errors.country.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative flex flex-col gap-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Create a password"
                    />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-9">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Confirm password</label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Confirm your password",
                        validate: (value) => value === watch("password") || "Passwords do not match",
                      })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                  </div>
                </div>

                {showOtp && (
                  <div className="mt-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        {...register("otp")}
                        maxLength={6}
                        className="w-40 px-4 py-2 text-sm tracking-widest text-center bg-gray-100 border border-gray-300 rounded-md"
                        placeholder="6-digit code"
                      />

                      <div className="text-sm">
                        {canSend ? (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-blue-600 hover:underline disabled:text-gray-400"
                            disabled={isSendingOtp}
                          >
                            Resend OTP
                          </button>
                        ) : (
                          <span className="text-gray-500">Resend in {timer}s</span>
                        )}
                      </div>
                    </div>
                    {errors.otp && <span className="text-xs text-red-500">{errors.otp.message}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-70"
                    disabled={isSendingOtp || isVerifyingOtp}
                  >
                    {!showOtp
                      ? isSendingOtp
                        ? "Sending OTP..."
                        : "Send OTP"
                      : isVerifyingOtp
                      ? "Verifying..."
                      : "Verify & Continue"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium">Shop name</label>
                    <input
                      {...register("shopName", { required: "Shop name is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Your shop name"
                    />
                    {errors.shopName && <span className="text-xs text-red-500">{errors.shopName.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <input
                      {...register("category", { required: "Category is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Product category"
                    />
                    {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Opening hours</label>
                    <input
                      {...register("opening")}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="e.g. Mon-Fri 9am-6pm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium">Shop bio</label>
                    <textarea
                      {...register("bio")}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Tell customers about your shop"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <input
                      {...register("address", { required: "Address is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Shop address"
                    />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium">Website (optional)</label>
                    <input
                      {...register("website")}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="https://your-shop.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border rounded-md">
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-70"
                    disabled={isCreatingShop}
                  >
                    {isCreatingShop ? "Creating shop..." : "Create shop"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
