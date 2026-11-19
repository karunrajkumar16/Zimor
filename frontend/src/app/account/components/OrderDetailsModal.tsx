'use client';

import React from 'react';
import Image from 'next/image';
import { X, Truck, Download, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { Order } from '@/types';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onDownloadInvoice: (orderNumber: string) => void;
  isDownloading: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onDownloadInvoice,
  isDownloading,
}) => {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <div className="bg-white max-w-2xl w-full border border-[#000000]/10 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#000000]/10 bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B44220]">
              Order Confirmation
            </span>
            <h2 id="order-details-title" className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
              Order #{order.orderNumber}
            </h2>
            <p className="font-secondary text-xs text-[#777777] mt-0.5">
              Placed on {order.date} • {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#B4B4B4]/40 hover:border-[#000000] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close order details modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Status & Tracking Banner */}
          <div className="bg-[#FAF8F5] border border-[#B4B4B4]/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#000000] uppercase tracking-wider">
                Fulfillment Status
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-[#000000]'
                }`}
              >
                {order.status}
              </span>
            </div>

            {order.trackingNumber && (
              <div className="pt-2 border-t border-[#000000]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#555555]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#B44220] shrink-0" />
                  <span>
                    Carrier: <strong>{order.courierName || 'FedEx Express'}</strong> • AWB:{' '}
                    <strong>{order.trackingNumber}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-[#777777]">
                  Estimated: {order.estimatedDelivery || 'In Transit'}
                </span>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#000000] border-b border-[#000000]/10 pb-2">
              Items Ordered
            </h3>
            <div className="divide-y divide-[#000000]/5">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 bg-[#FAF8F5] border border-[#B4B4B4]/30 overflow-hidden shrink-0">
                      <Image
                        src={item.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-medium text-xs sm:text-sm text-[#000000]">{item.name}</p>
                      <p className="text-[11px] text-[#777777]">
                        {item.color ? `Color: ${item.color} • ` : ''}Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-semibold text-[#000000]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-[#888888]">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Delivery Address */}
            <div className="p-4 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#000000] uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#B44220]" />
                <span>Delivery Address</span>
              </div>
              {order.shippingAddress ? (
                <div className="text-[#555555] space-y-0.5">
                  <p className="font-medium text-[#000000]">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1 || (order.shippingAddress as any).line1}</p>
                  {(order.shippingAddress.addressLine2 || (order.shippingAddress as any).line2) && (
                    <p>{order.shippingAddress.addressLine2 || (order.shippingAddress as any).line2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-[#888888] pt-1">Phone: {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-[#888888]">Standard Express Dispatch</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#000000] uppercase tracking-wider text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-[#B44220]" />
                <span>Payment Details</span>
              </div>
              <div className="space-y-1.5 text-[#555555]">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-[#000000]">{order.paymentMethod || 'Online Payment'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-medium text-emerald-700">Complimentary Express</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#000000]/10 font-bold text-sm text-[#000000]">
                  <span>Total Paid:</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#000000]/10 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated ZIMOR Transaction</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadInvoice(order.orderNumber)}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#000000] hover:bg-[#000000] hover:text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading...' : 'Tax Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#000000] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
