'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Star,
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
  Search,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AdminThemeProvider, useAdminTheme } from '@/context/AdminThemeContext';
import AdminDemoBanner from '@/components/admin/AdminDemoBanner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MENU',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'STORE OPERATIONS',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Orders Pipeline', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Inventory Units', href: '/admin/inventory', icon: Boxes },
      { label: 'Transactions', href: '/admin/payments', icon: CreditCard },
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
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'order' | 'inventory';
  }>>([]);

  // Detect touch-only devices to switch from hover to tap-based expansion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTouch = () => {
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const hoverNone = window.matchMedia('(hover: none)').matches;
        setIsTouchDevice(hasTouch && hoverNone);
      };
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
    }
  }, []);


  // Anti-flicker hover handlers with 160ms debounce buffer
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isExpanded = isTouchDevice ? isExpandedMobile : isHovered;

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
              subtitle: `${ord.items?.[0]?.name || ord.items?.[0]?.productTitle || ord.items?.[0]?.title || 'Atelier Item'} • ₹${(ord.totalAmount || ord.total || 0).toLocaleString('en-IN')}`,
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
        className={`min-h-screen flex items-center justify-center p-6 admin-panel-theme ${isDark ? 'bg-[#121824] text-[#E2E8F0]' : 'bg-[#F1F5F9] text-[#1C2434]'
          }`}
      >
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 admin-panel-theme ${isDark ? 'bg-[#121824] text-[#E2E8F0]' : 'bg-[#F1F5F9] text-[#1C2434]'
          }`}
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin text-[#2563EB]" />
          <div>
            <p className="text-sm font-semibold">Redirecting to Admin Login...</p>
            <p className="text-xs opacity-60 mt-1">Please sign in to access the control portal.</p>
          </div>
          <Link
            href="/admin/login"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-lg transition-colors shadow-xs mt-2"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

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
      className={`min-h-screen flex flex-col lg:flex-row admin-panel-theme transition-colors duration-150 ${isDark ? 'bg-[#121824] text-[#E2E8F0]' : 'bg-[#F1F5F9] text-[#1C2434]'
        }`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Spacer: reserves collapsed sidebar width (72px) so dashboard content never shifts on hover */}
      <div className="hidden lg:block w-[72px] shrink-0" />

      {/* TailAdmin Clean Modern SaaS Sidebar with Hover-Based Smooth Expand & Collapse */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isExpanded ? 'w-64 shadow-2xl' : 'w-64 lg:w-[72px] shadow-none'
          } ${isDark ? 'bg-[#1E1C1A] border-[#2E3A47]' : 'bg-white border-[#E2E8F0]'
          }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center justify-between border-b shrink-0 px-4 transition-all duration-300 ${isDark ? 'border-[#2E3A47]' : 'border-[#E2E8F0]'
            }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden min-w-0"
            title="ZIMOR Admin Panel"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-[#2563EB] text-white shadow-xs shrink-0">
              Z
            </div>
            <div
              className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 hidden lg:hidden'
                } ${isSidebarOpen ? 'opacity-100 max-w-[160px] !block' : ''}`}
            >
              <span className="font-bold text-base tracking-tight block leading-none text-[#1C2434] dark:text-white">
                ZIMOR
              </span>
              <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-[#64748B] hover:text-[#1C2434] dark:hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Touch toggle button on touch-enabled devices at desktop widths */}
          {isTouchDevice && (
            <button
              onClick={() => setIsExpandedMobile(!isExpandedMobile)}
              className="hidden lg:flex p-1.5 rounded-md text-[#64748B] hover:text-[#1C2434] dark:hover:text-white"
              aria-label={isExpandedMobile ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isExpandedMobile ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 lg:px-2.5 py-4 space-y-4 scrollbar-thin overflow-x-hidden">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Section Header: visible when expanded; subtle divider line when collapsed */}
              <div className="px-2">
                <p
                  className={`text-[11px] font-semibold text-[#8A99AD] dark:text-[#64748B] uppercase tracking-wider transition-all duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 max-h-6 mb-1.5' : 'opacity-0 max-h-0 hidden'
                    } ${isSidebarOpen ? 'opacity-100 max-h-6 mb-1.5 !block' : ''}`}
                >
                  {section.title}
                </p>
                {!isExpanded && !isSidebarOpen && (
                  <div className="h-px my-2 mx-1 bg-[#E2E8F0] dark:bg-[#2E3A47]/60" />
                )}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    title={!isExpanded && !isSidebarOpen ? item.label : undefined}
                    className={`group flex items-center justify-between rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#F1F5F9] dark:bg-[#252E3E] text-[#2563EB] dark:text-white font-semibold'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white hover:bg-[#252E3E]/70'
                        : 'text-[#64748B] hover:text-[#1C2434] hover:bg-[#F1F5F9]'
                    } ${
                      isExpanded || isSidebarOpen
                        ? 'px-3 py-2.5'
                        : 'px-0 py-2.5 justify-center'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 min-w-0 ${
                        isExpanded || isSidebarOpen ? 'flex-1' : 'justify-center'
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#2563EB] dark:text-white'
                            : 'text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1C2434] dark:group-hover:text-white'
                        }`}
                      />
                      <span
                        className={`truncate whitespace-nowrap transition-all duration-200 ${
                          isExpanded || isSidebarOpen
                            ? 'opacity-100 max-w-[150px]'
                            : 'opacity-0 max-w-0 hidden'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {(isExpanded || isSidebarOpen) && item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* SLA & Live System Status Badge */}
          <div className="pt-2">
            {isExpanded || isSidebarOpen ? (
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 transition-all duration-200 ${isDark ? 'bg-[#252E3E]/60 border-[#2E3A47]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1C2434] dark:text-white">
                    System Status
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live 99.9%
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  MongoDB Atlas stream &amp; Cloudinary CDN integration verified.
                </p>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-1.5 px-3 bg-white dark:bg-[#1E1C1A] border border-[#E2E8F0] dark:border-[#2E3A47] hover:border-[#2563EB] text-[#1C2434] dark:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live Storefront</span>
                </a>
              </div>
            ) : (
              <div
                className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 cursor-pointer"
                title="System Status: Live 99.9% • MongoDB Atlas Verified"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer: Admin Profile */}
        <div
          className={`border-t shrink-0 transition-all duration-300 ${isExpanded || isSidebarOpen ? 'p-3.5' : 'p-2'
            } ${isDark ? 'border-[#2E3A47] bg-[#1E1C1A]' : 'border-[#E2E8F0] bg-white'}`}
        >
          {isExpanded || isSidebarOpen ? (
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${isDark ? 'bg-[#252E3E]/50 border-[#2E3A47]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#2563EB] text-white">
                  {adminUser?.email ? adminUser.email[0].toUpperCase() : 'Z'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight text-[#1C2434] dark:text-white">
                    {adminUser?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate leading-tight mt-0.5">
                    {adminUser?.email || 'admin@zimor.in'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-md text-[#64748B] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="w-9 h-9 mx-auto rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs"
              title={`${adminUser?.name || 'Administrator'} (${adminUser?.email || 'admin@zimor.in'})`}
            >
              {adminUser?.email ? adminUser.email[0].toUpperCase() : 'Z'}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TailAdmin Top Navbar */}
        <header
          className={`h-16 px-6 sm:px-8 flex items-center justify-between border-b shrink-0 sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-[#1E1C1A]/95 border-[#2E3A47]' : 'bg-white/95 border-[#E2E8F0]'
            }`}
        >
          {/* Left: Mobile Toggle & Quick Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[#64748B]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Header Search Input matching TailAdmin screenshot */}
            <div className="hidden sm:flex items-center relative w-72">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search or type command..."
                readOnly
                onClick={() => {
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) searchInput.focus();
                }}
                className={`w-full pl-9 pr-12 py-1.5 rounded-lg text-sm border focus:outline-none transition-colors cursor-pointer ${isDark
                  ? 'bg-[#252E3E] border-[#2E3A47] text-[#E2E8F0] placeholder-[#78726C]'
                  : 'bg-[#F1F5F9] border-transparent text-[#1C2434] placeholder-[#94A3B8]'
                  }`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#2E3A47] text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#1E1C1A]">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Notifications, Theme Switcher, Quick Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className={`p-2 rounded-lg border text-sm transition-colors cursor-pointer ${isDark
                ? 'bg-[#252E3E] border-[#2E3A47] text-amber-400 hover:text-white'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1C2434]'
                }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-lg border text-sm transition-colors cursor-pointer ${isDark
                  ? 'bg-[#252E3E] border-[#2E3A47] text-[#E2E8F0]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1C2434]'
                  }`}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-xl border p-4 z-50 shadow-xl ${isDark ? 'bg-[#1E1C1A] border-[#2E3A47]' : 'bg-white border-[#E2E8F0]'
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-inherit">
                    <span className="text-sm font-semibold text-[#1C2434] dark:text-white">
                      Notifications
                    </span>
                    <span className="text-xs text-[#2563EB] font-medium">
                      {alerts.length} New
                    </span>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1.5 opacity-80" />
                      <p className="text-sm font-medium text-[#1C2434] dark:text-white">All Systems Operational</p>
                      <p className="text-xs text-[#64748B] mt-0.5">No pending alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded-lg flex items-start gap-2.5 ${alert.type === 'inventory'
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
                            <p className="font-medium text-xs">{alert.title}</p>
                            <p className="text-[11px] opacity-80 mt-0.5">{alert.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown Badge (TailAdmin Header Match) */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
                {adminUser?.email ? adminUser.email[0].toUpperCase() : 'Z'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none text-[#1C2434] dark:text-white">
                  {adminUser?.name || 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <AdminDemoBanner />
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
