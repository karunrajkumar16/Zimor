'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, Download, Eye, ArrowRight, RotateCcw } from 'lucide-react';
import { Order } from '@/types';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersTabProps {
  orders: Order[];
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { addItem } = useCart();
  const { getProductBySlug } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [downloadingNumber, setDownloadingNumber] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  const handleDownloadInvoice = (orderNumber: string) => {
    setDownloadingNumber(orderNumber);
    setTimeout(() => {
      setDownloadingNumber(null);
      alert(`Digital Tax Invoice for Order #${orderNumber} has been downloaded.`);
    }, 1000);
  };

  const handleReorder = (item: Order['items'][number]) => {
    const p = getProductBySlug(item.slug);
    if (p) {
      addItem(p, item.quantity, item.color, item.size);
      setReorderMessage(`Added "${item.name}" to your shopping bag.`);
      setTimeout(() => setReorderMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
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
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-200 text-[#000000]'
                        }`}
                      >
                        {order.status}
                      </span>
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
                {order.trackingNumber && (
                  <div className="px-4 sm:px-5 py-2.5 bg-[#F5F2EB]/50 border-b border-[#000000]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2 text-[#333333]">
                      <Truck className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                      <span>
                        Carrier: <strong>{order.courierName || 'Courier Express'}</strong> • AWB:{' '}
                        <strong className="underline">{order.trackingNumber}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777777]">
                      Estimated Delivery: {order.estimatedDelivery || 'In Transit'}
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
                            {item.color ? `Color: ${item.color} • ` : ''}Qty: {item.quantity}
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
