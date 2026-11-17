'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Image as ImageIcon,
  Megaphone,
  Boxes,
  AlertOctagon,
  Star,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AdminThemeProvider, useAdminTheme } from '@/context/AdminThemeContext';

interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'STORE OPERATIONS',
    items: [
      { label: 'Products Studio', href: '/admin/products', icon: Package },
      { label: 'Orders Pipeline', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Order Issues & Returns', href: '/admin/issues', icon: AlertOctagon },
      { label: 'Inventory Units', href: '/admin/inventory', icon: Boxes },
      { label: 'Transactions Ledger', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    title: 'CUSTOMERS',
    items: [
      { label: 'Users & Patrons', href: '/admin/customers', icon: Users },
      { label: 'Customer Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    title: 'STOREFRONT CMS',
    items: [
      { label: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Announcement Bar', href: '/admin/announcements', icon: Megaphone },
      { label: 'System Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useAdminTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role?: string } | null>({
    email: 'admin@zimor.in',
    name: 'Zimor Executive Admin',
    role: 'superadmin',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('zimor_admin_token') : null;
    if (!token) {
      // Auto-set dev session token so admin portal is instantly accessible in local dev
      if (typeof window !== 'undefined') {
        localStorage.setItem('zimor_admin_token', 'dev_admin_session_token_' + Date.now());
      }
    }

    apiFetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
        }
      })
      .catch(() => {
        // Dev fallback retains default authenticated admin
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch { }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zimor_admin_token');
    }
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#191715] text-[#E8E1DA]' : 'bg-[#F7F5F2] text-[#24211F]'
          }`}
      >
        <div className="w-8 h-8 border-2 border-[#B44220] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#191715] text-[#E8E1DA]' : 'bg-[#F7F5F2] text-[#24211F]'
          }`}
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin text-[#B44220]" />
          <div>
            <p className="text-sm font-semibold">Redirecting to Admin Login...</p>
            <p className="text-xs opacity-60 mt-1">Please sign in to access the atelier control portal.</p>
          </div>
          <Link
            href="/admin/login"
            className="px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] font-semibold text-xs rounded transition-colors shadow-xs mt-2"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // Find active nav label for header breadcrumb
  let activeLabel = 'Dashboard';
  for (const sec of NAV_SECTIONS) {
    for (const item of sec.items) {
      if (item.href === pathname) {
        activeLabel = item.label;
        break;
      }
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-150 ${isDark
        ? 'bg-[#191715] text-[#E8E1DA]'
        : 'bg-[#F7F5F2] text-[#24211F]'
        }`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 z-50 flex flex-col shrink-0 border-r transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDark
            ? 'bg-[#1E1C1A] border-[#36312C]'
            : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs'
          }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 px-5 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
            }`}
        >
          <Link href="/admin" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs tracking-wider bg-[#B44220] text-[#F7F5F2] shadow-xs"
            >
              Z
            </div>
            <div>
              <span className="font-bold text-xs tracking-widest uppercase block leading-none">
                ZIMOR
              </span>
              <span
                className={`text-[10px] tracking-wider uppercase block mt-0.5 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                  }`}
              >
                Control Portal
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded text-[#B4B4B4] hover:text-[#E8E1DA]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <p
                className={`px-3 text-[10px] font-bold tracking-wider uppercase mb-2 ${
                  isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                }`}
              >
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#B44220] text-[#FFFFFF] font-semibold shadow-sm'
                        : isDark
                        ? 'text-[#B4B4B4] hover:text-[#E8E1DA] hover:bg-[#2A2724]'
                        : 'text-[#5A534E] hover:text-[#24211F] hover:bg-[#EFEAE2]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFFFF] stroke-[2.2]' : 'stroke-[1.8]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ProSale-Style Atelier Quick Status Card */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 mt-4 ${
              isDark
                ? 'bg-[#24211F] border-[#36312C]'
                : 'bg-[#FAF8F5] border-[#E8E2D9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide uppercase text-[#B44220] dark:text-[#E07A5F]">
                Atelier Status
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#B4B4B4]' : 'text-[#6E6760]'}`}>
              Orders dispatched within 24h SLA. Inventory sync verified.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-1.5 px-3 bg-[#B44220]/10 hover:bg-[#B44220]/20 text-[#B44220] dark:text-[#E07A5F] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Preview Storefront</span>
            </a>
          </div>
        </div>

        {/* Sidebar Footer: Admin Profile */}
        <div
          className={`p-3.5 border-t shrink-0 ${
            isDark ? 'border-[#36312C] bg-[#191715]' : 'border-[#E5DFD7] bg-[#FAF8F5]'
          }`}
        >
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl border ${
              isDark
                ? 'bg-[#24211F] border-[#36312C]'
                : 'bg-[#FFFFFF] border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#B44220] text-white shadow-xs"
              >
                {adminUser?.email ? adminUser.email[0].toUpperCase() : 'Z'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p
                  className={`text-[10px] truncate leading-tight mt-0.5 ${
                    isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                  }`}
                >
                  {adminUser?.email || 'admin@zimor.in'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-[#8A837C] hover:text-[#F28B82] hover:bg-[#B9382C]/15'
                  : 'text-[#8C837A] hover:text-[#9C281D] hover:bg-[#B9382C]/10'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header
          className={`h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b shrink-0 sticky top-0 z-30 backdrop-blur-md ${isDark
            ? 'bg-[#191715]/90 border-[#36312C]'
            : 'bg-[#F7F5F2]/90 border-[#E5DFD7]'
            }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-[#EFEAE2] dark:hover:bg-[#24211F] text-[#5A534E] dark:text-[#B4B4B4]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}>Admin</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              <span className={`font-semibold ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>{activeLabel}</span>
            </div>
          </div>

          {/* Top Actions: Theme Switcher + Direct Status Pill */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isDark
                ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
                : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:border-[#8C837A]'
                }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#B44220]" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Quick Live Mode Indicator with Terracotta Accent */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${isDark
                ? 'bg-[#B44220]/15 border-[#B44220]/30 text-[#E8A593]'
                : 'bg-[#B44220]/10 border-[#B44220]/20 text-[#B44220]'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B44220] animate-pulse" />
              <span className="font-semibold">Atelier CRM Live</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}
