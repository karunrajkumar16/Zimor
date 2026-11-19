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
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
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
    title: 'INTELLIGENCE & CRM',
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
    title: 'USER RELATIONSHIPS',
    items: [
      { label: 'Users Directory', href: '/admin/customers', icon: Users },
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
  const { toggleTheme, isDark } = useAdminTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'order' | 'inventory';
  }>>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.allSettled([
      apiFetch('/api/orders').then((r) => (r.ok ? r.json() : null)),
      apiFetch('/api/products').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ordersRes, productsRes]) => {
        const liveAlerts: Array<{
          id: string;
          title: string;
          subtitle: string;
          type: 'order' | 'inventory';
        }> = [];

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
          const orders = ordersRes.value.orders;
          const recentOrders = orders.slice(0, 3);
          for (const ord of recentOrders) {
            liveAlerts.push({
              id: ord._id || ord.orderNumber,
              title: `Order ${ord.orderNumber || ord._id?.slice(-6)} ${ord.status || 'Received'}`,
              subtitle: `${ord.items?.[0]?.productTitle || ord.items?.[0]?.title || 'Atelier Item'} • ₹${(ord.totalAmount || ord.total || 0).toLocaleString('en-IN')}`,
              type: 'order',
            });
          }
        }

        if (productsRes.status === 'fulfilled' && productsRes.value?.products) {
          const products = productsRes.value.products;
          const lowStock = products.filter(
            (p: any) => typeof p.inventory === 'number' && p.inventory > 0 && p.inventory <= 5
          );
          for (const p of lowStock.slice(0, 2)) {
            liveAlerts.push({
              id: p._id || p.slug,
              title: 'Inventory Threshold Alert',
              subtitle: `${p.title} remaining stock: ${p.inventory} units`,
              type: 'inventory',
            });
          }
        }

        setAlerts(liveAlerts);
      })
      .catch(() => {
        setAlerts([]);
      });
  }, [isAuthenticated]);

  const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');

  useEffect(() => {
    if (isLoginPage) return;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('admin_token');
      if (urlToken) {
        localStorage.setItem('zimor_admin_token', urlToken);
        window.history.replaceState({}, '', pathname || '/admin');
      }
    }

    apiFetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
        } else {
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        router.replace('/admin/login');
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

  let activeLabel = 'Executive Analytics';
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
      className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-150 ${isDark ? 'bg-[#191715] text-[#E8E1DA]' : 'bg-[#F7F5F2] text-[#24211F]'
        }`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Audi CRM-Style Precision Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 z-50 flex flex-col shrink-0 border-r transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDark
            ? 'bg-[#1E1C1A] border-[#36312C]'
            : 'bg-[#FFFFFF] border-[#E5DFD7]'
          }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 px-5 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
            }`}
        >
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs tracking-wider bg-[#B44220] text-[#F7F5F2]">
              Z
            </div>
            <div>
              <span className="font-bold text-xs tracking-widest uppercase block leading-none">
                ZIMOR
              </span>
              <span
                className={`text-[9px] font-mono tracking-wider uppercase block mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                  }`}
              >
                Executive CRM
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded text-[#8C837A] hover:text-[#24211F] dark:hover:text-[#E8E1DA]"
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
                className={`px-3 text-[9px] font-mono font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                      ? 'bg-[#B44220] text-[#FFFFFF] font-semibold'
                      : isDark
                        ? 'text-[#B4B4B4] hover:text-[#E8E1DA] hover:bg-[#2A2724]'
                        : 'text-[#5A534E] hover:text-[#24211F] hover:bg-[#F2ECE4]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFFFF] stroke-[2.2]' : 'stroke-[1.8]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${isActive
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

          {/* Quick SLA & Live System Status Badge */}
          <div
            className={`p-3 rounded-xl border space-y-1.5 mt-4 ${isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-[#FAF8F5] border-[#E8E2D9]'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#B44220] dark:text-[#E07A5F]">
                Atelier Telemetry
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 99.9%
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#8A837C]' : 'text-[#6E6760]'}`}>
              Verified MongoDB Atlas stream & Cloudinary CDN integration active.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-1.5 px-3 bg-[#B44220]/10 hover:bg-[#B44220]/20 text-[#B44220] dark:text-[#E07A5F] rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inspect Storefront</span>
            </a>
          </div>
        </div>

        {/* Sidebar Footer: Admin Profile */}
        <div
          className={`p-3.5 border-t shrink-0 ${isDark ? 'border-[#36312C] bg-[#191715]' : 'border-[#E5DFD7] bg-[#FAF8F5]'
            }`}
        >
          <div
            className={`flex items-center justify-between p-2 rounded-lg border ${isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-[#FFFFFF] border-[#E5DFD7]'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 bg-[#B44220] text-white">
                {adminUser?.email ? adminUser.email[0].toUpperCase() : 'Z'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p
                  className={`text-[10px] font-mono truncate leading-tight mt-0.5 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                    }`}
                >
                  {adminUser?.email || 'admin@zimor.in'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`p-1.5 rounded transition-colors ${isDark
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
            ? 'bg-[#191715]/95 border-[#36312C]'
            : 'bg-[#F7F5F2]/95 border-[#E5DFD7]'
            }`}
        >
          {/* Left: Breadcrumb / Section Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded hover:bg-[#EFEAE2] dark:hover:bg-[#24211F] text-[#5A534E] dark:text-[#B4B4B4]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className={`font-mono text-[11px] uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                ZIMOR Atelier
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-30" />
              <span className={`font-semibold text-xs tracking-tight ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>
                {activeLabel}
              </span>
            </div>
          </div>

          {/* Right: Notifications, Theme Switcher, Quick Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-lg border transition-colors ${isDark
                  ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
                  : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:border-[#8C837A]'
                  }`}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B44220]" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-xl border p-3 z-50 shadow-lg ${isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-[#FFFFFF] border-[#E5DFD7]'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-inherit">
                    <span className="text-xs font-semibold tracking-wider font-mono uppercase">
                      Atelier Alerts
                    </span>
                    <span className="text-[10px] text-[#B44220] font-mono">
                      {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
                    </span>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1.5 opacity-80" />
                      <p className="text-xs font-medium">All Systems Operational</p>
                      <p className="text-[10px] opacity-60 mt-0.5">No pending order alerts or inventory warnings</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2 rounded flex items-start gap-2 ${alert.type === 'inventory'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            }`}
                        >
                          {alert.type === 'inventory' ? (
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-[10px] opacity-80 mt-0.5">{alert.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isDark
                ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
                : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:border-[#8C837A]'
                }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-mono text-[11px]">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#B44220]" />
                  <span className="hidden sm:inline font-mono text-[11px]">DARK</span>
                </>
              )}
            </button>

            {/* Superadmin Role Badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${isDark
                ? 'bg-[#B44220]/10 border-[#B44220]/30 text-[#E8A593]'
                : 'bg-[#B44220]/10 border-[#B44220]/20 text-[#B44220]'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B44220]" />
              <span>SUPERADMIN</span>
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
