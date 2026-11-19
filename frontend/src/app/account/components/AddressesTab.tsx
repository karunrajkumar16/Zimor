'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Check, Edit2, Trash2, Star } from 'lucide-react';
import { UserAddress } from '@/context/AuthContext';
import { AddressModal } from './AddressModal';

interface AddressesTabProps {
  addresses: UserAddress[];
  onAddAddress: (address: Omit<UserAddress, 'id'>) => Promise<boolean>;
  onUpdateAddress: (id: string, updates: Partial<UserAddress>) => Promise<boolean>;
  onDeleteAddress: (id: string) => Promise<boolean>;
  onSetDefaultAddress: (id: string) => Promise<boolean>;
}

export const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: Omit<UserAddress, 'id'> | UserAddress): Promise<boolean> => {
    if ('id' in data) {
      const ok = await onUpdateAddress(data.id, data);
      if (ok) showToast('Delivery address updated.');
      return ok;
    } else {
      const ok = await onAddAddress(data);
      if (ok) showToast('New delivery address added.');
      return ok;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove address for "${name}"?`)) {
      const ok = await onDeleteAddress(id);
      if (ok) showToast('Address removed.');
    }
  };

  const handleSetDefault = async (id: string) => {
    const ok = await onSetDefaultAddress(id);
    if (ok) showToast('Default delivery address updated.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="border-b border-[#000000]/10 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
            Saved Delivery Addresses
          </h2>
          <p className="font-secondary text-xs text-[#777777] mt-0.5">
            Manage your shipping destinations for express dispatch and concierge packaging
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-[#B4B4B4]/30 p-10 sm:p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#B4B4B4]/40 flex items-center justify-center mx-auto text-[#000000]">
            <MapPin className="w-6 h-6 stroke-1" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-primary text-lg sm:text-xl font-normal text-[#000000]">
              No Saved Addresses
            </h3>
            <p className="font-secondary text-xs text-[#777777] leading-relaxed">
              Add your primary residence or office destination to enjoy seamless 1-click checkout across the ZIMOR atelier.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Address</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map((addr) => {
            const isDef = Boolean(addr.isDefault);

            return (
              <div
                key={addr.id}
                className={`bg-white border p-5 sm:p-6 flex flex-col justify-between transition-all ${
                  isDef
                    ? 'border-[#000000] ring-1 ring-[#000000]/10 shadow-xs'
                    : 'border-[#B4B4B4]/30 hover:border-[#000000]/60'
                }`}
              >
                <div className="space-y-3">
                  {/* Top tag & badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-[0.16em] px-2 py-0.5 bg-[#FAF8F5] border border-[#B4B4B4]/30 text-[#000000]">
                      {addr.label || 'Home'}
                    </span>
                    {isDef && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#B44220]">
                        <Star className="w-3 h-3 fill-current" />
                        Default Address
                      </span>
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-sm text-[#000000]">{addr.fullName}</p>
                    <p className="text-[#444444] leading-relaxed">
                      {addr.addressLine1 || (addr as any).line1}
                    </p>
                    {(addr.addressLine2 || (addr as any).line2) && (
                      <p className="text-[#555555]">
                        {addr.addressLine2 || (addr as any).line2}
                      </p>
                    )}
                    <p className="text-[#444444] font-medium">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[#777777] pt-1">
                      Phone: <strong className="text-[#000000]">{addr.phone}</strong>
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-[#000000]/10 flex items-center justify-between text-xs">
                  <div>
                    {!isDef && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] font-medium text-[#777777] hover:text-[#000000] underline transition-colors cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#000000] hover:text-[#B44220] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id, addr.fullName)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#888888] hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Add / Edit Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        editingAddress={editingAddress}
      />
    </div>
  );
};
