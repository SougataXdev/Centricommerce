'use client';

import useSeller from '@/hooks/useSeller';
import axiosInstance from '@/libs/axiosInterceptor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ChevronRight, Loader2, Percent, PlusIcon, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type DiscountType = 'percentage' | 'fixed';

type DiscountCode = {
  id: string;
  code: string;
  publicName?: string;
  discountType?: string;
  discountValue?: number;
  usageLimit?: number | null;
  usedCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  isActive?: boolean | null;
};

type CreateDiscountCodePayload = {
  code: string;
  publicName: string;
  discountType: DiscountType;
  discountValue: number;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

type DiscountCodeFormValues = {
  code: string;
  publicName: string;
  discountType: DiscountType;
  discountValue: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
};

const createInitialFormValues = (): DiscountCodeFormValues => ({
  code: '',
  publicName: '',
  discountType: 'percentage',
  discountValue: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
});

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDiscountValue = (code: DiscountCode) => {
  const value = Number(code.discountValue ?? 0);
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }
  if (code.discountType?.toLowerCase() === 'percentage') {
    return `${value}% off`;
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
  return `${formatter.format(value)} off`;
};

const getStatusStyles = (code: DiscountCode) => {
  const now = new Date();
  const expiry = code.endDate ? new Date(code.endDate) : null;
  const start = code.startDate ? new Date(code.startDate) : null;

  if (code.isActive === false) {
    return { label: 'Inactive', className: 'bg-rose-100 text-rose-700' };
  }

  if (start && start > now) {
    return { label: 'Scheduled', className: 'bg-sky-100 text-sky-700' };
  }

  if (expiry && expiry < now) {
    return { label: 'Expired', className: 'bg-amber-100 text-amber-700' };
  }

  return { label: 'Active', className: 'bg-emerald-100 text-emerald-700' };
};

const DiscountCodesPage = () => {
  const queryClient = useQueryClient();
  const sellerQuery = useSeller();
  const sellerId = sellerQuery.data?.id;

  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState<DiscountCodeFormValues>(() =>
    createInitialFormValues()
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [codePendingDelete, setCodePendingDelete] =
    useState<DiscountCode | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: discountCodes,
    isLoading: isCodesLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['discount-codes', sellerId],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/api/discountcodes', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(sellerId),
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (payload: CreateDiscountCodePayload) => {
      const response = await axiosInstance.post(
        '/products/api/discountcodes',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: async () => {
      setSubmitError(null);
      setShowModal(false);
      setFormValues(createInitialFormValues());
      await queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountCodeId: string) => {
      await axiosInstance.delete(
        `/products/api/discountcodes/${discountCodeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    },
    onSuccess: async () => {
      setDeleteError(null);
      setCodePendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const apiMessage = axiosErr.response?.data?.message;
      setDeleteError(
        apiMessage || axiosErr.message || 'Failed to delete discount code.'
      );
    },
  });

  const codes = useMemo<DiscountCode[]>(
    () => (Array.isArray(discountCodes) ? discountCodes : []),
    [discountCodes]
  );

  const isQueryEnabled = Boolean(sellerId);
  const showLoadingState =
    isCodesLoading || (!isQueryEnabled && sellerQuery.isLoading);
  const showErrorState = isQueryEnabled && Boolean(error);
  const showEmptyState =
    isQueryEnabled &&
    !showLoadingState &&
    !showErrorState &&
    codes.length === 0;
  const showNoSellerState =
    !sellerId && sellerQuery.isFetched && !sellerQuery.isLoading;
  const queryErrorMessage = showErrorState
    ? (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
      "We couldn't load your discount codes right now. Please try again."
    : '';
  const isDeleting = deleteDiscountCodeMutation.isPending;
  const pendingDeleteId = codePendingDelete?.id;

  const handleCreateClick = () => {
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSubmitError(null);
    setShowModal(false);
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === 'discountType') {
      setFormValues((prev) => ({
        ...prev,
        discountType: value === 'fixed' ? 'fixed' : 'percentage',
      }));
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteRequest = (discountCode: DiscountCode) => {
    deleteDiscountCodeMutation.reset();
    setDeleteError(null);
    setCodePendingDelete(discountCode);
  };

  const handleDismissDeleteModal = () => {
    if (deleteDiscountCodeMutation.isPending) {
      return;
    }
    setCodePendingDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!codePendingDelete) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteDiscountCodeMutation.mutateAsync(codePendingDelete.id);
    } catch (err) {
      // Error messaging handled in onError callback
    }
  };

  const handleDeleteBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      handleDismissDeleteModal();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!sellerId) {
      setSubmitError('Seller info not found. Please refresh and try again.');
      return;
    }

    const code = formValues.code.trim().toUpperCase();
    const publicName = formValues.publicName.trim();
    const discountType: CreateDiscountCodePayload['discountType'] =
      formValues.discountType === 'fixed' ? 'fixed' : 'percentage';
    const discountValue = Number(formValues.discountValue);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setSubmitError('Discount value must be greater than zero.');
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      setSubmitError('Percentage discount cannot exceed 100.');
      return;
    }

    const rawUsageLimit = formValues.usageLimit.trim();
    const numericUsageLimit =
      rawUsageLimit === '' ? null : Number(rawUsageLimit);

    if (
      numericUsageLimit !== null &&
      (!Number.isInteger(numericUsageLimit) || numericUsageLimit < 0)
    ) {
      setSubmitError('Usage limit must be a whole number.');
      return;
    }

    const startDateValue = formValues.startDate
      ? new Date(formValues.startDate)
      : null;
    if (
      formValues.startDate &&
      (!startDateValue || Number.isNaN(startDateValue.getTime()))
    ) {
      setSubmitError('Please provide a valid start date.');
      return;
    }

    const endDateValue = formValues.endDate
      ? new Date(formValues.endDate)
      : null;
    if (
      formValues.endDate &&
      (!endDateValue || Number.isNaN(endDateValue.getTime()))
    ) {
      setSubmitError('Please provide a valid end date.');
      return;
    }

    if (startDateValue && endDateValue && endDateValue < startDateValue) {
      setSubmitError('End date must be on or after the start date.');
      return;
    }

    try {
      await createDiscountCodeMutation.mutateAsync({
        code,
        publicName,
        discountType,
        discountValue,
        usageLimit: numericUsageLimit,
        startDate: startDateValue ? startDateValue.toISOString() : null,
        endDate: endDateValue ? endDateValue.toISOString() : null,
      });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const apiMessage = error.response?.data?.message;
      setSubmitError(
        apiMessage || error.message || 'Failed to create discount code.'
      );
    }
  };

  const isSubmitDisabled =
    createDiscountCodeMutation.isPending ||
    !sellerId ||
    !formValues.code.trim() ||
    !formValues.publicName.trim() ||
    !formValues.discountValue;

  const closeOnBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-y-2 text-xs sm:text-sm text-slate-500">
              <span className="cursor-pointer transition hover:text-slate-700">
                Dashboard
              </span>
              <ChevronRight size={14} className="mx-2 opacity-60" />
              <span className="cursor-pointer transition hover:text-slate-700">
                Products
              </span>
              <ChevronRight size={14} className="mx-2 opacity-60" />
              <span className="font-semibold text-slate-900">
                Discount Codes
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Percent className="h-4 w-4" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Discount Codes
                </h1>
                <p className="text-sm text-slate-500">
                  Manage and analyze promotional codes to keep your campaigns on
                  track.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {isFetching && !showLoadingState ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                Syncing latest data…
              </span>
            ) : null}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-800 hover:shadow-lg sm:w-auto"
              onClick={handleCreateClick}
            >
              <PlusIcon size={18} />
              Create Code
            </button>
          </div>
        </div>
      </header>

      {showLoadingState ? (
        <div className="flex h-[40vh] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
            <p className="text-sm font-medium">Fetching discount codes…</p>
          </div>
        </div>
      ) : showErrorState ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6">
          <p className="text-sm font-medium text-rose-700">
            {queryErrorMessage}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:text-rose-700 sm:w-auto"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : showNoSellerState ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Seller profile not found
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find your seller session. Please sign in again to
            continue.
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => sellerQuery.refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : showEmptyState ? (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Percent className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            No discount codes yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create tailored discount codes to reward loyal customers and drive
            conversions.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-800 hover:shadow-lg sm:w-auto"
            onClick={handleCreateClick}
          >
            <PlusIcon size={18} />
            Create your first code
          </button>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-700">
              Active campaigns
            </h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {codes.length} {codes.length === 1 ? 'code' : 'codes'} in catalog
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {codes.map((code) => {
              const status = getStatusStyles(code);
              const discountSummary = formatDiscountValue(code);
              const usageLimit =
                typeof code.usageLimit === 'number'
                  ? code.usageLimit
                  : undefined;
              const usedCount =
                typeof code.usedCount === 'number' &&
                !Number.isNaN(code.usedCount)
                  ? code.usedCount
                  : 0;
              const remaining =
                usageLimit !== undefined
                  ? Math.max(usageLimit - usedCount, 0)
                  : undefined;
              const usageSummary =
                usageLimit !== undefined
                  ? `${usedCount} used · ${remaining} remaining`
                  : `${usedCount} redemption${usedCount === 1 ? '' : 's'}`;
              const isCurrentDeleting =
                isDeleting && pendingDeleteId === code.id;

              return (
                <article
                  key={code.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Code
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        {code.code}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Offer
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {discountSummary}
                      </p>
                      {code.publicName ? (
                        <p className="text-xs text-slate-500">
                          {code.publicName}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Usage
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {usageSummary}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Validity
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(code.startDate)} —{' '}
                          {formatDate(code.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Created {formatDate(code.createdAt)}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 font-semibold text-rose-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => handleDeleteRequest(code)}
                        disabled={isCurrentDeleting}
                        aria-busy={isCurrentDeleting}
                      >
                        {isCurrentDeleting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Removing…
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Create Discount modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={closeOnBackdrop}
        >
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Create discount code
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Launch a new promotion
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Code
                  <input
                    type="text"
                    name="code"
                    value={formValues.code}
                    onChange={handleFieldChange}
                    placeholder="WINTER24"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Public name
                  <input
                    type="text"
                    name="publicName"
                    value={formValues.publicName}
                    onChange={handleFieldChange}
                    placeholder="Winter Savings"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Discount type
                  <select
                    name="discountType"
                    value={formValues.discountType}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Discount value
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="discountValue"
                    value={formValues.discountValue}
                    onChange={handleFieldChange}
                    placeholder="25"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Usage limit (optional)
                  <input
                    type="number"
                    min="0"
                    name="usageLimit"
                    value={formValues.usageLimit}
                    onChange={handleFieldChange}
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Starts
                    <input
                      type="date"
                      name="startDate"
                      value={formValues.startDate}
                      onChange={handleFieldChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Ends
                    <input
                      type="date"
                      name="endDate"
                      value={formValues.endDate}
                      onChange={handleFieldChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>
              </div>

              {submitError ? (
                <p className="text-sm font-medium text-rose-600">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white/70 sm:w-auto"
                >
                  {createDiscountCodeMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    'Save discount'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {codePendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={handleDeleteBackdropClick}
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Delete discount code
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Remove {codePendingDelete.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDismissDeleteModal}
                disabled={isDeleting}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <p className="text-sm text-slate-600">
                You&apos;re about to permanently remove this discount code.
                Customers won&apos;t be able to redeem it once deleted.
              </p>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">
                  {codePendingDelete.code}
                </p>
                {codePendingDelete.publicName ? (
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    {codePendingDelete.publicName}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  {formatDiscountValue(codePendingDelete)} · Valid{' '}
                  {formatDate(codePendingDelete.startDate)} —{' '}
                  {formatDate(codePendingDelete.endDate)}
                </p>
              </div>

              {deleteError ? (
                <p className="text-sm font-medium text-rose-600">
                  {deleteError}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleDismissDeleteModal}
                  disabled={isDeleting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-500 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-rose-400 disabled:text-white/80 sm:w-auto"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting…
                    </span>
                  ) : (
                    'Delete code'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodesPage;
