"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  otp?: string;
  displayName?: string;
  userType?: "user" | "seller";
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifsc?: string;
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

export default function SignupStepper() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1); // 1: create+otp, 2: setup, 3: add bank
  const [showOtp, setShowOtp] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [timer, setTimer] = useState<number>(60);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
    getValues,
  } = useForm<SignupForm>({
    defaultValues: { country: "India", userType: "user" },
  });

  // Timer for resend OTP
  useEffect(() => {
    let id: number | undefined;
    if (!canSend && timer > 0) {
      id = window.setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanSend(true);
      setTimer(60);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [canSend, timer]);

  const handleResendOtp = async () => {
    try {
      const { email } = getValues();
      if (!email) return setError("email", { message: "Provide email to resend OTP" });
      setCanSend(false);
      setTimer(60);
      // call resend endpoint (adjust to your API)
      await axios.post(
        "/api/signup/resend-otp",
        { email },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
      setCanSend(true);
    }
  };

  const onSubmit = async (data: SignupForm) => {
    // Step 1: Create account -> trigger OTP
    if (step === 1 && !showOtp) {
      // basic password match check
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", { message: "Passwords do not match" });
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          country: data.country,
        };

        // adjust endpoint to your backend
        await axios.post("/api/signup", payload, { withCredentials: true });

        // show OTP input after server accepted signup
        setShowOtp(true);
        setCanSend(false);
        setTimer(60);
      } catch (err: any) {
        console.error("signup error", err?.response ?? err);
        // show backend validation errors if available
        if (err?.response?.data?.errors) {
          Object.entries(err.response.data.errors).forEach(([k, v]) =>
            setError(k as any, { message: String(v) })
          );
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Step 1 (OTP verification) -> move to step 2
    if (step === 1 && showOtp) {
      if (!data.otp || data.otp.length !== 6) {
        setError("otp", { message: "Enter a valid 6-digit OTP" });
        return;
      }

      setIsSubmitting(true);
      try {
        await axios.post(
          "/api/signup/verify",
          { email: data.email, otp: data.otp },
          { withCredentials: true }
        );

        setShowOtp(false);
        setStep(2);
      } catch (err) {
        console.error("OTP verification failed", err);
        setError("otp", { message: "OTP verification failed" });
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // Step 2: Setup profile
    if (step === 2) {
      setIsSubmitting(true);
      try {
        const payload = {
          displayName: data.displayName,
          userType: data.userType,
        };
        await axios.post("/api/profile/setup", payload, { withCredentials: true });
        setStep(3);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Step 3: Add bank
    if (step === 3) {
      setIsSubmitting(true);
      try {
        const payload = {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          ifsc: data.ifsc,
        };
        await axios.post("/api/bank/add", payload, { withCredentials: true });

        // finished signup flow
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const StepperHeader = () => {
    const steps = ["Create account", "Setup profile", "Add bank"];
    return (
      <div className="flex items-center gap-4 mb-6">
        {steps.map((label, i) => {
          const idx = i + 1;
          const active = idx === step;
          const done = idx < step;
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  active ? "border-blue-600 bg-blue-600 text-white" : done ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-gray-600 bg-white"
                }`}
              >
                {idx}
              </div>
              <div className={`text-sm ${active ? "text-gray-900 font-medium" : "text-gray-500"}`}>{label}</div>
              {i !== steps.length - 1 && <div className="w-8 h-0.5 bg-gray-200 mx-3" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex justify-center lg:pt-20">
      <div className="w-full max-w-2xl px-4">
        <div className="p-6 bg-white shadow-sm rounded-2xl md:p-8">
          <StepperHeader />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* STEP 1: Create account + OTP */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      {...register("name", { required: "Name is required", minLength: 3 })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      {...register("phone", { required: "Phone is required", pattern: { value: /^\+?\d{7,15}$/, message: "Enter a valid phone number" } })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="e.g. +919876543210"
                    />
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      {...register("email", { required: "Email is required", pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="you@company.com"
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Country</label>
                    <select {...register("country", { required: true })} className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md">
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative flex flex-col gap-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", { required: "Password is required", minLength: 6 })}
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
                        validate: (v) => v === watch("password") || "Passwords do not match",
                      })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                  </div>
                </div>

                {/* OTP block shown after signup request */}
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
                          <button type="button" onClick={handleResendOtp} className="text-blue-600 hover:underline">
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
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {showOtp ? "Verify & Continue" : "Create account"}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Setup profile */}
            {step === 2 && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Display name</label>
                  <input
                    {...register("displayName", { required: "Display name is required" })}
                    className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                    placeholder="How should we call you?"
                  />
                  {errors.displayName && <span className="text-xs text-red-500">{errors.displayName.message}</span>}
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Account type</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="user" {...register("userType")} defaultChecked /> User
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="seller" {...register("userType")} /> Seller
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border rounded-md">
                    Back
                  </button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
                    Save & Continue
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Add bank */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Account holder name</label>
                    <input
                      {...register("accountHolderName", { required: "Account holder name is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Full name on the account"
                    />
                    {errors.accountHolderName && <span className="text-xs text-red-500">{errors.accountHolderName.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Bank name</label>
                    <input
                      {...register("bankName", { required: "Bank name is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Bank name"
                    />
                    {errors.bankName && <span className="text-xs text-red-500">{errors.bankName.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Account number</label>
                    <input
                      {...register("accountNumber", { required: "Account number is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="Account number"
                    />
                    {errors.accountNumber && <span className="text-xs text-red-500">{errors.accountNumber.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">IFSC / Swift</label>
                    <input
                      {...register("ifsc", { required: "IFSC / Swift is required" })}
                      className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                      placeholder="IFSC or SWIFT code"
                    />
                    {errors.ifsc && <span className="text-xs text-red-500">{errors.ifsc.message}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(2)} className="px-4 py-2 border rounded-md">
                    Back
                  </button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
                    Finish
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
