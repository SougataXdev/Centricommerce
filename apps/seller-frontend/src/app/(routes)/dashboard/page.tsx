"use client";
import useSeller from '@/hooks/useSeller';
import { LineChart, Package, PlusCircle, Settings, Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="h-full flex flex-col gap-6">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Seller Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Track performance, manage listings, and stay connected with customers.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 mt-4 sm:mt-0">
          <button className="btn-secondary group">
            <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" /> 
            <span>Manage view</span>
          </button>
          <button className="btn-primary group">
            <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" /> 
            <span>New listing</span>
          </button>
        </div>
      </motion.header>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card-hover p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-xl font-bold text-white shadow-soft">
              {sellerProfile.initials}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-slate-900">
                {sellerProfile.name}
              </p>
              <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                {sellerProfile.address}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="badge-neutral">
              ✨ Gold merchant
            </span>
            <span>Member since 2022</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Last sync: 12 mins ago
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 p-6 shadow-medium text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-100">
              Weekly Insight
            </h2>
            <p className="mt-3 text-2xl font-bold">Peak sales window</p>
            <p className="mt-2 text-sm text-brand-50 leading-relaxed">
              Most sales occur between 4:00pm and 8:00pm WAT. Consider boosting
              flash deals during this window to maximise conversions.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-brand-100">Avg. order value</p>
                <p className="mt-1 text-xl font-bold text-white">$79.20</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-brand-100">Return rate</p>
                <p className="mt-1 text-xl font-bold text-white">1.2%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Performance Snapshot
          </h2>
          <button className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
            View all
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsHighlights.map((item, index) => {
            const Icon = item.icon;
            const isPositive = item.trend.startsWith('+');
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                className="group card-hover p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900 transition-all group-hover:scale-105">
                      {item.value}
                    </p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-soft transition-all group-hover:scale-110 group-hover:shadow-md">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isPositive ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                    <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
                    {item.trend}
                  </span>
                  <span className="text-xs text-slate-500">vs last period</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Orders
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Stay on top of fulfilment priorities and customer expectations.
            </p>
          </div>
          <button className="btn-secondary group">
            <Package className="h-4 w-4 transition-transform group-hover:scale-110" /> 
            <span>View all orders</span>
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200/60 shadow-xs">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500">
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
              {recentOrders.map((order, index) => (
                <motion.tr 
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.6 + (index * 0.05) }}
                  className="group cursor-pointer transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{order.customer}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${statusStyles[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        order.status === 'Fulfilled' ? 'bg-emerald-500' :
                        order.status === 'Processing' ? 'bg-blue-500 animate-pulse' :
                        'bg-amber-500'
                      }`}></span>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};

export default Page;
