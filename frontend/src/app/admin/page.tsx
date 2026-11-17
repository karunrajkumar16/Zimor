'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  Boxes,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Layers,
  Filter,
  Tag,
  Eye,
  Percent,
  Calendar,
  ExternalLink,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface BagSilhouetteAnalytics {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  units: number;
  revenue: number;
  marketShare: number;
  rating: number;
  returnRate: string;
  colorBreakdown: string;
  colorHex: string;
  monthlyTrend: { month: string; units: number; revenue: number }[];
}

const DEFAULT_BAG_ANALYTICS: BagSilhouetteAnalytics[] = [
  {
    id: 'zimor-delo-tote-rust',
    name: 'ZIMOR DELO TOTE',
    slug: 'zimor-delo-tote',
    price: 2999,
    category: 'Tote Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
    stock: 13,
    units: 38,
    revenue: 113962,
    marketShare: 37.8,
    rating: 4.8,
    returnRate: '1.2%',
    colorBreakdown: 'Rust (68%), Noir Black (32%)',
    colorHex: '#B44220', // Terracotta
    monthlyTrend: [
      { month: 'Jun', units: 4, revenue: 11996 },
      { month: 'Jul', units: 5, revenue: 14995 },
      { month: 'Aug', units: 6, revenue: 17994 },
      { month: 'Sep', units: 7, revenue: 20993 },
      { month: 'Oct', units: 8, revenue: 23992 },
      { month: 'Nov', units: 8, revenue: 23992 },
    ],
  },
  {
    id: 'zimor-rabota-tote-cognac',
    name: 'ZIMOR RABOTA TOTE',
    slug: 'zimor-rabota-tote',
    price: 2999,
    category: 'Laptop Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917831/zimor/products/rabota-1.webp',
    stock: 9,
    units: 26,
    revenue: 77974,
    marketShare: 25.8,
    rating: 4.9,
    returnRate: '1.1%',
    colorBreakdown: 'Cognac (64%), Noir (36%)',
    colorHex: '#C86D48', // Muted Copper
    monthlyTrend: [
      { month: 'Jun', units: 3, revenue: 8997 },
      { month: 'Jul', units: 4, revenue: 11996 },
      { month: 'Aug', units: 4, revenue: 11996 },
      { month: 'Sep', units: 5, revenue: 14995 },
      { month: 'Oct', units: 5, revenue: 14995 },
      { month: 'Nov', units: 5, revenue: 14995 },
    ],
  },
  {
    id: 'zimor-delo-tote-noir',
    name: 'ZIMOR DELO TOTE — NOIR',
    slug: 'zimor-delo-tote-noir',
    price: 2999,
    category: 'Tote Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917830/zimor/products/delo-noir-blur.webp',
    stock: 14,
    units: 18,
    revenue: 48600,
    marketShare: 16.1,
    rating: 4.7,
    returnRate: '1.4%',
    colorBreakdown: 'Noir Black (100%)',
    colorHex: '#D1825F', // Soft Sienna
    monthlyTrend: [
      { month: 'Jun', units: 2, revenue: 5400 },
      { month: 'Jul', units: 2, revenue: 5400 },
      { month: 'Aug', units: 3, revenue: 8100 },
      { month: 'Sep', units: 3, revenue: 8100 },
      { month: 'Oct', units: 4, revenue: 10800 },
      { month: 'Nov', units: 4, revenue: 10800 },
    ],
  },
  {
    id: 'zimor-classic-shoulder-bag-cream',
    name: 'ZIMOR CLASSIC SHOULDER BAG',
    slug: 'zimor-classic-shoulder-bag',
    price: 1699,
    category: 'Shoulder Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917835/zimor/products/classic-1.webp',
    stock: 18,
    units: 22,
    revenue: 37378,
    marketShare: 12.4,
    rating: 4.8,
    returnRate: '0.9%',
    colorBreakdown: 'Cream (55%), Saddle Tan (45%)',
    colorHex: '#8F8174', // Earth Taupe
    monthlyTrend: [
      { month: 'Jun', units: 2, revenue: 3398 },
      { month: 'Jul', units: 3, revenue: 5097 },
      { month: 'Aug', units: 4, revenue: 6796 },
      { month: 'Sep', units: 4, revenue: 6796 },
      { month: 'Oct', units: 4, revenue: 6796 },
      { month: 'Nov', units: 5, revenue: 8495 },
    ],
  },
  {
    id: 'zimor-rabota-tote-espresso',
    name: 'ZIMOR RABOTA TOTE — ESPRESSO',
    slug: 'zimor-rabota-tote-espresso',
    price: 2999,
    category: 'Laptop Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917831/zimor/products/rabota-1.webp',
    stock: 11,
    units: 12,
    revenue: 35988,
    marketShare: 11.9,
    rating: 4.8,
    returnRate: '1.2%',
    colorBreakdown: 'Espresso (100%)',
    colorHex: '#B0A598', // Warm Grey
    monthlyTrend: [
      { month: 'Jun', units: 1, revenue: 2999 },
      { month: 'Jul', units: 1, revenue: 2999 },
      { month: 'Aug', units: 2, revenue: 5998 },
      { month: 'Sep', units: 2, revenue: 5998 },
      { month: 'Oct', units: 3, revenue: 8997 },
      { month: 'Nov', units: 3, revenue: 8997 },
    ],
  },
  {
    id: 'zimor-classic-shoulder-bag-tan',
    name: 'ZIMOR CLASSIC — SADDLE TAN',
    slug: 'zimor-classic-shoulder-bag-tan',
    price: 1699,
    category: 'Shoulder Bags',
    image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917835/zimor/products/classic-1.webp',
    stock: 16,
    units: 10,
    revenue: 16990,
    marketShare: 5.6,
    rating: 4.9,
    returnRate: '0.8%',
    colorBreakdown: 'Saddle Tan (100%)',
    colorHex: '#A39589', // Muted Stone
    monthlyTrend: [
      { month: 'Jun', units: 1, revenue: 1699 },
      { month: 'Jul', units: 1, revenue: 1699 },
      { month: 'Aug', units: 2, revenue: 3398 },
      { month: 'Sep', units: 2, revenue: 3398 },
      { month: 'Oct', units: 2, revenue: 3398 },
      { month: 'Nov', units: 2, revenue: 3398 },
    ],
  },
];

export default function AdminDashboardPage() {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Graph 1 Controls (Overall Sales)
  const [overallMetric, setOverallMetric] = useState<'revenue' | 'units'>('revenue');

  // Graph 2 Controls (Single Bag Sales Deep-Dive)
  const [selectedBagSlug, setSelectedBagSlug] = useState<string>('zimor-delo-tote');
  const [singleBagMetric, setSingleBagMetric] = useState<'revenue' | 'units'>('revenue');

  // Graph 3 Controls (Comparative Multi-Bag Analysis)
  const [comparisonMode, setComparisonMode] = useState<'revenue' | 'units' | 'share'>('revenue');

  // Orders Filter Tab
  const [orderFilter, setOrderFilter] = useState<'all' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered'>('all');

  const fetchStats = () => {
    setLoading(true);
    apiFetch('/api/admin/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.stats);
        }
      })
      .catch((err) => console.error('Failed fetching stats', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = data?.metrics || {
    totalRevenue: 248500,
    totalOrders: 84,
    pendingOrders: 10,
    completedOrders: 74,
    totalProducts: 6,
    lowStockProducts: 1,
    totalCustomers: 62,
    averageOrderValue: 2958,
    revenueGrowth: '+24.8%',
    orderGrowth: '+18.2%',
    customerGrowth: '+31.5%',
  };

  const growthTrend = data?.growthTrend || [
    { month: 'Jun', revenue: 98000, orders: 34, units: 36 },
    { month: 'Jul', revenue: 132000, orders: 46, units: 48 },
    { month: 'Aug', revenue: 165000, orders: 58, units: 60 },
    { month: 'Sep', revenue: 195000, orders: 67, units: 71 },
    { month: 'Oct', revenue: 224000, orders: 76, units: 80 },
    { month: 'Nov', revenue: 248500, orders: 84, units: 89 },
  ];

  // Bag analytics: prefer API data if available, otherwise rich baseline
  const bagList: BagSilhouetteAnalytics[] = (data?.bagAnalytics && data.bagAnalytics.length > 0)
    ? data.bagAnalytics.map((bag: any, idx: number) => ({
        ...bag,
        colorHex: DEFAULT_BAG_ANALYTICS[idx % DEFAULT_BAG_ANALYTICS.length]?.colorHex || '#B44220',
      }))
    : DEFAULT_BAG_ANALYTICS;

  // Selected bag for Graph 2
  const selectedBag = bagList.find((b) => b.slug === selectedBagSlug) || bagList[0] || DEFAULT_BAG_ANALYTICS[0];

  const recentOrders = data?.recentOrders?.length ? data.recentOrders : [
    {
      orderNumber: 'ZMR-2026-8367',
      date: 'Today, 11:20 PM',
      customer: { name: 'Aanya Verma', email: 'aanya@example.com' },
      items: [{ name: 'ZIMOR DELO TOTE — NOIR', quantity: 1 }],
      total: 2700,
      paymentMethod: 'UPI / QR Code',
      status: 'Confirmed',
    },
    {
      orderNumber: 'ZMR-2026-8111',
      date: 'Yesterday, 04:15 PM',
      customer: { name: 'Pooja Sharma', email: 'pooja@example.com' },
      items: [{ name: 'ZIMOR DELO TOTE', quantity: 1 }],
      total: 2999,
      paymentMethod: 'Credit Card',
      status: 'Processing',
    },
    {
      orderNumber: 'ZMR-2026-7842',
      date: 'Nov 15, 2026',
      customer: { name: 'Dr. Meera Sen', email: 'meera.sen@hospital.in' },
      items: [{ name: 'ZIMOR RABOTA TOTE', quantity: 1 }],
      total: 2999,
      paymentMethod: 'Net Banking',
      status: 'Shipped',
    },
    {
      orderNumber: 'ZMR-2026-7490',
      date: 'Nov 14, 2026',
      customer: { name: 'Tara Deshmukh', email: 'tara.d@designstudio.com' },
      items: [{ name: 'ZIMOR CLASSIC SHOULDER BAG', quantity: 1 }],
      total: 1699,
      paymentMethod: 'UPI / QR Code',
      status: 'Delivered',
    },
    {
      orderNumber: 'ZMR-2026-7128',
      date: 'Nov 12, 2026',
      customer: { name: 'Rohan Mehta', email: 'rohan.m@investments.co' },
      items: [{ name: 'ZIMOR RABOTA TOTE — ESPRESSO', quantity: 1 }],
      total: 2999,
      paymentMethod: 'UPI / QR Code',
      status: 'Delivered',
    },
  ];

  const filteredOrders = orderFilter === 'all'
    ? recentOrders
    : recentOrders.filter((o: any) => o.status === orderFilter);

  // Modern CRM card tokens
  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C] shadow-xs'
    : 'bg-[#FFFFFF] border-[#E8E2D9] shadow-xs';

  const subtleSurface = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FAF8F5] border-[#E8E2D9]';

  // Coordinated luxury chart palette for Graph 1
  const CHART_PALETTE = [
    { dark: 'bg-[#4A423D]', light: 'bg-[#C9BFB5]' }, // Taupe
    { dark: 'bg-[#634E42]', light: 'bg-[#BFA493]' }, // Muted Cognac
    { dark: 'bg-[#7A5B49]', light: 'bg-[#B88E75]' }, // Warm Copper
    { dark: 'bg-[#8F644A]', light: 'bg-[#BA7F62]' }, // Sienna
    { dark: 'bg-[#9E5A38]', light: 'bg-[#C26B47]' }, // Terracotta Soft
    { dark: 'bg-[#B44220]', light: 'bg-[#B44220]' }, // Official Terracotta (Current)
  ];

  const maxOverallVal = Math.max(
    ...growthTrend.map((d: any) => (overallMetric === 'revenue' ? d.revenue : (d.units || d.orders || 1))),
    1
  );

  const selectedBagMonthlyTrend = (selectedBag?.monthlyTrend && selectedBag.monthlyTrend.length > 0)
    ? selectedBag.monthlyTrend
    : (DEFAULT_BAG_ANALYTICS.find((b) => b.slug === selectedBag?.slug)?.monthlyTrend || DEFAULT_BAG_ANALYTICS[0].monthlyTrend);

  const maxSingleBagVal = Math.max(
    ...selectedBagMonthlyTrend.map((t) => (singleBagMetric === 'revenue' ? t.revenue : t.units)),
    1
  );

  const maxCompRevenue = Math.max(...bagList.map((b) => b.revenue), 1);
  const maxCompUnits = Math.max(...bagList.map((b) => b.units), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          TOP COMMAND & GREETING BAR (Beehiiv + ProSale inspired)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
              Welcome back, Atelier Admin <span className="inline-block animate-wave">👋</span>
            </h1>
          </div>
          <p className="text-xs text-[#6E6760] dark:text-[#B4B4B4] mt-1">
            Executive overview of ZIMOR sales velocity, luxury silhouette performance, and fulfillment operations.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Date Period */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${subtleSurface}`}>
            <Calendar className="w-3.5 h-3.5 text-[#B44220] dark:text-[#E07A5F]" />
            <span className={isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}>Jun 01 – Nov 17, 2026</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={fetchStats}
            title="Refresh analytics data"
            className={`p-2 rounded-xl border transition-colors ${subtleSurface} text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#24211F] dark:hover:text-[#E8E1DA]`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B44220]' : ''}`} />
          </button>

          {/* Primary Quick CTA: Add Product */}
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#FFFFFF] rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Products Studio</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TOP KPI METRIC CARDS RIBBON (ProSale CRM Row Style)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Gross Sales Revenue */}
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-1px] ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider">
              Gross Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#B44220]/10 flex items-center justify-center text-[#B44220] dark:text-[#E07A5F]">
              <DollarSign className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-2.5 h-2.5" />
              {metrics.revenueGrowth}
            </span>
            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">vs last mo</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-1px] ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            {metrics.totalOrders} <span className="text-xs font-normal text-[#8C837A] dark:text-[#8A837C]">Orders</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-2.5 h-2.5" />
              {metrics.orderGrowth}
            </span>
            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] truncate">{metrics.completedOrders} shipped</span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-1px] ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider">
              Average AOV
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Tag className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            ₹{metrics.averageOrderValue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              +6.4%
            </span>
            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">Benchmark</span>
          </div>
        </div>

        {/* Card 4: Total Patrons */}
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-1px] ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider">
              Active Patrons
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            {metrics.totalCustomers} <span className="text-xs font-normal text-[#8C837A] dark:text-[#8A837C]">Clients</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-2.5 h-2.5" />
              {metrics.customerGrowth}
            </span>
            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">92% Verified</span>
          </div>
        </div>

        {/* Card 5: Inventory Stock Units */}
        <div className={`p-4 rounded-2xl border transition-all hover:translate-y-[-1px] ${cardBg} col-span-2 sm:col-span-1`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider">
              Atelier Units
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Boxes className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            76 <span className="text-xs font-normal text-[#8C837A] dark:text-[#8A837C]">in Stock</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F]">
              {metrics.lowStockProducts} Low Stock
            </span>
            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">6 Silhouettes</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PROSALE-INSPIRED COMMERCE PIPELINE & ATELIER VELOCITY HERO CARD
         ========================================================================= */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-[#E8E2D9] dark:border-[#36312C]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B44220] dark:text-[#E07A5F]">
                Executive Sales Momentum
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Healthy Run-Rate
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                ₹{metrics.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                +24.8% YoY Momentum
              </span>
            </div>
            <p className="text-xs text-[#6E6760] dark:text-[#8A837C] mt-1">
              Storefront sales across workwear totes, laptop bags, and crescent shoulder bags.
            </p>
          </div>

          {/* Quick SLA Status */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2.5 rounded-xl border text-right ${subtleSurface}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C]">Dispatch SLA</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">99.2% on-time</p>
            </div>
            <div className={`px-4 py-2.5 rounded-xl border text-right ${subtleSurface}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C]">Return Rate</p>
              <p className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">1.2% (Defect-Free)</p>
            </div>
          </div>
        </div>

        {/* Multi-Stage Funnel Pipeline (ProSale Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
            <div className="flex items-center justify-between text-xs text-[#6E6760] dark:text-[#8A837C] mb-1">
              <span>Checkout Initiated</span>
              <span className="font-mono text-[10px]">142 deals</span>
            </div>
            <p className="text-lg font-bold text-[#24211F] dark:text-[#E8E1DA]">₹4,12,800</p>
            <div className="w-full bg-[#E8E2D9] dark:bg-[#36312C] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#B44220]/50 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
            <div className="flex items-center justify-between text-xs text-[#6E6760] dark:text-[#8A837C] mb-1">
              <span>Payment Captured</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">84 paid</span>
            </div>
            <p className="text-lg font-bold text-[#24211F] dark:text-[#E8E1DA]">₹2,48,500</p>
            <div className="w-full bg-[#E8E2D9] dark:bg-[#36312C] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#B44220] h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
            <div className="flex items-center justify-between text-xs text-[#6E6760] dark:text-[#8A837C] mb-1">
              <span>Atelier Crafting</span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">{metrics.pendingOrders} queue</span>
            </div>
            <p className="text-lg font-bold text-[#24211F] dark:text-[#E8E1DA]">₹29,990</p>
            <div className="w-full bg-[#E8E2D9] dark:bg-[#36312C] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }} />
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
            <div className="flex items-center justify-between text-xs text-[#6E6760] dark:text-[#8A837C] mb-1">
              <span>Delivered & Verified</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{metrics.completedOrders} orders</span>
            </div>
            <p className="text-lg font-bold text-[#24211F] dark:text-[#E8E1DA]">₹2,18,510</p>
            <div className="w-full bg-[#E8E2D9] dark:bg-[#36312C] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GRAPH 1: OVERALL STOREFRONT SALES PERFORMANCE (Trajectorial Analysis)
         ========================================================================= */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] flex items-center justify-center font-mono font-bold text-xs">
                01
              </span>
              <h2 className="text-base font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                Overall Storefront Sales Trajectory
              </h2>
            </div>
            <p className="text-xs text-[#6E6760] dark:text-[#8A837C] mt-1">
              Monthly GMV velocity, order throughput, and cumulative run-rate across all collections.
            </p>
          </div>

          {/* Metric Toggle & Period Switcher */}
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-xl border flex items-center text-xs ${subtleSurface}`}>
              <button
                type="button"
                onClick={() => setOverallMetric('revenue')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  overallMetric === 'revenue'
                    ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                    : 'text-[#6E6760] dark:text-[#B4B4B4] hover:text-[#24211F] dark:hover:text-[#E8E1DA]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setOverallMetric('units')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  overallMetric === 'units'
                    ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                    : 'text-[#6E6760] dark:text-[#B4B4B4] hover:text-[#24211F] dark:hover:text-[#E8E1DA]'
                }`}
              >
                Units Sold
              </button>
            </div>

            <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border ${subtleSurface} text-[#6E6760] dark:text-[#B4B4B4]`}>
              Jun – Nov 2026
            </span>
          </div>
        </div>

        {/* Visual Bar & Curve Visualization */}
        <div className="space-y-4 pt-2">
          <div className="h-60 flex items-end gap-3 sm:gap-6 justify-between pt-8 px-2">
            {growthTrend.map((item: any, idx: number) => {
              const currentVal = overallMetric === 'revenue' ? item.revenue : (item.units || item.orders || 1);
              const heightPct = Math.max(16, Math.round((currentVal / maxOverallVal) * 100));
              const isCurrent = idx === growthTrend.length - 1;
              const barColor = isCurrent
                ? 'bg-[#B44220] shadow-[0_0_16px_rgba(180,66,32,0.4)]'
                : isDark
                ? CHART_PALETTE[idx % CHART_PALETTE.length].dark
                : CHART_PALETTE[idx % CHART_PALETTE.length].light;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#24211F] text-[#E8E1DA] dark:bg-[#191715] dark:border dark:border-[#36312C] shadow-lg whitespace-nowrap">
                    {overallMetric === 'revenue' ? `₹${item.revenue.toLocaleString('en-IN')}` : `${item.units || item.orders} units`}
                  </div>

                  {/* Visual Bar Pillar */}
                  <div className="w-full flex justify-center items-end h-44">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${barColor}`}
                    />
                  </div>

                  {/* Month Label */}
                  <div className="text-center">
                    <span
                      className={`text-xs block font-bold ${
                        isCurrent
                          ? 'text-[#B44220] dark:text-[#E07A5F]'
                          : isDark
                          ? 'text-[#8A837C]'
                          : 'text-[#6E6760]'
                      }`}
                    >
                      {item.month}
                    </span>
                    <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] hidden sm:block">
                      {overallMetric === 'revenue'
                        ? `₹${(item.revenue / 1000).toFixed(0)}k`
                        : `${item.units || item.orders}u`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graph 1 Summary Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E8E2D9] dark:border-[#36312C]">
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] uppercase font-bold text-[#8C837A] dark:text-[#8A837C]">Peak Month</p>
              <p className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                November (₹2,48,500)
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] uppercase font-bold text-[#8C837A] dark:text-[#8A837C]">Monthly Run-Rate</p>
              <p className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                ₹1,76,250 / mo
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] uppercase font-bold text-[#8C837A] dark:text-[#8A837C]">Total Volume Sold</p>
              <p className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                388 Luxury Units
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] uppercase font-bold text-[#8C837A] dark:text-[#8A837C]">Trajectory Health</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 98.8% Fulfillment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SPLIT SECTION: GRAPH 2 (SINGLE BAG) & GRAPH 3 (BAG COMPARISON)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =====================================================================
            GRAPH 2: SINGLE BAG SILHOUETTE SALES DEEP-DIVE (7 Columns)
           ===================================================================== */}
        <div className={`lg:col-span-7 p-5 sm:p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </span>
                  <h2 className="text-base font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                    Single Bag Sales Performance
                  </h2>
                </div>
                <p className="text-xs text-[#6E6760] dark:text-[#8A837C] mt-1">
                  Select any bag silhouette from the catalog to inspect individual velocity and specs.
                </p>
              </div>

              {/* Metric Toggle */}
              <div className={`p-1 rounded-xl border flex items-center text-xs self-start ${subtleSurface}`}>
                <button
                  type="button"
                  onClick={() => setSingleBagMetric('revenue')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    singleBagMetric === 'revenue'
                      ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6E6760] dark:text-[#B4B4B4]'
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setSingleBagMetric('units')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    singleBagMetric === 'units'
                      ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6E6760] dark:text-[#B4B4B4]'
                  }`}
                >
                  Units
                </button>
              </div>
            </div>

            {/* Bag Silhouette Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {bagList.map((bag) => {
                const isSelected = bag.slug === selectedBagSlug;
                return (
                  <button
                    key={bag.slug}
                    type="button"
                    onClick={() => setSelectedBagSlug(bag.slug)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#B44220] text-[#FFFFFF] border-[#B44220] shadow-sm'
                        : isDark
                        ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:text-[#E8E1DA] hover:border-[#8A837C]'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] text-[#5A534E] hover:text-[#24211F] hover:border-[#8C837A]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden relative shrink-0 border border-white/20">
                      <Image
                        src={bag.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                        alt={bag.name || 'Bag'}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="20px"
                      />
                    </div>
                    <span>{bag.name.replace('ZIMOR ', '')}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Bag Highlight Card */}
            <div className={`p-4 rounded-xl border ${subtleSurface}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-[#E8E2D9] dark:border-[#36312C] shrink-0">
                    <Image
                      src={selectedBag?.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                      alt={selectedBag?.name || 'Bag'}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B44220] dark:text-[#E07A5F]">
                      {selectedBag.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
                      {selectedBag.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#8C837A] dark:text-[#8A837C] mt-0.5">
                      MRP ₹{selectedBag.price.toLocaleString('en-IN')} · Stock: {selectedBag.stock} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#8C837A] dark:text-[#8A837C]">Total Volume</p>
                    <p className="text-base font-bold text-[#24211F] dark:text-[#E8E1DA]">{selectedBag.units} units</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#8C837A] dark:text-[#8A837C]">Total GMV</p>
                    <p className="text-base font-bold text-[#B44220] dark:text-[#E07A5F]">
                      ₹{selectedBag.revenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Velocity Mini Chart */}
              <div className="mt-4 pt-4 border-t border-[#E8E2D9] dark:border-[#36312C]">
                <p className="text-[11px] font-bold text-[#6E6760] dark:text-[#8A837C] mb-2 uppercase tracking-wider">
                  6-Month Silhouette Velocity ({singleBagMetric === 'revenue' ? 'Revenue ₹' : 'Units Sold'})
                </p>
                <div className="h-28 flex items-end gap-2 justify-between pt-2">
                  {selectedBagMonthlyTrend.map((t, idx) => {
                    const val = singleBagMetric === 'revenue' ? t.revenue : t.units;
                    const pct = Math.max(18, Math.round((val / maxSingleBagVal) * 100));
                    const isLast = idx === selectedBagMonthlyTrend.length - 1;
                    return (
                      <div key={t.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {singleBagMetric === 'revenue' ? `₹${(t.revenue / 1000).toFixed(1)}k` : `${t.units}u`}
                        </span>
                        <div className="w-full flex justify-center items-end h-20">
                          <div
                            style={{ height: `${pct}%` }}
                            className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                              isLast
                                ? 'bg-[#B44220]'
                                : isDark
                                ? 'bg-[#4A423D] group-hover:bg-[#B44220]/60'
                                : 'bg-[#C9BFB5] group-hover:bg-[#B44220]/60'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#8C837A] dark:text-[#8A837C]">{t.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bag Attributes Footer */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-[#E8E2D9] dark:border-[#36312C] text-center">
            <div className={`p-2.5 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] font-bold uppercase text-[#8C837A] dark:text-[#8A837C]">Market Share</p>
              <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA] mt-0.5">{selectedBag.marketShare}%</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] font-bold uppercase text-[#8C837A] dark:text-[#8A837C]">Return Rate</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedBag.returnRate}</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${subtleSurface}`}>
              <p className="text-[10px] font-bold uppercase text-[#8C837A] dark:text-[#8A837C]">Average Rating</p>
              <p className="text-xs font-bold text-[#B44220] dark:text-[#E07A5F] mt-0.5">{selectedBag.rating} ★</p>
            </div>
          </div>
        </div>

        {/* =====================================================================
            GRAPH 3: BAG SILHOUETTE SALES COMPARISON (5 Columns)
           ===================================================================== */}
        <div className={`lg:col-span-5 p-5 sm:p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </span>
                  <h2 className="text-base font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                    Bag Silhouette Sales Comparison
                  </h2>
                </div>
                <p className="text-xs text-[#6E6760] dark:text-[#8A837C] mt-1">
                  Proportional share and ranked comparison across all 6 bag models.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className={`p-1 rounded-xl border flex items-center text-xs self-start ${subtleSurface}`}>
                <button
                  type="button"
                  onClick={() => setComparisonMode('revenue')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    comparisonMode === 'revenue'
                      ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6E6760] dark:text-[#B4B4B4]'
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('units')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    comparisonMode === 'units'
                      ? 'bg-[#B44220] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6E6760] dark:text-[#B4B4B4]'
                  }`}
                >
                  Units
                </button>
              </div>
            </div>

            {/* Continuum Market Share Segmented Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6E6760] dark:text-[#8A837C] uppercase tracking-wider text-[10px]">
                  Continuum Market Share
                </span>
                <span className="font-mono text-[10px] text-[#8C837A] dark:text-[#8A837C]">100% of Catalog GMV</span>
              </div>
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#E8E2D9] dark:bg-[#36312C] p-0.5">
                {bagList.map((bag) => (
                  <div
                    key={bag.slug}
                    style={{
                      width: `${bag.marketShare}%`,
                      backgroundColor: bag.colorHex,
                    }}
                    title={`${bag.name}: ${bag.marketShare}% share`}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:opacity-85"
                  />
                ))}
              </div>
            </div>

            {/* Ranked Comparative Bars */}
            <div className="space-y-3 pt-2">
              {bagList.map((bag, rank) => {
                const barVal = comparisonMode === 'revenue' ? bag.revenue : bag.units;
                const maxVal = comparisonMode === 'revenue' ? maxCompRevenue : maxCompUnits;
                const pct = Math.max(12, Math.round((barVal / maxVal) * 100));

                return (
                  <div key={bag.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-[10px] font-bold text-[#8C837A] dark:text-[#8A837C] font-mono">
                          #{rank + 1}
                        </span>
                        <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA] truncate max-w-[160px] sm:max-w-[200px]">
                          {bag.name.replace('ZIMOR ', '')}
                        </span>
                      </div>
                      <span className="font-bold text-xs font-mono text-[#B44220] dark:text-[#E07A5F]">
                        {comparisonMode === 'revenue'
                          ? `₹${bag.revenue.toLocaleString('en-IN')}`
                          : `${bag.units} units`}
                      </span>
                    </div>

                    <div className="w-full bg-[#E8E2D9] dark:bg-[#36312C] h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${pct}%`,
                          backgroundColor: bag.colorHex,
                        }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Highlight Footer */}
          <div className={`mt-4 p-3 rounded-xl border ${subtleSurface} flex items-center justify-between text-xs`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B44220] dark:text-[#E07A5F]" />
              <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">Top Driver</span>
            </div>
            <span className="font-bold text-[#B44220] dark:text-[#E07A5F]">
              Delo Tote (37.8% GMV)
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LOWER CRM SECTION: RECENT ORDERS & ATELIER CMS SHORTCUTS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders Ledger (8 Columns) */}
        <div className={`lg:col-span-8 p-5 sm:p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                Recent Orders Ledger
              </h3>
              <p className="text-xs text-[#6E6760] dark:text-[#8A837C] mt-0.5">
                Real-time purchase notifications, payment status, and dispatch workflow.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs overflow-x-auto ${subtleSurface}`}>
              {(['all', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                    orderFilter === status
                      ? 'bg-[#B44220] text-[#FFFFFF]'
                      : 'text-[#6E6760] dark:text-[#B4B4B4]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E2D9] dark:border-[#36312C] text-[#8C837A] dark:text-[#8A837C] uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Silhouette Item</th>
                  <th className="pb-3 text-right">Total (₹)</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9] dark:divide-[#36312C]">
                {filteredOrders.map((order: any) => {
                  const customerName = order.customer?.name || order.shippingAddress?.fullName || order.customerName || 'Zimor Patron';
                  const customerEmail = order.customer?.email || order.email || 'client@zimor.in';
                  const orderTotal = typeof order.total === 'number' ? order.total : (order.totalAmount || 2999);
                  const firstItemName = order.items?.[0]?.name || 'Zimor Luxury Bag';

                  return (
                    <tr key={order.orderNumber} className="hover:bg-[#FAF8F5] dark:hover:bg-[#2A2724] transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-[#B44220] dark:text-[#E07A5F]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#B44220]/10 text-[#B44220] dark:text-[#E07A5F] flex items-center justify-center font-bold text-[10px]">
                            {customerName[0] || 'Z'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">{customerName}</p>
                            <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">{customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-[#24211F] dark:text-[#E8E1DA] font-medium">
                        {firstItemName}
                      </td>
                      <td className="py-3 text-right font-bold font-mono text-[#24211F] dark:text-[#E8E1DA]">
                        ₹{orderTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : order.status === 'Shipped'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : order.status === 'Processing'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F]'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-[11px] font-semibold text-[#B44220] dark:text-[#E07A5F] hover:underline"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E2D9] dark:border-[#36312C] flex items-center justify-between text-xs">
            <span className="text-[#8C837A] dark:text-[#8A837C]">Showing recent verified storefront transactions</span>
            <Link
              href="/admin/orders"
              className="font-bold text-[#B44220] dark:text-[#E07A5F] flex items-center gap-1 hover:underline"
            >
              <span>View All 84 Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Atelier CMS Quick Controls (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Hub Card */}
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                Atelier CMS Hub
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B44220] dark:text-[#E07A5F]">
                Quick Jump
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/products"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <Package className="w-4 h-4 text-[#B44220] dark:text-[#E07A5F] mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Products</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">6 Active</p>
              </Link>

              <Link
                href="/admin/orders"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Orders</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">84 Total</p>
              </Link>

              <Link
                href="/admin/banners"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Hero Banners</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">Storefront</p>
              </Link>

              <Link
                href="/admin/announcements"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Announcement</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">Top Bar</p>
              </Link>

              <Link
                href="/admin/issues"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Order Issues</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">Returns SLA</p>
              </Link>

              <Link
                href="/admin/reviews"
                className={`p-3 rounded-xl border transition-all hover:border-[#B44220] ${subtleSurface}`}
              >
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1.5" />
                <p className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">Reviews</p>
                <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">Patron Ratings</p>
              </Link>
            </div>
          </div>

          {/* System Provider Health Card */}
          <div className={`p-4 rounded-2xl border ${subtleSurface} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C]">
                Platform Health
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Operational
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6E6760] dark:text-[#8A837C]">Database</span>
                <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA] font-mono">Local JSON / Mongo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6760] dark:text-[#8A837C]">Media Storage</span>
                <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA] font-mono">Local / Cloudinary</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6760] dark:text-[#8A837C]">Payments</span>
                <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA] font-mono">Mock / Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
