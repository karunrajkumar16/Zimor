'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Layers,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Boxes,
  HelpCircle,
  Eye,
  BarChart2,
  Check,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface PeriodDataPoint {
  label: string;
  date: string;
  units: number;
  revenue: number;
  asp: number;
}

interface BagAnalyticsItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  units: number;
  revenue: number;
  asp: number;
  marketShare: number;
  rating: number;
  stockHealth: 'Optimal' | 'Low' | 'Critical';
  timeSeries: {
    daily: { label: string; date: string; units: number; revenue: number }[];
    weekly: { label: string; date: string; units: number; revenue: number }[];
    monthly: { label: string; date: string; units: number; revenue: number }[];
    yearly: { label: string; date: string; units: number; revenue: number }[];
  };
}

interface ComparativeProductItem {
  id?: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price?: number;
  units: number;
  revenue: number;
  asp: number;
  stock: number;
  stockHealth: 'Optimal' | 'Low' | 'Critical';
  marketShare: number;
  periods?: {
    weekly: PeriodDataPoint[];
    monthly: PeriodDataPoint[];
    quarterly: PeriodDataPoint[];
    yearly: PeriodDataPoint[];
  };
}

interface OverallTimeSeriesPoint {
  label: string;
  date: string;
  revenue: number;
  previousRevenue: number;
  orders: number;
  units: number;
}

interface AdminStatsResponse {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
    conversionRate: number;
    previousPeriod: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
      customers: number;
      conversionRate: number;
    };
    revenueGrowth: string;
    orderGrowth: string;
    aovGrowth: string;
    customerGrowth: string;
    conversionGrowth: string;
    pendingOrders: number;
    completedOrders: number;
    totalProducts: number;
    lowStockProducts: number;
  };
  timeSeries: {
    daily: OverallTimeSeriesPoint[];
    weekly: OverallTimeSeriesPoint[];
    monthly: OverallTimeSeriesPoint[];
    yearly: OverallTimeSeriesPoint[];
  };
  bagAnalytics: BagAnalyticsItem[];
  comparativeAnalysis: ComparativeProductItem[];
  activeFilters?: {
    range: string;
    period: string;
  };
  providers: {
    database: string;
    media: string;
    payment: string;
  };
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global Date Range Filter
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '12m' | 'all'>('30d');

  // Graph 1: Overall Sales Timeframe Filter
  const [overallPeriod, setOverallPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoveredOverallIdx, setHoveredOverallIdx] = useState<number | null>(null);

  // Graph 2: Single Bag Deep-Dive Controls
  const [selectedBagSlug, setSelectedBagSlug] = useState<string>('zimor-delo-tote');
  const [singleBagPeriod, setSingleBagPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoveredBagIdx, setHoveredBagIdx] = useState<number | null>(null);

  // Graph 3: Comparative Product Clustered Column Chart Controls
  const [clusteredPeriod, setClusteredPeriod] = useState<'quarterly' | 'monthly' | 'weekly' | 'yearly'>('quarterly');
  const [clusteredMetric, setClusteredMetric] = useState<'revenue' | 'units' | 'asp'>('revenue');
  const [selectedProductSlugs, setSelectedProductSlugs] = useState<string[]>([]);
  const [dateRangeScope, setDateRangeScope] = useState<'all' | 'recent' | 'ytd'>('all');
  const [hoveredBar, setHoveredBar] = useState<{ productSlug: string; periodIdx: number } | null>(null);

  const fetchStats = (rangeVal: string = dateRange) => {
    setLoading(true);
    setError(null);
    apiFetch(`/api/admin/stats?range=${rangeVal}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch stats`);
        return res.json();
      })
      .then((resData) => {
        if (resData.success && resData.stats) {
          setData(resData.stats);
          if (resData.stats.bagAnalytics?.length > 0 && !selectedBagSlug) {
            setSelectedBagSlug(resData.stats.bagAnalytics[0].slug);
          }
          if (resData.stats.comparativeAnalysis?.length > 0 && selectedProductSlugs.length === 0) {
            setSelectedProductSlugs(resData.stats.comparativeAnalysis.map((p: any) => p.slug));
          }
        } else {
          throw new Error(resData.error || 'Invalid API response format');
        }
      })
      .catch((err) => {
        console.error('Failed fetching stats', err);
        setError(err.message || 'Error connecting to backend database');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats(dateRange);
  }, [dateRange]);

  // Sync product slugs when data first loads
  useEffect(() => {
    if (data?.comparativeAnalysis && selectedProductSlugs.length === 0) {
      setSelectedProductSlugs(data.comparativeAnalysis.map((p) => p.slug));
    }
  }, [data?.comparativeAnalysis, selectedProductSlugs.length]);

  // Selected Bag for Graph 2
  const selectedBag = useMemo(() => {
    if (!data?.bagAnalytics) return null;
    return (
      data.bagAnalytics.find((b) => b.slug === selectedBagSlug) ||
      data.bagAnalytics[0] ||
      null
    );
  }, [data?.bagAnalytics, selectedBagSlug]);

  // Graph 1 Data calculation
  const overallSeries = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries[overallPeriod] || [];
  }, [data?.timeSeries, overallPeriod]);

  const overallMaxRevenue = useMemo(() => {
    if (overallSeries.length === 0) return 100000;
    const maxVal = Math.max(...overallSeries.map((s) => Math.max(s.revenue, s.previousRevenue)));
    return Math.ceil(maxVal * 1.15);
  }, [overallSeries]);

  const overallTotalRevenue = useMemo(() => {
    return overallSeries.reduce((s, p) => s + p.revenue, 0);
  }, [overallSeries]);

  const overallPrevTotalRevenue = useMemo(() => {
    return overallSeries.reduce((s, p) => s + p.previousRevenue, 0);
  }, [overallSeries]);

  const overallGrowthVariance = useMemo(() => {
    if (overallPrevTotalRevenue === 0) return '+0.0%';
    const pct = ((overallTotalRevenue - overallPrevTotalRevenue) / overallPrevTotalRevenue) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }, [overallTotalRevenue, overallPrevTotalRevenue]);

  // Graph 2 Data calculation
  const singleBagSeries = useMemo(() => {
    if (!selectedBag?.timeSeries) return [];
    return selectedBag.timeSeries[singleBagPeriod] || [];
  }, [selectedBag, singleBagPeriod]);

  const singleBagMaxRevenue = useMemo(() => {
    if (singleBagSeries.length === 0) return 30000;
    return Math.max(...singleBagSeries.map((s) => s.revenue), 1000) * 1.2;
  }, [singleBagSeries]);

  const singleBagMaxUnits = useMemo(() => {
    if (singleBagSeries.length === 0) return 10;
    return Math.max(...singleBagSeries.map((s) => s.units), 4) * 1.25;
  }, [singleBagSeries]);

  // Format currency in Indian standard (₹)
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Concise X-axis labels to prevent chart label-to-table overlap
  const formatComparativeChartLabel = (name: string) => {
    const clean = name.replace(/^ZIMOR\s+/i, '');
    if (clean.includes(' — ')) {
      const parts = clean.split(' — ');
      const base = parts[0].replace(/\s+(BAG|TOTE)$/i, '').replace(/^CLASSIC\s+SHOULDER$/i, 'CLASSIC');
      return `${base} (${parts[1]})`;
    }
    return clean.replace(/\s+BAG$/i, '');
  };

  // GRAPH 3 CLUSTERED COLUMN CALCULATIONS
  // All 6 products from MongoDB Atlas
  const allComparativeProducts = useMemo(() => {
    return data?.comparativeAnalysis || [];
  }, [data?.comparativeAnalysis]);

  // Filtered products based on user multi-select
  const activeClusteredProducts = useMemo(() => {
    if (!allComparativeProducts.length) return [];
    if (selectedProductSlugs.length === 0) return allComparativeProducts;
    return allComparativeProducts.filter((p) => selectedProductSlugs.includes(p.slug));
  }, [allComparativeProducts, selectedProductSlugs]);

  // Available periods for the active period filter (quarterly, monthly, weekly, yearly)
  const reportingPeriods = useMemo(() => {
    if (!allComparativeProducts.length || !allComparativeProducts[0].periods) {
      if (clusteredPeriod === 'quarterly') return ['Q1', 'Q2', 'Q3', 'Q4'];
      if (clusteredPeriod === 'monthly') return ['Aug', 'Sep', 'Oct', 'Nov'];
      if (clusteredPeriod === 'weekly') return ['W1', 'W2', 'W3', 'W4'];
      return ['2024', '2025', '2026'];
    }
    const sample = allComparativeProducts[0].periods[clusteredPeriod] || [];
    if (dateRangeScope === 'recent' && sample.length > 2) {
      return sample.slice(-2).map((p) => p.label);
    }
    return sample.map((p) => p.label);
  }, [allComparativeProducts, clusteredPeriod, dateRangeScope]);

  // Color mapping using ZIMOR's palette (Terracotta, Muted Copper, Warm Taupe, Ash Grey)
  const periodColors = useMemo(() => {
    return [
      { color: '#5146E5', name: 'Terracotta', border: '#4338CA' },
      { color: '#C86D48', name: 'Muted Copper', border: '#A65534' },
      { color: '#8F8174', name: 'Warm Taupe', border: '#6E6257' },
      { color: isDark ? '#9E968D' : '#4A4540', name: 'Ash Grey', border: isDark ? '#7E766D' : '#332F2C' },
    ];
  }, [isDark]);

  // Maximum value for Y-axis scale
  const clusteredMaxVal = useMemo(() => {
    let maxFound = 1;
    activeClusteredProducts.forEach((prod) => {
      const pList = prod.periods?.[clusteredPeriod] || [];
      pList.forEach((pt) => {
        let val = pt.revenue;
        if (clusteredMetric === 'units') val = pt.units;
        if (clusteredMetric === 'asp') val = pt.asp;
        if (val > maxFound) maxFound = val;
      });
    });

    if (clusteredMetric === 'units') {
      return Math.ceil(maxFound * 1.25);
    }
    if (clusteredMetric === 'asp') {
      return Math.ceil(maxFound * 1.15);
    }
    // Revenue
    return Math.ceil(maxFound * 1.2);
  }, [activeClusteredProducts, clusteredPeriod, clusteredMetric]);

  // Toggle single product selection
  const toggleProductSelection = (slug: string) => {
    if (selectedProductSlugs.includes(slug)) {
      if (selectedProductSlugs.length > 1) {
        setSelectedProductSlugs(selectedProductSlugs.filter((s) => s !== slug));
      }
    } else {
      setSelectedProductSlugs([...selectedProductSlugs, slug]);
    }
  };

  const selectAllProducts = () => {
    setSelectedProductSlugs(allComparativeProducts.map((p) => p.slug));
  };

  const deselectOtherProducts = (slugToKeep: string) => {
    setSelectedProductSlugs([slugToKeep]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP DASHBOARD CONTROL & FILTER BAR */}
      <div
        className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
          isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
        }`}
      >
        <div>
          <h1 className="text-lg font-semibold text-[#1C2434] dark:text-white tracking-tight">
            Executive Analytics & Intelligence
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Live transaction telemetry, multi-product sales performance & user metrics.
          </p>
        </div>

        {/* Global Date Filter & Sync Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Segmented Date Range Picker */}
          <div
            className={`inline-flex items-center p-1 rounded-lg border text-xs ${
              isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F1F5F9] border-transparent'
            }`}
          >
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '12m', label: '12M' },
              { id: 'all', label: 'ALL' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  dateRange === tab.id
                    ? 'bg-[#5146E5] text-white shadow-xs font-medium'
                    : isDark
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#64748B] hover:text-[#1C2434]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => fetchStats(dateRange)}
            disabled={loading}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#191715] border-[#36312C] text-[#94A3B8] hover:text-white hover:border-[#4A4540]'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1C2434] hover:border-[#CBD5E1]'
            }`}
            title="Refresh analytics telemetry"
            aria-label="Refresh analytics telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5146E5]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ERROR BANNER IF FETCH FAILS */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStats(dateRange)}
            className="px-3 py-1 bg-red-600 text-white rounded font-medium text-xs hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. OVERVIEW SECTION — 5 KEY BUSINESS METRICS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1C2434] dark:text-[#E2E8F0]">
            Executive Performance Overview
          </h2>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            vs. prior period ({dateRange.toUpperCase()})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Metric 1: Total Revenue */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                Total Revenue
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.metrics.revenueGrowth || '0.0%'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums">
                {data ? formatINR(data.metrics.totalRevenue) : '₹0'}
              </p>
              <p className="text-xs text-[#94A3B8] dark:text-[#8A837C] mt-1 truncate">
                Verified successful payments
              </p>
            </div>
          </div>

          {/* Metric 2: Total Orders */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                Total Orders
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.metrics.orderGrowth || '0.0%'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums">
                {data ? data.metrics.totalOrders : '0'}
              </p>
              <p className="text-xs text-[#94A3B8] dark:text-[#8A837C] mt-1 truncate">
                Dispatched & confirmed units
              </p>
            </div>
          </div>

          {/* Metric 3: Average Order Value (AOV) */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                Avg. Order Value
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.metrics.aovGrowth || '0.0%'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums">
                {data ? formatINR(data.metrics.averageOrderValue) : '₹0'}
              </p>
              <p className="text-xs text-[#94A3B8] dark:text-[#8A837C] mt-1 truncate">
                Net yield per client checkout
              </p>
            </div>
          </div>

          {/* Metric 4: Total Customers */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                Total Customers
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.metrics.customerGrowth || '0.0%'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums">
                {data ? data.metrics.totalCustomers : '0'}
              </p>
              <p className="text-xs text-[#94A3B8] dark:text-[#8A837C] mt-1 truncate">
                Registered luxury users
              </p>
            </div>
          </div>

          {/* Metric 5: Conversion Rate */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                Conversion Rate
              </span>
              <span className="text-xs font-medium text-[#5146E5] dark:text-[#818CF8] tabular-nums">
                {data?.metrics.conversionGrowth || '0.0%'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums">
                {data ? `${data.metrics.conversionRate}%` : '0.0%'}
              </p>
              <p className="text-xs text-[#94A3B8] dark:text-[#8A837C] mt-1 truncate">
                Atelier session-to-order ratio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED ANALYTICS SECTION */}
      <section className="space-y-6">
        {/* GRAPH 1: OVERALL SALES – AREA CHART */}
        <div
          className={`p-6 rounded-xl border transition-all ${
            isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
          }`}
        >
          {/* Card Header & Timeframe Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD7] dark:border-[#36312C]">
            <div>
              <h3 className="text-base font-semibold text-[#1C2434] dark:text-[#E2E8F0] tracking-tight">
                Overall Sales Trajectory
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Revenue performance over time with dual-curve previous period comparison.
              </p>
            </div>

            {/* Timeframe Filter Tabs */}
            <div
              className={`inline-flex items-center p-1 rounded-lg border text-xs ${
                isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F1F5F9] border-transparent'
              }`}
            >
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setOverallPeriod(tab.id as any);
                    setHoveredOverallIdx(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    overallPeriod === tab.id
                      ? 'bg-[#5146E5] text-white shadow-xs font-medium'
                      : isDark
                      ? 'text-[#94A3B8] hover:text-white'
                      : 'text-[#64748B] hover:text-[#1C2434]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Indicators Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-b border-[#E5DFD7] dark:border-[#36312C]">
            <div>
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">
                Period Revenue
              </span>
              <span className="text-lg font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums block mt-0.5">
                {formatINR(overallTotalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">
                Prior Period
              </span>
              <span className="text-lg font-bold text-[#64748B] dark:text-[#94A3B8] tracking-tight tabular-nums block mt-0.5">
                {formatINR(overallPrevTotalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">
                Net Variance
              </span>
              <span className="text-lg font-bold text-[#5146E5] dark:text-[#818CF8] tracking-tight tabular-nums block mt-0.5">
                {overallGrowthVariance}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs self-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 rounded-full bg-[#5146E5]" />
                <span className="text-xs font-medium text-[#1C2434] dark:text-[#E2E8F0]">Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#8F8174]" />
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Previous</span>
              </div>
            </div>
          </div>

          {/* Precision SVG Area Chart */}
          <div className="pt-6 relative">
            <div className="w-full h-72">
              {overallSeries.length > 0 ? (
                (() => {
                  const paddingX = 40;
                  const paddingY = 24;
                  const chartW = 760;
                  const chartH = 240;
                  const pointsCount = overallSeries.length;
                  const stepX = (chartW - paddingX * 2) / (pointsCount - 1 || 1);

                  const currentCoords = overallSeries.map((pt, i) => {
                    const x = paddingX + i * stepX;
                    const y = chartH - paddingY - (pt.revenue / overallMaxRevenue) * (chartH - paddingY * 2);
                    return { x, y, pt };
                  });

                  const prevCoords = overallSeries.map((pt, i) => {
                    const x = paddingX + i * stepX;
                    const y = chartH - paddingY - (pt.previousRevenue / overallMaxRevenue) * (chartH - paddingY * 2);
                    return { x, y, pt };
                  });

                  const currentLinePath = currentCoords
                    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
                    .join(' ');
                  const currentAreaPath = `${currentLinePath} L ${currentCoords[currentCoords.length - 1].x} ${chartH - paddingY
                    } L ${currentCoords[0].x} ${chartH - paddingY} Z`;

                  const prevLinePath = prevCoords
                    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
                    .join(' ');

                  const gridLines = [0, 0.25, 0.5, 0.75, 1];
                  const activeHover = hoveredOverallIdx !== null ? currentCoords[hoveredOverallIdx] : null;

                  return (
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-full overflow-visible"
                    >
                      {gridLines.map((ratio, idx) => {
                        const y = chartH - paddingY - ratio * (chartH - paddingY * 2);
                        const labelVal = Math.round(overallMaxRevenue * ratio);
                        return (
                          <g key={idx}>
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={chartW - paddingX}
                              y2={y}
                              stroke={isDark ? '#36312C' : '#E5DFD7'}
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />
                            <text
                              x={paddingX - 6}
                              y={y + 3}
                              textAnchor="end"
                              className={`text-[9px] font-mono fill-current ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                                }`}
                            >
                              ₹{labelVal >= 100000 ? `${(labelVal / 100000).toFixed(1)}L` : `${Math.round(labelVal / 1000)}k`}
                            </text>
                          </g>
                        );
                      })}

                      <path
                        d={currentAreaPath}
                        fill="#5146E5"
                        fillOpacity={isDark ? 0.12 : 0.08}
                      />

                      <path
                        d={prevLinePath}
                        fill="none"
                        stroke="#8F8174"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />

                      <path
                        d={currentLinePath}
                        fill="none"
                        stroke="#5146E5"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {currentCoords.map((c, i) => (
                        <circle
                          key={i}
                          cx={c.x}
                          cy={c.y}
                          r={hoveredOverallIdx === i ? 4.5 : 2.5}
                          fill={isDark ? '#191715' : '#FFFFFF'}
                          stroke="#5146E5"
                          strokeWidth={hoveredOverallIdx === i ? 2.5 : 1.8}
                          className="transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredOverallIdx(i)}
                        />
                      ))}

                      {currentCoords.map((c, i) => (
                        <text
                          key={i}
                          x={c.x}
                          y={chartH - 4}
                          textAnchor="middle"
                          className={`text-[10px] font-mono fill-current ${hoveredOverallIdx === i
                            ? 'text-[#5146E5] font-bold'
                            : isDark
                              ? 'text-[#8A837C]'
                              : 'text-[#8C837A]'
                            }`}
                        >
                          {c.pt.label}
                        </text>
                      ))}

                      {activeHover && (
                        <line
                          x1={activeHover.x}
                          y1={paddingY}
                          x2={activeHover.x}
                          y2={chartH - paddingY}
                          stroke="#5146E5"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                    </svg>
                  );
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
                  Loading sales trajectory...
                </div>
              )}
            </div>

            {/* Interactive Tooltip Card */}
            {hoveredOverallIdx !== null && overallSeries[hoveredOverallIdx] && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-4 ${
                  isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Timeline Period</span>
                  <span className="font-semibold text-sm text-[#1C2434] dark:text-white block mt-0.5">
                    {overallSeries[hoveredOverallIdx].label} ({overallSeries[hoveredOverallIdx].date})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Current Revenue</span>
                  <span className="font-semibold text-sm text-[#5146E5] dark:text-[#818CF8] block mt-0.5 tabular-nums">
                    {formatINR(overallSeries[hoveredOverallIdx].revenue)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Prior Period</span>
                  <span className="font-semibold text-sm text-[#64748B] dark:text-[#94A3B8] block mt-0.5 tabular-nums">
                    {formatINR(overallSeries[hoveredOverallIdx].previousRevenue)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Order Volume</span>
                  <span className="font-semibold text-sm text-[#1C2434] dark:text-white block mt-0.5 tabular-nums">
                    {overallSeries[hoveredOverallIdx].orders} orders ({overallSeries[hoveredOverallIdx].units} units)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GRAPH 2: SINGLE BAG DEEP-DIVE – BAR + LINE COMBINATION CHART */}
        <div
          className={`p-6 rounded-xl border transition-all ${
            isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
          }`}
        >
          {/* Header & Product Selector Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD7] dark:border-[#36312C]">
            <div>
              <h3 className="text-base font-semibold text-[#1C2434] dark:text-[#E2E8F0] tracking-tight">
                Single Bag Deep-Dive Analysis
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Granular units (bars) vs. revenue (line) with color variation share.
              </p>
            </div>

            {/* Product Selector for All 6 ZIMOR Bags */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                id="bag-selector"
                value={selectedBagSlug}
                onChange={(e) => {
                  setSelectedBagSlug(e.target.value);
                  setHoveredBagIdx(null);
                }}
                aria-label="Select product"
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:border-[#5146E5] ${
                  isDark
                    ? 'bg-[#191715] border-[#36312C] text-[#E8E1DA]'
                    : 'bg-white border-[#E2E8F0] text-[#1C2434]'
                }`}
              >
                {data?.bagAnalytics?.map((bag) => (
                  <option key={bag.slug} value={bag.slug}>
                    {bag.name} — {formatINR(bag.price)}
                  </option>
                ))}
              </select>

              {/* Timeframe Filter Tabs */}
              <div
                className={`inline-flex items-center p-1 rounded-lg border text-xs ${
                  isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F1F5F9] border-transparent'
                }`}
              >
                {[
                  { id: 'daily', label: 'D' },
                  { id: 'weekly', label: 'W' },
                  { id: 'monthly', label: 'M' },
                  { id: 'yearly', label: 'Y' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSingleBagPeriod(tab.id as any);
                      setHoveredBagIdx(null);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      singleBagPeriod === tab.id
                        ? 'bg-[#5146E5] text-white shadow-xs font-medium'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-[#64748B] hover:text-[#1C2434]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Bag Overview Strip */}
          {selectedBag && (
            <div className="py-4 border-b border-[#E5DFD7] dark:border-[#36312C] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-[#E2E8F0] dark:border-[#36312C]">
                  <Image
                    src={selectedBag.image}
                    alt={selectedBag.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1C2434] dark:text-white leading-tight">
                    {selectedBag.name}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    {selectedBag.category} • Stock: {selectedBag.stock} units
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">
                  Cumulative Revenue
                </span>
                <span className="text-lg font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums block mt-0.5">
                  {formatINR(selectedBag.revenue)}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">
                  Units Dispatched
                </span>
                <span className="text-lg font-bold text-[#1C2434] dark:text-white tracking-tight tabular-nums block mt-0.5">
                  {selectedBag.units} units (ASP: {formatINR(selectedBag.asp)})
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs self-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#8F8174]" />
                  <span className="text-xs font-medium text-[#1C2434] dark:text-[#E2E8F0]">Units (Bar)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full bg-[#5146E5]" />
                  <span className="text-xs font-medium text-[#5146E5] dark:text-[#818CF8]">Revenue (Line)</span>
                </div>
              </div>
            </div>
          )}

          {/* Combination Chart SVG (Bars + Line) */}
          <div className="pt-6 relative">
            <div className="w-full h-64">
              {singleBagSeries.length > 0 ? (
                (() => {
                  const paddingX = 44;
                  const paddingY = 24;
                  const chartW = 760;
                  const chartH = 220;
                  const count = singleBagSeries.length;
                  const colWidth = Math.min(36, (chartW - paddingX * 2) / (count * 2.2));
                  const stepX = (chartW - paddingX * 2) / (count - 1 || 1);

                  const barData = singleBagSeries.map((pt, i) => {
                    const cx = paddingX + i * stepX;
                    const barH = (pt.units / singleBagMaxUnits) * (chartH - paddingY * 2);
                    const y = chartH - paddingY - barH;
                    return { cx, y, barH, pt };
                  });

                  const lineCoords = singleBagSeries.map((pt, i) => {
                    const x = paddingX + i * stepX;
                    const y = chartH - paddingY - (pt.revenue / singleBagMaxRevenue) * (chartH - paddingY * 2);
                    return { x, y, pt };
                  });

                  const linePath = lineCoords
                    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
                    .join(' ');

                  const activeHover = hoveredBagIdx !== null ? lineCoords[hoveredBagIdx] : null;

                  return (
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-full overflow-visible"
                    >
                      {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                        const y = chartH - paddingY - ratio * (chartH - paddingY * 2);
                        const unitLabel = Math.round(singleBagMaxUnits * ratio);
                        const revLabel = Math.round(singleBagMaxRevenue * ratio);
                        return (
                          <g key={idx}>
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={chartW - paddingX}
                              y2={y}
                              stroke={isDark ? '#36312C' : '#E5DFD7'}
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />
                            <text
                              x={paddingX - 6}
                              y={y + 3}
                              textAnchor="end"
                              className={`text-[9px] font-mono fill-current ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                                }`}
                            >
                              {unitLabel}u
                            </text>
                            <text
                              x={chartW - paddingX + 6}
                              y={y + 3}
                              textAnchor="start"
                              className={`text-[9px] font-mono fill-current ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                                }`}
                            >
                              ₹{revLabel >= 1000 ? `${Math.round(revLabel / 1000)}k` : revLabel}
                            </text>
                          </g>
                        );
                      })}

                      {barData.map((b, i) => (
                        <rect
                          key={i}
                          x={b.cx - colWidth / 2}
                          y={b.y}
                          width={colWidth}
                          height={Math.max(2, b.barH)}
                          rx="2"
                          fill="#8F8174"
                          fillOpacity={hoveredBagIdx === i ? 0.9 : 0.55}
                          className="transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredBagIdx(i)}
                        />
                      ))}

                      <path
                        d={linePath}
                        fill="none"
                        stroke="#5146E5"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {lineCoords.map((c, i) => (
                        <circle
                          key={i}
                          cx={c.x}
                          cy={c.y}
                          r={hoveredBagIdx === i ? 4.5 : 2.5}
                          fill={isDark ? '#191715' : '#FFFFFF'}
                          stroke="#5146E5"
                          strokeWidth={hoveredBagIdx === i ? 2.5 : 1.8}
                          className="transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredBagIdx(i)}
                        />
                      ))}

                      {lineCoords.map((c, i) => (
                        <text
                          key={i}
                          x={c.x}
                          y={chartH - 4}
                          textAnchor="middle"
                          className={`text-[10px] font-mono fill-current ${hoveredBagIdx === i
                            ? 'text-[#5146E5] font-bold'
                            : isDark
                              ? 'text-[#8A837C]'
                              : 'text-[#8C837A]'
                            }`}
                        >
                          {c.pt.label}
                        </text>
                      ))}

                      {activeHover && (
                        <line
                          x1={activeHover.x}
                          y1={paddingY}
                          x2={activeHover.x}
                          y2={chartH - paddingY}
                          stroke="#5146E5"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                    </svg>
                  );
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
                  Loading product metrics...
                </div>
              )}
            </div>

            {/* Interactive Tooltip Card for Single Bag */}
            {hoveredBagIdx !== null && singleBagSeries[hoveredBagIdx] && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-4 ${
                  isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Period Interval</span>
                  <span className="font-semibold text-sm text-[#1C2434] dark:text-white block mt-0.5">
                    {singleBagSeries[hoveredBagIdx].label} ({singleBagSeries[hoveredBagIdx].date})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Units Dispatched</span>
                  <span className="font-semibold text-sm block text-[#8F8174] mt-0.5 tabular-nums">
                    {singleBagSeries[hoveredBagIdx].units} units
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Gross Revenue</span>
                  <span className="font-semibold text-sm text-[#5146E5] dark:text-[#818CF8] block mt-0.5 tabular-nums">
                    {formatINR(singleBagSeries[hoveredBagIdx].revenue)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">Atelier Share</span>
                  <span className="font-semibold text-sm text-[#1C2434] dark:text-white block mt-0.5 tabular-nums">
                    {selectedBag?.marketShare}% of catalog
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GRAPH 3: CLUSTERED COLUMN CHART (COMPARATIVE PRODUCT ANALYSIS) */}
        {/* MATCHES ATTACHED REFERENCE: GROUPED VERTICAL COLUMNS ACROSS ALL 6 PRODUCTS */}
        <div
          className={`p-6 rounded-xl border transition-all ${
            isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
          }`}
        >
          {/* Card Header & Multi-Control Strip */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD7] dark:border-[#36312C]">
            <div>
              <h3 className="text-base font-semibold text-[#1C2434] dark:text-[#E2E8F0] tracking-tight">
                Comparative Product Analysis
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Grouped vertical column benchmark comparing all 6 products across selected reporting periods.
              </p>
            </div>

            {/* Controls: Metric Selector + Period Granularity */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Metric Selector Tabs */}
              <div
                className={`inline-flex items-center p-1 rounded-lg border text-xs ${
                  isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F1F5F9] border-transparent'
                }`}
              >
                {[
                  { id: 'revenue', label: 'Revenue' },
                  { id: 'units', label: 'Units Sold' },
                  { id: 'asp', label: 'ASP' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setClusteredMetric(m.id as any);
                      setHoveredBar(null);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      clusteredMetric === m.id
                        ? 'bg-[#5146E5] text-white shadow-xs font-medium'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-[#64748B] hover:text-[#1C2434]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Period Granularity Selector (Quarterly, Monthly, Weekly, Yearly) */}
              <div
                className={`inline-flex items-center p-1 rounded-lg border text-xs ${
                  isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#F1F5F9] border-transparent'
                }`}
              >
                {[
                  { id: 'quarterly', label: 'Quarterly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'yearly', label: 'Yearly' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setClusteredPeriod(p.id as any);
                      setHoveredBar(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      clusteredPeriod === p.id
                        ? 'bg-[#5146E5] text-white shadow-xs font-medium'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-[#64748B] hover:text-[#1C2434]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Date Scope Filter */}
              <select
                value={dateRangeScope}
                onChange={(e) => setDateRangeScope(e.target.value as any)}
                aria-label="Filter reporting period scope"
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none focus:border-[#5146E5] ${
                  isDark
                    ? 'bg-[#191715] border-[#36312C] text-[#E8E1DA]'
                    : 'bg-white border-[#E2E8F0] text-[#1C2434]'
                }`}
              >
                <option value="all">Full Completed Periods</option>
                <option value="recent">Recent Intervals (H2)</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter & Legend Strip */}
          <div className="py-3 border-b border-[#E5DFD7] dark:border-[#36312C] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            {/* Product Multi-select Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mr-1">
                Products:
              </span>
              {allComparativeProducts.map((p) => {
                const isSelected = selectedProductSlugs.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => toggleProductSelection(p.slug)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEF0FF] dark:bg-[#5146E5]/15 text-[#5146E5] dark:text-[#818CF8]'
                        : isDark
                        ? 'text-[#94A3B8] hover:text-white hover:bg-[#25221F]'
                        : 'text-[#64748B] hover:text-[#1C2434] hover:bg-gray-100'
                    }`}
                  >
                    {p.name.replace('ZIMOR ', '')}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={selectAllProducts}
                className="text-xs font-medium text-[#5146E5] hover:underline ml-1 cursor-pointer"
              >
                Select All
              </button>
            </div>

            {/* Clean Inline Legend */}
            <div className="flex items-center gap-4 text-xs self-center">
              {reportingPeriods.map((periodLabel, pIdx) => {
                const colorConfig = periodColors[pIdx % periodColors.length];
                return (
                  <div key={periodLabel} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: colorConfig.color }}
                    />
                    <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                      {periodLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG Grouped Vertical Clustered Column Chart */}
          <div className="pt-6 relative">
            <div className="w-full h-[360px] sm:h-[420px]">
              {activeClusteredProducts.length > 0 ? (
                (() => {
                  const chartW = 860;
                  const chartH = 420;
                  const paddingLeft = 70;
                  const paddingRight = 30;
                  const paddingTop = 24;
                  const paddingBottom = 100;

                  const innerW = chartW - paddingLeft - paddingRight;
                  const innerH = chartH - paddingTop - paddingBottom;

                  const numGroups = activeClusteredProducts.length;
                  const numCols = reportingPeriods.length;
                  const groupWidth = innerW / numGroups;

                  // Cluster takes 70% of group slot width; remainder is margin between product groups
                  const clusterWidth = Math.min(groupWidth * 0.72, 100);
                  const barGap = 2; // tight gap within the cluster
                  const colWidth = Math.max(4, (clusterWidth - (numCols - 1) * barGap) / numCols);

                  const yTicks = [0, 0.25, 0.5, 0.75, 1];

                  return (
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-full overflow-visible"
                    >
                      {/* Left Y-Axis Title */}
                      <text
                        x={16}
                        y={chartH / 2 - 10}
                        textAnchor="middle"
                        transform={`rotate(-90, 16, ${chartH / 2 - 10})`}
                        className={`text-[10px] font-mono tracking-wider font-semibold fill-current uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#7A7269]'
                          }`}
                      >
                        {clusteredMetric === 'revenue'
                          ? 'Sales Revenue (₹ INR)'
                          : clusteredMetric === 'units'
                            ? 'Units Sold (Vol)'
                            : 'Average Selling Price (₹)'}
                      </text>

                      {/* Dotted Horizontal Reference Grid Lines */}
                      {yTicks.map((ratio, idx) => {
                        const y = chartH - paddingBottom - ratio * innerH;
                        const tickVal = Math.round(clusteredMaxVal * ratio);
                        let formattedTick = tickVal.toString();
                        if (clusteredMetric === 'revenue' || clusteredMetric === 'asp') {
                          formattedTick = tickVal >= 100000
                            ? `₹${(tickVal / 100000).toFixed(1)}L`
                            : tickVal >= 1000
                              ? `₹${Math.round(tickVal / 1000)}k`
                              : `₹${tickVal}`;
                        } else {
                          formattedTick = `${tickVal}u`;
                        }

                        return (
                          <g key={idx}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={chartW - paddingRight}
                              y2={y}
                              stroke={isDark ? '#36312C' : '#E5DFD7'}
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />
                            <text
                              x={paddingLeft - 8}
                              y={y + 3}
                              textAnchor="end"
                              className={`text-[9px] font-mono fill-current tabular-nums ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
                                }`}
                            >
                              {formattedTick}
                            </text>
                          </g>
                        );
                      })}

                      {/* Solid Baseline (X-Axis) */}
                      <line
                        x1={paddingLeft}
                        y1={chartH - paddingBottom}
                        x2={chartW - paddingRight}
                        y2={chartH - paddingBottom}
                        stroke={isDark ? '#4A4540' : '#D1C7BD'}
                        strokeWidth="1.5"
                      />

                      {/* Solid Vertical Axis (Y-Axis) */}
                      <line
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={chartH - paddingBottom}
                        stroke={isDark ? '#4A4540' : '#D1C7BD'}
                        strokeWidth="1.5"
                      />

                      {/* Render Product Clusters and Columns */}
                      {activeClusteredProducts.map((prod, groupIdx) => {
                        const groupCenterX = paddingLeft + groupIdx * groupWidth + groupWidth / 2;
                        const clusterStartX = groupCenterX - clusterWidth / 2;

                        const prodPeriods = prod.periods?.[clusteredPeriod] || [];

                        return (
                          <g key={prod.slug || groupIdx}>
                            {/* Clustered Vertical Columns for each Period */}
                            {reportingPeriods.map((periodLabel, pIdx) => {
                              const periodData = prodPeriods.find((pt) => pt.label === periodLabel) || {
                                label: periodLabel,
                                date: '',
                                units: 0,
                                revenue: 0,
                                asp: prod.asp || 0,
                              };

                              let val = periodData.revenue;
                              if (clusteredMetric === 'units') val = periodData.units;
                              if (clusteredMetric === 'asp') val = periodData.asp;

                              const colH = Math.max(3, (val / clusteredMaxVal) * innerH);
                              const colX = clusterStartX + pIdx * (colWidth + barGap);
                              const colY = chartH - paddingBottom - colH;
                              const colorObj = periodColors[pIdx % periodColors.length];

                              const isHovered =
                                hoveredBar?.productSlug === prod.slug &&
                                hoveredBar?.periodIdx === pIdx;

                              return (
                                <g key={periodLabel}>
                                  <rect
                                    x={colX}
                                    y={colY}
                                    width={colWidth}
                                    height={colH}
                                    rx="2"
                                    fill={colorObj.color}
                                    stroke={isHovered ? (isDark ? '#FFFFFF' : '#000000') : colorObj.border}
                                    strokeWidth={isHovered ? 1.5 : 0.5}
                                    fillOpacity={isHovered ? 1 : 0.88}
                                    className="transition-all cursor-pointer"
                                    onMouseEnter={() =>
                                      setHoveredBar({ productSlug: prod.slug, periodIdx: pIdx })
                                    }
                                  />
                                </g>
                              );
                            })}

                            {/* Small Tick Mark Under Product Group Center */}
                            <line
                              x1={groupCenterX}
                              y1={chartH - paddingBottom}
                              x2={groupCenterX}
                              y2={chartH - paddingBottom + 5}
                              stroke={isDark ? '#8A837C' : '#8C837A'}
                              strokeWidth="1"
                            />

                            {/* Angled / Readable Product Label on X-Axis with controlled angle and safe positioning */}
                            <text
                              x={groupCenterX}
                              y={chartH - paddingBottom + 14}
                              textAnchor="end"
                              transform={`rotate(-28, ${groupCenterX}, ${chartH - paddingBottom + 14})`}
                              className={`text-[10px] font-mono font-medium fill-current cursor-pointer hover:font-bold ${
                                hoveredBar?.productSlug === prod.slug
                                  ? 'text-[#5146E5] font-bold'
                                  : isDark
                                  ? 'text-[#E8E1DA]'
                                  : 'text-[#24211F]'
                              }`}
                              onClick={() => deselectOtherProducts(prod.slug)}
                            >
                              <title>{prod.name}</title>
                              {formatComparativeChartLabel(prod.name)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
                  Select at least one product to visualize clustered comparison...
                </div>
              )}
            </div>

            {/* Interactive Tooltip Card for Clustered Bar */}
            {hoveredBar && (
              (() => {
                const prod = allComparativeProducts.find((p) => p.slug === hoveredBar.productSlug);
                const periodLabel = reportingPeriods[hoveredBar.periodIdx];
                const pData = prod?.periods?.[clusteredPeriod]?.find((pt) => pt.label === periodLabel);
                const colorObj = periodColors[hoveredBar.periodIdx % periodColors.length];

                if (!prod || !pData) return null;

                return (
                  <div
                    className={`mt-4 p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm ${isDark ? 'bg-[#191715] border-[#36312C]' : 'bg-[#FAF8F5] border-[#E8E2D9]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-[#E2E8F0] dark:border-[#36312C]">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#1C2434] dark:text-white block leading-tight">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-xs inline-block"
                            style={{ backgroundColor: colorObj.color }}
                          />
                          <span className="text-xs font-medium text-[#5146E5] dark:text-[#818CF8]">
                            {pData.label} ({pData.date || clusteredPeriod})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">
                        Period Gross Revenue
                      </span>
                      <span className="font-semibold text-sm text-[#5146E5] dark:text-[#818CF8] block tabular-nums mt-0.5">
                        {formatINR(pData.revenue)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">
                        Units Dispatched
                      </span>
                      <span className="font-semibold text-sm text-[#1C2434] dark:text-white block tabular-nums mt-0.5">
                        {pData.units} units
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">
                        Period ASP
                      </span>
                      <span className="font-semibold text-sm text-[#1C2434] dark:text-white block tabular-nums mt-0.5">
                        {formatINR(pData.asp)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">
                        Catalog Share
                      </span>
                      <span className="font-semibold text-sm text-[#1C2434] dark:text-white block mt-0.5">
                        {prod.marketShare}%
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Tabular Clustered Matrix Table */}
          <div className="mt-8 sm:mt-12 pt-6 border-t border-[#E5DFD7] dark:border-[#36312C]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1C2434] dark:text-[#E2E8F0]">
                Period-over-Period Performance Matrix ({clusteredPeriod.toUpperCase()})
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Metric: {clusteredMetric.toUpperCase()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#36312C] text-[#8A837C]' : 'border-[#E5DFD7] text-[#64748B]'}`}>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    {reportingPeriods.map((periodLabel, pIdx) => (
                      <th key={periodLabel} className="py-2.5 px-3 font-semibold text-right">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <span
                            className="w-2 h-2 rounded-xs"
                            style={{ backgroundColor: periodColors[pIdx % periodColors.length].color }}
                          />
                          <span>{periodLabel}</span>
                        </span>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 font-semibold text-right">Total Vol</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Rev</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
                  {activeClusteredProducts.map((prod) => {
                    const prodPeriods = prod.periods?.[clusteredPeriod] || [];

                    return (
                      <tr
                        key={prod.slug}
                        className={`transition-colors ${isDark ? 'hover:bg-[#191715]' : 'hover:bg-[#FAF8F5]'}`}
                      >
                        <td className="py-3 px-3 font-medium text-xs text-[#1C2434] dark:text-white">
                          {prod.name}
                        </td>
                        {reportingPeriods.map((periodLabel) => {
                          const pt = prodPeriods.find((p) => p.label === periodLabel);
                          let displayVal = '-';
                          if (pt) {
                            if (clusteredMetric === 'revenue') displayVal = formatINR(pt.revenue);
                            else if (clusteredMetric === 'units') displayVal = `${pt.units}u`;
                            else displayVal = formatINR(pt.asp);
                          }

                          return (
                            <td key={periodLabel} className="py-3 px-3 text-right tabular-nums font-normal text-[#1C2434] dark:text-[#E2E8F0]">
                              {displayVal}
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-right tabular-nums font-medium text-[#1C2434] dark:text-[#E2E8F0]">
                          {prod.units} units
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#5146E5] dark:text-[#818CF8]">
                          {formatINR(prod.revenue)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              prod.stockHealth === 'Critical'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                : prod.stockHealth === 'Low'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT VERIFIED TRANSACTIONS LEDGER */}
      <section
        className={`p-6 rounded-xl border transition-all ${
          isDark ? 'bg-[#24211F] border-[#36312C]' : 'bg-white border-[#E5DFD7]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD7] dark:border-[#36312C]">
          <div>
            <h3 className="text-base font-semibold text-[#1C2434] dark:text-[#E2E8F0] tracking-tight">
              Recent Verified Transactions
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Live order feed persisted in MongoDB Atlas production cluster.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-[#5146E5] hover:underline flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#36312C] text-[#8A837C]' : 'border-[#E5DFD7] text-[#64748B]'}`}>
                <th className="py-2.5 px-3 font-semibold">Order</th>
                <th className="py-2.5 px-3 font-semibold">User</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((ord: any) => (
                  <tr
                    key={ord.id || ord.orderNumber}
                    className={`transition-colors ${isDark ? 'hover:bg-[#191715]' : 'hover:bg-[#FAF8F5]'}`}
                  >
                    <td className="py-3 px-3 font-medium text-[#5146E5]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{ord.orderNumber}</span>
                        {(ord.isDemo || ord.orderNumber?.startsWith('DEMO-')) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 truncate max-w-[140px] text-[#1C2434] dark:text-[#E2E8F0]">
                      {ord.shippingAddress?.fullName || 'Valued User'}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8] truncate">
                      {ord.date}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : isDark
                            ? 'bg-[#5146E5]/15 text-[#818CF8]'
                            : 'bg-[#EEF0FF] text-[#5146E5]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#1C2434] dark:text-white tabular-nums">
                      {formatINR(ord.total || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs opacity-60">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
