'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Heart,
  LogOut,
} from 'lucide-react';

export type AccountTab =
  | 'overview'
  | 'orders'
  | 'profile'
  | 'addresses'
  | 'wishlist';

interface AccountNavProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  onSignOut: () => void;
  ordersCount: number;
  addressesCount: number;
  wishlistCount: number;
}

export const AccountNav: React.FC<AccountNavProps> = ({
  activeTab,
  onSelectTab,
  onSignOut,
  ordersCount,
  addressesCount,
  wishlistCount,
}) => {
  const navItems: {
    id: AccountTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      count: ordersCount,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      count: addressesCount,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      count: wishlistCount,
    },
  ];

  return (
    <>
      {/* Mobile Horizontal Navigation Tab Strip */}
      <div className="lg:hidden border-b border-[#000000]/10 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-2 min-w-max py-1" aria-label="Account Tabs Mobile">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#000000] text-[#000000] font-semibold'
                    : 'border-transparent text-[#777777] hover:text-[#000000]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#000000]' : 'text-[#999999]'}`} />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      isActive
                        ? 'bg-[#000000] text-white'
                        : 'bg-[#FAF8F5] text-[#777777] border border-[#B4B4B4]/30'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop Editorial Left Sidebar Navigation */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-1" aria-label="Account Tabs Desktop">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#888888] px-3.5 pb-2">
          Patron Menu
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium transition-all text-left cursor-pointer border-l-2 ${
                  isActive
                    ? 'border-[#000000] bg-[#FAF8F5] text-[#000000] font-semibold shadow-xs'
                    : 'border-transparent text-[#666666] hover:text-[#000000] hover:bg-neutral-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#000000]' : 'text-[#888888]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-[#000000] text-white'
                        : 'bg-[#FAF8F5] text-[#666666] border border-[#B4B4B4]/40'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[#000000]/10">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium text-[#777777] hover:text-[#B44220] hover:bg-red-50/40 border-l-2 border-transparent transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-[#888888]" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};
