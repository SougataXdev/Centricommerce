'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Boxes,
  CalendarCheck,
  CalendarPlus,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Percent,
  PlusCircle,
  Settings,
  ShoppingBag,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
  { label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
  {
    label: 'Create Product',
    icon: PlusCircle,
    href: '/dashboard/products/new',
  },
  { label: 'All Products', icon: Boxes, href: '/dashboard/products' },
  { label: 'Create Event', icon: CalendarPlus, href: '/dashboard/events/new' },
  { label: 'All Events', icon: CalendarCheck, href: '/dashboard/events' },
  { label: 'Inbox', icon: Inbox, href: '/dashboard/inbox' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  { label: 'Discount Codes', icon: Percent, href: '/dashboard/discounts' },
  { label: 'Logout', icon: LogOut, href: '/logout' },
];

const sellerProfile = {
  name: 'CentriMart Collective',
  initials: 'CC',
};

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  return pathname.startsWith(href);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pb-12 pt-8 lg:flex-row lg:px-8">
        <aside className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:w-72">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-base font-semibold text-blue-600">
                {sellerProfile.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {sellerProfile.name}
                </p>
                <p className="text-xs text-slate-500">Seller workspace</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-blue-50 hover:text-blue-600 ${
                      item.label === 'Logout'
                        ? 'mt-4 border-t border-slate-100 pt-4 text-rose-600 hover:bg-rose-50 hover:text-rose-600'
                        : ''
                    } ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-900/90 hover:text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
