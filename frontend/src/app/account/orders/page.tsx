'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, Download, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { Order } from '@/types';

export default function OrdersPage() {
  const { orders } = useAuth();
  const { addItem } = useCart();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = (orderNumber: string) => {
    setDownloadingId(orderNumber);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Invoice for Order #${orderNumber} generated and downloaded.`);
    }, 1000);
  };

  const handleReorder = (item: Order['items'][number]) => {
    const p = getProductBySlug(item.slug) || PRODUCTS[0];
    addItem(p, item.quantity, item.color, item.size);
  };

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/account" className="hover:text-ink">Account</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Order History</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-primary text-[30px] sm:text-[38px] font-normal text-ink tracking-tight">
              My Orders & Shipments
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Track courier transit, view item specifications, and access digital invoices.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-black hover:text-[#b4b4b4] underline self-start sm:self-auto"
          >
            Explore More Handbags →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-canvas-card rounded-lg border border-line space-y-4 max-w-md mx-auto p-8 shadow-xs">
            <Package className="w-12 h-12 mx-auto text-ink-muted" />
            <h2 className="text-base font-bold text-ink">No orders found</h2>
            <p className="text-xs text-ink-muted">When you place an order, it will appear here with live tracking.</p>
            <Link
              href="/shop"
              className="inline-block bg-ink hover:bg-ink-secondary text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-canvas-card border border-line rounded-lg overflow-hidden shadow-xs divide-y divide-line"
              >
                {/* Header */}
                <div className="p-4 sm:p-6 bg-canvas flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                      Order Reference
                    </span>
                    <p className="text-sm font-bold text-ink">{order.orderNumber}</p>
                    <p className="text-[11px] text-ink-muted">Date Placed: {order.date}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                      Total Amount
                    </span>
                    <p className="text-sm font-bold text-ink">₹{order.total.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-ink-muted">{order.paymentMethod}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                      Shipment Status
                    </span>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-black'
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order.orderNumber)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas-card border border-line hover:border-ink rounded text-xs font-medium text-ink transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === order.orderNumber ? 'Generating...' : 'Invoice'}</span>
                    </button>
                  </div>
                </div>

                {/* Tracking Ribbon */}
                <div className="p-4 bg-[#f8f8f8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-black">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-black shrink-0" />
                    <span>
                      Carrier: <strong>{order.courierName}</strong> • AWB Tracking Number:{' '}
                      <strong className="underline">{order.trackingNumber}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#555555] font-semibold">
                    Delivery: {order.estimatedDelivery}
                  </span>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-canvas-alt rounded border border-line overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-xs sm:text-sm font-bold text-ink hover:text-black transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-ink-muted">
                            Color: <span className="text-ink font-medium">{item.color}</span> • Size: {item.size}
                          </p>
                          <p className="text-xs font-semibold text-ink">
                            ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleReorder(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-line hover:bg-canvas-alt rounded text-xs font-medium text-ink transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-black" />
                          <span>Buy Again</span>
                        </button>

                        <Link
                          href={`/product/${item.slug}#reviews`}
                          className="px-3 py-1.5 bg-ink hover:bg-ink-secondary text-white rounded text-xs font-medium transition-colors"
                        >
                          Write Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Destination */}
                <div className="p-4 sm:p-6 bg-canvas text-xs text-ink-secondary flex flex-col sm:flex-row justify-between gap-4 border-t border-line">
                  <div>
                    <p className="font-semibold text-ink">Shipping Destination:</p>
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                  <div className="text-left sm:text-right text-[11px] text-ink-muted space-y-0.5">
                    <p>Free Express Shipping Applied</p>
                    <p>7-Day Return Eligible</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

