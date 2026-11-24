'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Edit3,
  Check,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';
import { CustomerAvatar } from './CustomerAvatar';

interface ProfileTabProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [designation, setDesignation] = useState(user.designation || 'Atelier User');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorToast('Full name is required');
      return;
    }

    setIsSaving(true);
    setErrorToast(null);

    const ok = await onUpdateProfile({
      name: name.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
    });

    setIsSaving(false);
    if (ok) {
      setIsEditing(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } else {
      setErrorToast('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setDesignation(user.designation || 'Atelier User');
    setIsEditing(false);
    setErrorToast(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      {/* Toast notifications */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully in your ZIMOR account.</span>
        </div>
      )}

      {errorToast && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
          {errorToast}
        </div>
      )}

      {/* Header description */}
      <div className="border-b border-[#000000]/10 pb-3 flex items-center justify-between">
        <div>
          <h2 className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
            Personal Profile
          </h2>
          <p className="font-secondary text-xs text-[#777777] mt-0.5">
            Manage your personal identity, contact details, and concierge preferences
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#000000] text-xs font-medium uppercase tracking-wider text-[#000000] hover:bg-[#000000] hover:text-white transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-[#B4B4B4]/30 p-6 sm:p-8 space-y-6">
        {/* Profile Avatar & Header */}
        <div className="flex items-center gap-5 border-b border-[#000000]/10 pb-6">
          <CustomerAvatar
            src={user.avatar}
            name={user.name}
            email={user.email}
            size="xl"
          />

          <div className="space-y-1">
            <h3 className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
              {user.name}
            </h3>
            <p className="font-secondary text-xs text-[#777777]">
              {user.designation || 'Atelier User'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Verified Account</span>
            </div>
          </div>
        </div>

        {/* View mode or Edit mode */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none transition-colors"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Email Address (Managed by Google)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#B4B4B4]/30 text-xs text-[#777777] cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Profession / Designation */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                  Profession / Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none transition-colors"
                  placeholder="e.g. Architect, Creative Director"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#000000]/10">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2.5 border border-[#B4B4B4]/40 hover:border-[#000000] text-xs font-medium uppercase tracking-wider text-[#555555] hover:text-[#000000] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#B44220]" />
                  Full Name
                </span>
                <p className="font-medium text-sm text-[#000000]">{user.name}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888] flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#B44220]" />
                  Email Address
                </span>
                <p className="font-medium text-sm text-[#000000] truncate">{user.email}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#B44220]" />
                  Contact Number
                </span>
                <p className="font-medium text-sm text-[#000000]">{user.phone || '— Not provided'}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888] flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#B44220]" />
                  Profession
                </span>
                <p className="font-medium text-sm text-[#000000]">
                  {user.designation || 'Atelier User'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Your profile information is used for concierge communication, customized order dispatch, and invoice generation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
