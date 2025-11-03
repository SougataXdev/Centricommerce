'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import {
  Bell,
  Boxes,
  CalendarCheck,
  CalendarPlus,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Menu,
  LogOut,
  Percent,
  PlusCircle,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react';
import useSeller from '@/hooks/useSeller';

type NavItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  exact?: boolean;
  excludePaths?: string[];
};

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard', exact: true },
  { label: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
  { label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
  {
    label: 'Create Product',
    icon: PlusCircle,
    href: '/dashboard/products/new',
    exact: true,
  },
  {
    label: 'All Products',
    icon: Boxes,
    href: '/dashboard/products',
    excludePaths: ['/dashboard/products/new'],
  },
  {
    label: 'Create Event',
    icon: CalendarPlus,
    href: '/dashboard/events/new',
    exact: true,
  },
  {
    label: 'All Events',
    icon: CalendarCheck,
    href: '/dashboard/events',
    excludePaths: ['/dashboard/events/new'],
  },
  { label: 'Inbox', icon: Inbox, href: '/dashboard/inbox' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  { label: 'Discount Codes', icon: Percent, href: '/dashboard/discount-codes' },
  { label: 'Logout', icon: LogOut, href: '/logout', exact: true },
];

// const sellerProfile = {
//   name: seller.name || 'CentriMart Collective'
// }

const normalizePath = (path: string): string => {
  if (path === '/') return '/';
  return path.replace(/\/$/, '');
};

function isActiveRoute(pathname: string, item: NavItem) {
  const currentPath = normalizePath(pathname.split('?')[0]);
  const itemHref = normalizePath(item.href);

  if (itemHref === '/dashboard') {
    return currentPath === '/dashboard';
  }

  if (currentPath === itemHref) {
    return true;
  }

  if (item.exact) {
    return false;
  }

  if (!currentPath.startsWith(`${itemHref}/`)) {
    return false;
  }

  if (
    item.excludePaths?.some((excluded) =>
      currentPath.startsWith(normalizePath(excluded))
    )
  ) {
    return false;
  }

  return true;
}

function SidebarContent({
  pathname,
  onNavigate,
  showProfile = true,
}: {
  pathname: string;
  onNavigate?: () => void;
  showProfile?: boolean;
}) {
  const seller = useSeller();

  if (!seller) {
    throw new Error('Seller not found');
  }

  const sellerProfile = {
    name: seller.data?.name || 'CentriMart Collective',
    initials: seller.data?.name
      ? seller.data.name
          .split(' ')
          .map((word:any) => word.charAt(0).toUpperCase())
          .join('')
      : 'CC',
    image: seller.data?.profileImage || '/default-profile.png',
    email: seller.data?.email,
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      {showProfile && (
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
      )}

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
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
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const seller = useSeller();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const handleClose = useCallback(() => setMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(
    () => setMobileNavOpen((prev) => !prev),
    []
  );

  const sellerProfile = useMemo(() => ({
    name: seller?.data?.name || 'CentriMart Collective',
    initials: seller?.data?.name
      ? seller.data.name
          .split(' ')
          .map((word: any) => word.charAt(0).toUpperCase())
          .join('')
      : 'CC',
    image: seller?.data?.profileImage || '/default-profile.png',
    email: seller?.data?.email,
  }), [seller?.data?.name, seller?.data?.profileImage, seller?.data?.email]);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const overlay = useMemo(
    () =>
      mobileNavOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 h-full w-full"
            onClick={handleClose}
          />
          <div className="relative z-10 flex h-full w-[min(20rem,85%)] max-h-screen flex-col bg-white/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-sm font-semibold text-blue-600">
                  {sellerProfile.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Navigation
                  </p>
                  <p className="text-xs text-slate-500">Quick access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
              <SidebarContent
                pathname={pathname}
                onNavigate={handleClose}
                showProfile={false}
              />
            </div>
          </div>
        </div>
      ) : null,
    [handleClose, mobileNavOpen, pathname]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/80 px-4 py-4 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={toggleMobileNav}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </div>
      </div>

      {overlay}

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pb-12 pt-8 lg:flex-row lg:px-8">
        <aside className="hidden lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:w-72">
          <SidebarContent pathname={pathname} />
        </aside>

        <main className="flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
