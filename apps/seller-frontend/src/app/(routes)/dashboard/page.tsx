"use client";
import useSeller from '@/hooks/useSeller';
import { LineChart, Package, PlusCircle, Settings, Wallet } from 'lucide-react';

const analyticsHighlights = [
  {
    label: 'Revenue (30d)',
    value: '$24,870',
    trend: '+14.3%',
    icon: Wallet,
  },
  {
    label: 'Orders',
    value: '312',
    trend: '+6.2%',
    icon: Package,
  },
  {
    label: 'Conversion rate',
    value: '3.4%',
    trend: '+0.9%',
    icon: LineChart,
  },
];

const recentOrders = [
  {
    id: '#ORD-2048',
    customer: 'Amara Obi',
    total: '$182.40',
    status: 'Fulfilled',
    date: 'Oct 07, 2025',
  },
  {
    id: '#ORD-2047',
    customer: 'Daniel Mensah',
    total: '$96.00',
    status: 'Processing',
    date: 'Oct 07, 2025',
  },
  {
    id: '#ORD-2046',
    customer: 'Fatou Diallo',
    total: '$238.10',
    status: 'Pending',
    date: 'Oct 06, 2025',
  },
];

const sellerProfile = {
  name: 'CentriMart Collective',
  initials: 'CC',
  address: '42 Marina Boulevard, Victoria Island, Lagos, Nigeria',
};

const statusStyles: Record<string, string> = {
  Fulfilled: 'bg-emerald-50 text-emerald-600',
  Processing: 'bg-blue-50 text-blue-600',
  Pending: 'bg-amber-50 text-amber-600',
};

const Page = () => {

  const seller = useSeller();
  console.log("seller" ,seller)
  
  if (seller.isLoading) {
    return <div className="text-center text-slate-500">Loading...</div>;
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Seller dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Track performance, manage listings, and stay connected with
            customers.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <Settings className="h-4 w-4" /> Manage view
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            <PlusCircle className="h-4 w-4" /> New listing
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white">
              {sellerProfile.initials}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">
                {sellerProfile.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {sellerProfile.address}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Gold merchant
            </span>
            <span>Member since 2022</span>
            <span>Last sync: 12 mins ago</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 p-6 shadow-sm text-white">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Weekly insight
          </h2>
          <p className="mt-2 text-2xl font-semibold">Peak sales window</p>
          <p className="mt-2 text-sm text-blue-100">
            Most sales occur between 4:00pm and 8:00pm WAT. Consider boosting
            flash deals during this window to maximise conversions.
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <div>
              <p className="text-blue-100">Avg. order value</p>
              <p className="text-lg font-semibold text-white">$79.20</p>
            </div>
            <div>
              <p className="text-blue-100">Return rate</p>
              <p className="text-lg font-semibold text-white">1.2%</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Performance snapshot
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-emerald-600">
                  {item.trend}
                  <span className="ml-1 text-slate-500">vs last period</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent orders
            </h2>
            <p className="text-sm text-slate-500">
              Stay on top of fulfilment priorities and customer expectations.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <Package className="h-4 w-4" /> View all orders
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3">
                  Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{order.total}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[order.status] ??
                        'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Page;
