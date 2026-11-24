'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, Download, Eye, ArrowRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { OrderDetailsModal } from './OrderDetailsModal';
import { downloadOrderTaxInvoice } from '@/lib/invoiceDownload';

interface OrdersTabProps {
  orders: Order[];
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { addItem } = useCart();
  const { getProductBySlug } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [downloadingNumber, setDownloadingNumber] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const [invoiceToast, setInvoiceToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDownloadInvoice = async (orderNumber: string) => {
    setDownloadingNumber(orderNumber);
    setInvoiceToast(null);
    const result = await downloadOrderTaxInvoice(orderNumber);
    setDownloadingNumber(null);
    if (result.success) {
      setInvoiceToast({
        type: 'success',
        message: `Tax Invoice for Order #${orderNumber} downloaded successfully.`,
      });
      setTimeout(() => setInvoiceToast(null), 4000);
    } else {
      setInvoiceToast({
        type: 'error',
        message: result.error || 'Failed to download tax invoice. Please try again.',
      });
      setTimeout(() => setInvoiceToast(null), 5000);
    }
  };

  const handleReorder = (item: Order['items'][number]) => {
    const p = getProductBySlug(item.slug);
    if (p) {
      addItem(p, item.quantity, item.size);
      setReorderMessage(`Added "${item.name}" to your shopping bag.`);
      setTimeout(() => setReorderMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
      {invoiceToast && (
        <div
          className={`p-3 text-xs flex items-center justify-between rounded border ${
            invoiceToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {invoiceToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{invoiceToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setInvoiceToast(null)}
            className="text-xs font-semibold uppercase hover:underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {reorderMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{reorderMessage}</span>
          <Link href="/cart" className="font-semibold underline ml-2">
            View Bag →
          </Link>
        </div>
      )}

      {/* Header description */}
      <div className="border-b border-[#000000]/10 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
            Order History
          </h2>
          <p className="font-secondary text-xs text-[#777777] mt-0.5">
            {orders.length} order{orders.length === 1 ? '' : 's'} placed under your account
          </p>
        </div>

        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold text-[#000000] hover:text-[#B44220] transition-colors"
        >
          Explore Collection →
        </Link>
      </div>

      {/* Orders List or Empty State */}
      {orders.length === 0 ? (
        <div className="bg-white border border-[#B4B4B4]/30 p-10 sm:p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#B4B4B4]/40 flex items-center justify-center mx-auto text-[#000000]">
            <Package className="w-6 h-6 stroke-1" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-primary text-lg sm:text-xl font-normal text-[#000000]">
              No Orders Found
            </h3>
            <p className="font-secondary text-xs text-[#777777] leading-relaxed">
              When you purchase our handcrafted workbags or accessories, your order details and live dispatch tracking will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const firstItem = order.items?.[0];

            return (
              <article
                key={order.id || order.orderNumber}
                className="bg-white border border-[#B4B4B4]/30 hover:border-[#000000]/60 transition-colors"
              >
                {/* Order Top Ribbon */}
                <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#000000]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#888888]">
                      Order Reference
                    </span>
                    <p className="font-semibold text-sm text-[#000000]">#{order.orderNumber}</p>
                    <p className="text-[11px] text-[#777777]">Placed on {order.date}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#888888]">
                      Total Amount
                    </span>
                    <p className="font-semibold text-sm text-[#000000]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#777777]">{order.paymentMethod || 'Online Payment'}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#888888]">
                      Status
                    </span>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
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
                      {order.returnRequest && order.returnRequest.status !== 'none' && (
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${
                            order.returnRequest.status === 'requested'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : order.returnRequest.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : order.returnRequest.status === 'completed'
                              ? 'bg-purple-50 text-purple-900 border-purple-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          {order.returnRequest.status === 'requested' && 'Return Pending'}
                          {order.returnRequest.status === 'approved' && 'Return Approved'}
                          {order.returnRequest.status === 'completed' && 'Refunded'}
                          {order.returnRequest.status === 'rejected' && 'Return Declined'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#B4B4B4]/40 hover:border-[#000000] text-xs font-medium text-[#000000] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order.orderNumber)}
                      disabled={downloadingNumber === order.orderNumber}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#B4B4B4]/40 hover:border-[#000000] text-xs font-medium text-[#000000] transition-colors cursor-pointer disabled:opacity-50"
                      title="Download tax invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {downloadingNumber === order.orderNumber ? '...' : 'Invoice'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tracking Bar */}
                {(order.awbCode || order.trackingNumber) && (
                  <div className="px-4 sm:px-5 py-2.5 bg-[#F5F2EB]/50 border-b border-[#000000]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2 text-[#333333]">
                      <Truck className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                      <span>
                        Carrier: <strong>{order.courierPartner || order.courierName || 'Shiprocket'}</strong> • AWB:{' '}
                        <strong className="font-mono underline">{order.awbCode || order.trackingNumber}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777777]">
                      {order.shiprocketStatus ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {order.shiprocketStatus}
                        </span>
                      ) : (
                        `Estimated Delivery: ${order.estimatedDelivery || 'In Transit'}`
                      )}
                    </span>
                  </div>
                )}

                {/* Items in Order */}
                <div className="p-4 sm:p-5 divide-y divide-[#000000]/5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 bg-[#FAF8F5] border border-[#B4B4B4]/30 overflow-hidden shrink-0">
                          <Image
                            src={item.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                            alt={item.name}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 text-xs">
                          <p className="font-semibold text-sm text-[#000000]">{item.name}</p>
                          <p className="text-[11px] text-[#777777]">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-medium text-[#000000]">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleReorder(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#000000] hover:text-white text-xs font-medium text-[#000000] border border-[#B4B4B4]/30 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Buy Again</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onDownloadInvoice={handleDownloadInvoice}
        isDownloading={Boolean(downloadingNumber)}
      />
    </div>
  );
};
