'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Truck,
  Download,
  MapPin,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Camera,
  Check,
  FileText,
} from 'lucide-react';
import { Order, OrderReturnRequest } from '@/types';
import { apiFetch } from '@/lib/api';
import { downloadOrderTaxInvoice } from '@/lib/invoiceDownload';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onDownloadInvoice?: (orderNumber: string) => void;
  isDownloading?: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order: initialOrder,
  onClose,
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false);
  const [trackingFeedback, setTrackingFeedback] = useState<string | null>(null);

  // Local invoice download state
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [invoiceFeedback, setInvoiceFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Return request form state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [returnReason, setReturnReason] = useState<string>('Damaged on Arrival (Transit Damage)');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState<string>('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  if (!order) return null;

  const handleRefreshTracking = async () => {
    setIsRefreshingTracking(true);
    setTrackingFeedback(null);
    try {
      const res = await apiFetch(`/api/shipping/orders/${order.orderNumber}/track`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        setTrackingFeedback('Shipment data synchronized with Shiprocket.');
      } else {
        setTrackingFeedback(data.message || 'Tracking update received.');
      }
    } catch {
      setTrackingFeedback('Could not fetch live updates. Showing latest record.');
    } finally {
      setIsRefreshingTracking(false);
      setTimeout(() => setTrackingFeedback(null), 4000);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    setInvoiceFeedback(null);
    const result = await downloadOrderTaxInvoice(order.orderNumber);
    setIsDownloadingInvoice(false);
    if (result.success) {
      setInvoiceFeedback({
        type: 'success',
        message: `Tax Invoice for Order #${order.orderNumber} downloaded successfully.`,
      });
      setTimeout(() => setInvoiceFeedback(null), 4500);
    } else {
      setInvoiceFeedback({
        type: 'error',
        message: result.error || 'Failed to download tax invoice. Please try again.',
      });
      setTimeout(() => setInvoiceFeedback(null), 5000);
    }
  };

  const handleSubmitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnFeedback(null);

    const isDefectOrDamage =
      returnReason.toLowerCase().includes('damage') ||
      returnReason.toLowerCase().includes('defect') ||
      returnReason.toLowerCase().includes('incorrect');

    if (isDefectOrDamage && !returnPhotoUrl.trim()) {
      setReturnFeedback({
        type: 'error',
        message: 'Photographs showing the reported defect or damage are mandatory for claim verification per ZIMOR Return Policy.',
      });
      return;
    }

    if (!returnDetails.trim() || returnDetails.trim().length < 5) {
      setReturnFeedback({
        type: 'error',
        message: 'Please provide a brief description of the issue (at least 5 characters).',
      });
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await apiFetch(`/api/orders/${order.orderNumber}/return-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: returnType,
          reason: returnReason,
          details: returnDetails.trim(),
          imageUrls: returnPhotoUrl.trim() ? [returnPhotoUrl.trim()] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit return request.');
      }

      setOrder((prev) => (prev ? { ...prev, returnRequest: data.returnRequest } : prev));
      setShowReturnForm(false);
      setReturnFeedback({
        type: 'success',
        message: data.message || 'Your return/exchange request has been successfully submitted.',
      });
    } catch (err: any) {
      setReturnFeedback({
        type: 'error',
        message: err.message || 'Could not submit request. Please try again.',
      });
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Calculate shipment progression (0 to 3)
  const getShipmentStep = (status?: string, shipStatus?: string): number => {
    const s = `${status || ''} ${shipStatus || ''}`.toUpperCase();
    if (s.includes('DELIVERED')) return 3;
    if (s.includes('OUT FOR DELIVERY')) return 2.5;
    if (s.includes('IN TRANSIT') || s.includes('SHIPPED')) return 2;
    if (s.includes('PICKED UP') || s.includes('DISPATCHED') || s.includes('PROCESSING') || s.includes('AWB')) return 1;
    return 0; // Confirmed / Order Placed
  };

  const currentStep = getShipmentStep(order.status, order.shiprocketStatus);
  const awb = order.awbCode || order.trackingNumber;
  const courier = order.courierPartner || order.courierName || 'Shiprocket';
  const isDelivered = order.status === 'Delivered';
  const returnReq = order.returnRequest;
  const hasActiveReturn = returnReq && returnReq.status && returnReq.status !== 'none';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <div className="bg-white max-w-2xl w-full border border-[#000000]/10 max-h-[92vh] flex flex-col shadow-2xl">
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
          {/* Invoice Feedback Notification */}
          {invoiceFeedback && (
            <div
              className={`p-3 text-xs flex items-center gap-2 rounded border ${
                invoiceFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {invoiceFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{invoiceFeedback.message}</span>
            </div>
          )}

          {/* Return Feedback Notification */}
          {returnFeedback && (
            <div
              className={`p-3 text-xs flex items-center gap-2 rounded border ${
                returnFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {returnFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{returnFeedback.message}</span>
            </div>
          )}

          {/* Status & Live Logistics Tracking Banner */}
          <div className="bg-[#FAF8F5] border border-[#B4B4B4]/30 p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#000000] uppercase tracking-wider">
                  Fulfillment Status
                </span>
                {order.shiprocketStatus && (
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Shiprocket: {order.shiprocketStatus}
                  </span>
                )}
              </div>
              <span
                className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Returned'
                    ? 'bg-purple-100 text-purple-800'
                    : order.status === 'Delayed'
                    ? 'bg-amber-100 text-amber-800'
                    : order.status === 'RTO'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-neutral-200 text-[#000000]'
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* In-Transit Exception / RTO Alert Banner */}
            {order.status === 'Delayed' && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Delivery Update:</strong> A temporary transit exception or delay was recorded by {courier}. Your delivery is being prioritized.
                </span>
              </div>
            )}
            {order.status === 'RTO' && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>
                  <strong>Return Initiated:</strong> This consignment is in Return to Origin (RTO) transit. Our concierge team has been notified.
                </span>
              </div>
            )}

            {/* Shipment Stepper Progress Bar */}
            <div className="pt-2 pb-1">
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-neutral-200 -z-0" />
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-[#B44220] transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentStep / 3) * 100)}%` }}
                />

                {/* Steps */}
                {[
                  { label: 'Confirmed', step: 0 },
                  { label: 'Dispatched', step: 1 },
                  { label: 'In Transit', step: 2 },
                  { label: 'Delivered', step: 3 },
                ].map((s) => {
                  const isCompleted = currentStep >= s.step;
                  const isCurrent = currentStep === s.step || (s.step === 2 && currentStep === 2.5);

                  return (
                    <div key={s.label} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#B44220] text-white'
                            : 'bg-white border-2 border-neutral-300 text-neutral-400'
                        } ${isCurrent ? 'ring-3 ring-[#B44220]/20' : ''}`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                          isCompleted ? 'text-[#000000]' : 'text-neutral-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AWB & Courier Metadata Row with Live Sync */}
            <div className="pt-2 border-t border-[#B4B4B4]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <p className="text-[#555555]">
                  Courier:{' '}
                  <span className="font-semibold text-[#000000]">{courier}</span>
                  {awb && (
                    <>
                      {' '}• AWB:{' '}
                      <span className="font-mono font-semibold text-[#000000]">{awb}</span>
                    </>
                  )}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-[11px] text-[#777777]">
                    Estimated Arrival: {order.estimatedDelivery}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {awb && (
                  <a
                    href={`https://shiprocket.co/tracking/${awb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#B44220] hover:text-black border border-[#B44220]/30 hover:border-black rounded transition-colors"
                  >
                    <span>Shiprocket Tracking ↗</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRefreshTracking}
                  disabled={isRefreshingTracking}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#000000] bg-white border border-[#B4B4B4]/40 hover:border-[#000000] rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingTracking ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingTracking ? 'Checking...' : 'Check Live Status'}</span>
                </button>
              </div>
            </div>

            {trackingFeedback && (
              <p className="text-[11px] text-[#B44220] font-medium pt-1 animate-fadeIn">
                {trackingFeedback}
              </p>
            )}

            {/* Recent Scans Micro Timeline */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="pt-2 border-t border-[#B4B4B4]/20 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#777777] tracking-wider block">
                  Latest Logistics Events ({order.trackingHistory.length})
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {order.trackingHistory.map((scan, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-[#555555]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B44220] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-black">{scan.activity || scan.status}</span>
                        {scan.location && <span className="text-neutral-500"> — {scan.location}</span>}
                      </div>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-mono">{scan.date}</span>
                    </div>
                  ))}
                </div>
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
                {order.razorpayPaymentId && (
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Payment ID:</span>
                    <span className="text-[#000000]">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.paymentStatus === 'Refunded'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus || 'Paid'}
                  </span>
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

          {/* ==================== 4. RETURN & EXCHANGE SECTION ==================== */}
          <div className="pt-2 border-t border-[#000000]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#B44220]" />
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#000000]">
                  Return & Exchange Service
                </h3>
              </div>
              <a
                href="/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#777777] hover:text-black underline underline-offset-4 transition-colors"
              >
                View Policy ↗
              </a>
            </div>

            {/* CASE A: Active Return Request Exists */}
            {hasActiveReturn && returnReq && (
              <div
                className={`p-4 border rounded space-y-2 text-xs ${
                  returnReq.status === 'requested'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : returnReq.status === 'approved'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : returnReq.status === 'completed'
                    ? 'bg-purple-50/70 border-purple-300 text-purple-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    {returnReq.status === 'requested' && 'Return Request Submitted (Under Review)'}
                    {returnReq.status === 'approved' && 'Return Request Approved'}
                    {returnReq.status === 'completed' && 'Return Completed & Refund Processed'}
                    {returnReq.status === 'rejected' && 'Return Request Declined'}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      returnReq.status === 'requested'
                        ? 'bg-amber-200 text-amber-900'
                        : returnReq.status === 'approved'
                        ? 'bg-emerald-200 text-emerald-900'
                        : returnReq.status === 'completed'
                        ? 'bg-purple-200 text-purple-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {returnReq.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11.5px] pt-1">
                  <p>
                    <strong>Service Type:</strong>{' '}
                    {returnReq.type === 'exchange' ? 'Product Exchange' : 'Return & Refund'}
                  </p>
                  <p>
                    <strong>Reason:</strong> {returnReq.reason}
                  </p>
                  {returnReq.details && (
                    <p className="text-neutral-700 italic">
                      &quot;{returnReq.details}&quot;
                    </p>
                  )}
                  {returnReq.adminNotes && (
                    <div className="mt-2 p-2.5 bg-white/80 border border-current/20 rounded">
                      <p className="font-semibold">Atelier Decision Notes:</p>
                      <p className="text-neutral-800">{returnReq.adminNotes}</p>
                    </div>
                  )}
                  {returnReq.refundInitiated && (
                    <div className="mt-2 p-2.5 bg-white/80 border border-emerald-300 rounded text-emerald-900">
                      <p className="font-semibold">Razorpay Refund Confirmed:</p>
                      <p>
                        ₹{(returnReq.refundAmount || order.total).toLocaleString('en-IN')} has been refunded. Refund ID: <span className="font-mono">{returnReq.refundId}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASE B: Delivered, No Return Request, Form Hidden */}
            {isDelivered && !hasActiveReturn && !showReturnForm && (
              <div className="p-4 bg-[#FAF8F5] border border-[#B4B4B4]/20 space-y-3 rounded">
                <div className="text-xs text-[#555555] space-y-1">
                  <p className="font-medium text-[#000000]">
                    Eligible for Return or Exchange under ZIMOR Policy
                  </p>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Claims for verified manufacturing defects, transit damage, or incorrect items must be reported within 24 hours of delivery. Photographs are mandatory for claim assessment. Unused exchanges for colour or size preference require intact tags and original packaging.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReturnForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Return / Exchange</span>
                </button>
              </div>
            )}

            {/* CASE C: Return Form Open */}
            {isDelivered && !hasActiveReturn && showReturnForm && (
              <form onSubmit={handleSubmitReturnRequest} className="p-4 bg-[#FAF8F5] border border-[#000000] space-y-4 rounded">
                <div className="flex items-center justify-between border-b border-[#000000]/10 pb-2">
                  <h4 className="font-primary text-sm font-semibold text-[#000000] uppercase tracking-wider">
                    Submit Return or Exchange Request
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(false)}
                    className="text-xs text-[#888888] hover:text-black"
                  >
                    Cancel
                  </button>
                </div>

                {/* Policy Notice Box */}
                <div className="p-3 bg-white border border-[#B44220]/30 rounded text-[11px] text-[#555555] space-y-1">
                  <p className="font-bold text-[#B44220] uppercase tracking-wider text-[10px]">
                    ZIMOR Policy Guidelines Notice
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Must be notified within 24 hours of delivery.</li>
                    <li>Clear photographs showing defect/damage are mandatory for verification.</li>
                    <li>Items must be unused, unwashed with tags and dust bag intact.</li>
                    <li>For customer-requested exchanges, two-way courier shipping applies.</li>
                  </ul>
                </div>

                {/* Request Type Selector */}
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-black uppercase tracking-wider text-[10px] block">
                    Select Request Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnType('return')}
                      className={`p-2.5 text-center border text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                        returnType === 'return'
                          ? 'bg-[#000000] text-white border-[#000000]'
                          : 'bg-white text-[#000000] border-[#B4B4B4]/40 hover:border-black'
                      }`}
                    >
                      Return & Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnType('exchange')}
                      className={`p-2.5 text-center border text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                        returnType === 'exchange'
                          ? 'bg-[#000000] text-white border-[#000000]'
                          : 'bg-white text-[#000000] border-[#B4B4B4]/40 hover:border-black'
                      }`}
                    >
                      Product Exchange
                    </button>
                  </div>
                </div>

                {/* Reason Dropdown */}
                <div className="space-y-1 text-xs">
                  <label htmlFor="return-reason-select" className="font-semibold text-black uppercase tracking-wider text-[10px] block">
                    Eligible Reason *
                  </label>
                  <select
                    id="return-reason-select"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2 bg-white border border-[#B4B4B4]/50 rounded text-xs text-black focus:outline-none focus:border-black"
                  >
                    <option value="Damaged on Arrival (Transit Damage)">Damaged on Arrival (Transit Damage)</option>
                    <option value="Manufacturing Defect / Stitching / Hardware">Manufacturing Defect / Stitching / Hardware</option>
                    <option value="Incorrect Item / Color Delivered">Incorrect Item / Color Delivered</option>
                    <option value="Size / Dimension Mismatch (Exchange)">Size / Dimension Mismatch (Exchange)</option>
                    <option value="Style / Color Preference (Exchange)">Style / Color Preference (Exchange)</option>
                  </select>
                </div>

                {/* Photographs (Mandatory for Damage/Defect) */}
                <div className="space-y-1 text-xs">
                  <label htmlFor="return-photo-url-input" className="font-semibold text-black uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Photo Evidence Link / URL</span>
                    <span className="text-[#B44220] font-normal lowercase">(mandatory for defect/damage claims)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="return-photo-url-input"
                      type="url"
                      placeholder="https://... photo showing product condition / tags"
                      value={returnPhotoUrl}
                      onChange={(e) => setReturnPhotoUrl(e.target.value)}
                      className="w-full p-2 pl-8 bg-white border border-[#B4B4B4]/50 rounded text-xs text-black focus:outline-none focus:border-black"
                    />
                    <Camera className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 text-xs">
                  <label htmlFor="return-details-textarea" className="font-semibold text-black uppercase tracking-wider text-[10px] block">
                    Detailed Explanation *
                  </label>
                  <textarea
                    id="return-details-textarea"
                    rows={3}
                    placeholder="Describe the condition, defects, or specific exchange request..."
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    className="w-full p-2 bg-white border border-[#B4B4B4]/50 rounded text-xs text-black focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#000000]/10">
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(false)}
                    className="px-4 py-2 border border-[#B4B4B4]/50 text-xs uppercase tracking-wider text-black hover:bg-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="px-5 py-2 bg-[#000000] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {submittingReturn ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}

            {/* CASE D: Not Delivered Yet */}
            {!isDelivered && !hasActiveReturn && (
              <div className="p-3 bg-[#FAF8F5] border border-[#B4B4B4]/20 rounded text-[11px] text-[#777777] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#000000] block mb-0.5">
                    Return Window Inactive (Pending Delivery)
                  </span>
                  <span>
                    Returns and exchanges can only be initiated after your order has been successfully Delivered. If your parcel is currently in transit, cancellation is not possible per our Cancellation Policy; you may refuse delivery at your doorstep upon arrival.
                  </span>
                </div>
              </div>
            )}
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
              onClick={handleDownloadInvoice}
              disabled={isDownloadingInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#000000] hover:bg-[#000000] hover:text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingInvoice ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingInvoice ? 'Generating PDF...' : 'Tax Invoice'}</span>
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
