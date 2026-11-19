'use client';

import React from 'react';
import Image from 'next/image';
import { Package, LogOut, Sparkles } from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';

interface AccountHeaderProps {
  user: UserProfile;
  ordersCount: number;
  onNavigateToOrders: () => void;
  onSignOut: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  user,
  ordersCount,
  onNavigateToOrders,
  onSignOut,
}) => {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ZP';

  return (
    <header className="border-b border-[#000000]/10 pb-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* User Identity & Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#B4B4B4]/40 shrink-0 flex items-center justify-center shadow-xs">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="font-primary text-base sm:text-lg font-medium text-[#000000] tracking-wider">
                {initials}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B44220]">
                <Sparkles className="w-2.5 h-2.5" />
                Atelier User
              </span>
            </div>
            <h1 className="font-primary text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
              {user.name}
            </h1>
            <p className="font-secondary text-xs text-[#777777] truncate max-w-xs sm:max-w-md">
              {user.email} • {user.designation || 'User'}
            </p>
          </div>
        </div>

        {/* Quick Account Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#000000] bg-white border border-[#B4B4B4]/40 hover:border-[#000000] transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders ({ordersCount})</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#555555] hover:text-[#B44220] bg-white border border-[#B4B4B4]/40 hover:border-[#B44220]/40 transition-colors cursor-pointer"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
