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
import { motion, AnimatePresence } from 'framer-motion';
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
    href: '/dashboard/all-products',
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
    <div className="h-full flex flex-col">
      {showProfile && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center gap-3 px-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-base font-bold text-white shadow-soft">
            {sellerProfile.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {sellerProfile.name}
            </p>
            <p className="text-xs text-slate-500">Seller workspace</p>
          </div>
        </motion.div>
      )}

      <nav className="flex flex-col gap-1.5">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  item.label === 'Logout'
                    ? 'mt-4 border-t border-slate-200/60 pt-4 text-rose-600 hover:bg-rose-50/80 hover:text-rose-700'
                    : ''
                } ${
                  active
                    ? 'bg-slate-900 text-white shadow-soft'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-900 rounded-xl shadow-soft"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon className={`h-5 w-5 relative z-10 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </motion.div>
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
    () => (
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-sm lg:hidden"
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 h-full w-full"
              onClick={handleClose}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 flex h-full w-[min(20rem,85%)] max-h-screen flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-soft">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6 scrollbar-custom">
                <SidebarContent
                  pathname={pathname}
                  onNavigate={handleClose}
                  showProfile={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [handleClose, mobileNavOpen, pathname, sellerProfile.initials]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Mobile Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-md shadow-xs lg:hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-soft">
              {sellerProfile.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {sellerProfile.name}
              </p>
              <p className="text-xs text-slate-500">Seller workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMobileNav}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
        </div>
      </motion.div>

      {overlay}

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 lg:border-r lg:border-slate-200/60 lg:bg-white/60 lg:backdrop-blur-md"
      >
        <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
          <SidebarContent pathname={pathname} />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 scrollbar-custom">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="h-full p-4 lg:p-6 xl:p-8 space-y-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
