'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserAddress } from '@/context/AuthContext';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<UserAddress, 'id'> | UserAddress) => Promise<boolean>;
  editingAddress: UserAddress | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAddress,
}) => {
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label || 'Home');
      setFullName(editingAddress.fullName || '');
      setPhone(editingAddress.phone || '');
      setAddressLine1(editingAddress.addressLine1 || (editingAddress as any).line1 || '');
      setAddressLine2(editingAddress.addressLine2 || (editingAddress as any).line2 || '');
      setCity(editingAddress.city || '');
      setState(editingAddress.state || '');
      setPincode(editingAddress.pincode || '');
      setIsDefault(Boolean(editingAddress.isDefault));
    } else {
      setLabel('Home');
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
    }
    setError(null);
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      label,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault,
    };

    const success = await onSave(
      editingAddress ? { ...payload, id: editingAddress.id } : payload
    );

    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to save address. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-lg w-full border border-[#000000]/10 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#000000]/10 bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B44220]">
              Dispatch Destination
            </span>
            <h2 className="font-primary text-xl font-normal text-[#000000]">
              {editingAddress ? 'Edit Delivery Address' : 'Add New Address'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#B4B4B4]/40 hover:border-[#000000] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Label selector: Home / Work / Other */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
              Address Tag
            </label>
            <div className="flex gap-2">
              {['Home', 'Work', 'Atelier', 'Other'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setLabel(tag)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border transition-colors cursor-pointer ${
                    label === tag
                      ? 'bg-[#000000] text-white border-[#000000]'
                      : 'bg-white text-[#666666] border-[#B4B4B4]/40 hover:border-[#000000]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Receiver full name"
                className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
              Street Address / Flat / Building <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House/flat number, building name, street"
              className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
              Apartment / Landmark / Locality
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Area, nearby landmark (optional)"
              className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#000000]">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit PIN"
                className="w-full px-3 py-2 bg-white border border-[#B4B4B4]/50 focus:border-[#000000] text-xs text-[#000000] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-[#333333] cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
              <span>Set as default delivery address</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#000000]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#B4B4B4]/40 hover:border-[#000000] text-xs font-medium uppercase tracking-wider text-[#555555] hover:text-[#000000] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingAddress ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
