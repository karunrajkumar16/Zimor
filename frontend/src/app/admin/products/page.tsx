'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Save,
  Palette,
  Layers,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  Boxes,
  FileText,
  Sliders,
  MoreHorizontal,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowUpDown,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { Product } from '@/types';

const CATEGORIES = [
  { id: 'tote-bags', label: 'Tote Bags' },
  { id: 'laptop-bags', label: 'Laptop Bags' },
  { id: 'shoulder-bags', label: 'Shoulder Bags' },
  { id: 'handbags', label: 'Handbags' },
  { id: 'crossbody', label: 'Crossbody Bags' },
];

const CATALOG_IMAGE_PRESETS = [
  {
    title: 'Delo 15.6" Tote — Front Stance',
    category: 'Totes',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
  },
  {
    title: 'Delo 15.6" Tote — Padded Tech Interior',
    category: 'Totes',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917828/zimor/products/delo-2.webp',
  },
  {
    title: 'Delo 15.6" Tote — Sculptural Silhouette',
    category: 'Totes',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917828/zimor/products/delo-3.webp',
  },
  {
    title: 'Delo 15.6" Tote — Matching Wristlet Set',
    category: 'Totes',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917829/zimor/products/delo-4.webp',
  },
  {
    title: 'Rabota Laptop Tote — Executive Front',
    category: 'Laptop Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917830/zimor/products/rabota-1.webp',
  },
  {
    title: 'Rabota Laptop Tote — Crossbody Carry',
    category: 'Laptop Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917831/zimor/products/rabota-2.webp',
  },
  {
    title: 'Rabota Laptop Tote — Hardware & Base Studs',
    category: 'Laptop Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917832/zimor/products/rabota-3.webp',
  },
  {
    title: 'Rabota Laptop Tote — Transit Agility',
    category: 'Laptop Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-4.webp',
  },
  {
    title: 'Classic Crescent — Architectural Flap',
    category: 'Shoulder Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917836/zimor/products/classic-1.webp',
  },
  {
    title: 'Classic Crescent — Gold Magnetic Lock',
    category: 'Shoulder Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917838/zimor/products/classic-2.webp',
  },
  {
    title: 'Classic Crescent — Dual Gusset Pockets',
    category: 'Shoulder Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917839/zimor/products/classic-3.webp',
  },
  {
    title: 'Classic Crescent — Evening Atelier Stance',
    category: 'Shoulder Bags',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917840/zimor/products/classic-4.webp',
  },
];

type SortField = 'name' | 'category' | 'brand' | 'price' | 'stock' | 'created';
type SortDirection = 'asc' | 'desc';

export default function AdminProductsPage() {
  const { isDark } = useAdminTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Active row action dropdown menu
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Pagination state (TailAdmin layout)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // All-In-One Studio Editor State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Studio Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState('tote-bags');
  const [formPrice, setFormPrice] = useState<number>(2999);
  const [formComparePrice, setFormComparePrice] = useState<number>(5199);
  const [formStock, setFormStock] = useState<number>(15);
  const [formDescription, setFormDescription] = useState('');
  const [formWhyLoveIt, setFormWhyLoveIt] = useState('');
  const [formLaptopCompatibility, setFormLaptopCompatibility] = useState('Up to 15.6 inch');
  const [formImages, setFormImages] = useState<{ url: string; alt?: string }[]>([]);
  const [formColors, setFormColors] = useState<{ name: string; hex: string }[]>([]);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formLength, setFormLength] = useState('40 cm');
  const [formHeight, setFormHeight] = useState('30 cm');
  const [formWidth, setFormWidth] = useState('15 cm');
  const [formStrapDrop, setFormStrapDrop] = useState('14 cm');
  const [formWeight, setFormWeight] = useState('0.70 kg');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsComingSoon, setFormIsComingSoon] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // New Image input temporary state
  const [newImageUrl, setNewImageUrl] = useState('');
  // New Color input temporary state
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  // New Feature bullet temporary state
  const [newFeatureText, setNewFeatureText] = useState('');

  // Product Image upload and catalog picker states
  const productImageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [isProductMediaModalOpen, setIsProductMediaModalOpen] = useState(false);
  const [productMediaSearch, setProductMediaSearch] = useState('');

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingProductImages(true);
    setMessage(null);

    const newUploadedImages: { url: string; alt: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'zimor/products');

        const res = await apiFetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const uploadedUrl = data.media?.url || data.url;
          if (uploadedUrl) {
            newUploadedImages.push({ url: uploadedUrl, alt: formName || file.name.replace(/\.[^/.]+$/, '') });
          }
        } else {
          // Fallback to FileReader DataURL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          });
          if (dataUrl) {
            newUploadedImages.push({ url: dataUrl, alt: formName || file.name.replace(/\.[^/.]+$/, '') });
          }
        }
      } catch {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
        if (dataUrl) {
          newUploadedImages.push({ url: dataUrl, alt: formName || file.name.replace(/\.[^/.]+$/, '') });
        }
      }
    }

    if (newUploadedImages.length > 0) {
      setFormImages((prev) => [...prev, ...newUploadedImages]);
      setMessage({ type: 'success', text: `${newUploadedImages.length} image(s) uploaded and added to product!` });
    }

    setUploadingProductImages(false);
    if (productImageInputRef.current) productImageInputRef.current.value = '';
  };

  const setAsPrimaryImage = (index: number) => {
    if (index === 0) return;
    const updated = [...formImages];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setFormImages(updated);
  };

  // Close action menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditor = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingNew(false);
    setActionMenuOpenId(null);
    setFormName(prod.name || '');
    setFormSlug(prod.slug || '');
    setFormTagline(prod.tagline || '');
    setFormCategory(prod.category || 'tote-bags');
    setFormPrice(prod.price || 2999);
    setFormComparePrice(prod.compareAtPrice || 5199);
    setFormStock(prod.stock ?? 15);
    setFormDescription(prod.description || '');
    setFormWhyLoveIt((prod as any).whyYoullLoveIt || '');
    setFormLaptopCompatibility((prod as any).laptopCompatibility || 'Up to 15.6 inch');
    setFormImages(prod.images || []);
    setFormColors(prod.colors || []);
    setFormFeatures(prod.features || []);
    setFormLength(prod.dimensions?.length || '40 cm');
    setFormHeight(prod.dimensions?.height || '30 cm');
    setFormWidth(prod.dimensions?.width || '15 cm');
    setFormStrapDrop(prod.dimensions?.strapDrop || '14 cm');
    setFormWeight(prod.dimensions?.weight || '0.70 kg');
    setFormIsFeatured(Boolean(prod.isFeatured));
    setFormIsComingSoon(prod.isComingSoon ?? false);
    setFormIsPublished(prod.isPublished !== false);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNewProductForm = () => {
    setEditingProduct(null);
    setIsCreatingNew(true);
    setActionMenuOpenId(null);
    setFormName('');
    setFormSlug('');
    setFormTagline('');
    setFormCategory('tote-bags');
    setFormPrice(2999);
    setFormComparePrice(5199);
    setFormStock(20);
    setFormDescription('');
    setFormWhyLoveIt('');
    setFormLaptopCompatibility('Up to 15.6 inch');
    setFormImages([]); // Start with clean empty array so admin can upload their own images
    setFormColors([
      { name: 'Noir Black', hex: '#1C1917' },
      { name: 'Rust', hex: '#C73030' },
    ]);
    setFormFeatures([
      'Spacious main compartment with dedicated padded laptop section',
      'Superior Faux leather with high-grade metal hardware',
      'Comfortable dual shoulder carry handles',
    ]);
    setFormLength('40 cm');
    setFormHeight('30 cm');
    setFormWidth('15 cm');
    setFormStrapDrop('14 cm');
    setFormWeight('0.70 kg');
    setFormIsFeatured(false);
    setFormIsComingSoon(false);
    setFormIsPublished(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeEditor = () => {
    setEditingProduct(null);
    setIsCreatingNew(false);
    setMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const generatedSlug = (editingProduct?.slug && !isCreatingNew)
      ? editingProduct.slug
      : formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryObj = CATEGORIES.find((c) => c.id === formCategory);

    const payload: Partial<Product> = {
      name: formName,
      slug: generatedSlug,
      tagline: formTagline,
      category: formCategory,
      categoryLabel: categoryObj?.label || 'Tote Bags',
      price: Number(formPrice),
      compareAtPrice: Number(formComparePrice),
      stock: Number(formStock),
      description: formDescription,
      whyYoullLoveIt: formWhyLoveIt,
      laptopCompatibility: formLaptopCompatibility,
      images: formImages.map((img) => ({ url: img.url, alt: img.alt || formName })),
      colors: formColors,
      defaultColor: formColors[0]?.name || 'Noir Black',
      sizes: ['Standard'],
      features: formFeatures,
      dimensions: {
        length: formLength,
        height: formHeight,
        width: formWidth,
        strapDrop: formStrapDrop,
        weight: formWeight,
      },
      isFeatured: formIsFeatured,
      isComingSoon: formIsComingSoon,
      isPublished: formIsPublished,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.product) {
        setMessage({
          type: 'success',
          text: `Product "${resData.product.name}" successfully saved to catalog!`,
        });
        await fetchProducts();
        setTimeout(() => {
          closeEditor();
        }, 1200);
      } else {
        throw new Error(resData.error || 'Failed to save product');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving product' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog?`)) return;
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleTogglePublish = async (prod: Product) => {
    const currentStatus = prod.isPublished !== false;
    const newStatus = !currentStatus;
    try {
      const res = await apiFetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, isPublished: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  // Bulk actions
  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: publish }),
          })
        )
      );
      setProducts((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, isPublished: publish } : p))
      );
      setMessage({
        type: 'success',
        text: `Updated live status for ${selectedIds.size} product(s).`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update selected products.' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected products permanently?`)) return;
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => apiFetch(`/api/products/${id}`, { method: 'DELETE' })));
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setMessage({ type: 'success', text: `Deleted ${ids.length} product(s).` });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete selected products.' });
    }
  };

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtering & Sorting pipeline
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      let matchesStock = true;
      const stock = p.stock ?? 0;
      if (stockFilter === 'in_stock') matchesStock = stock > 5;
      else if (stockFilter === 'low_stock') matchesStock = stock > 0 && stock <= 5;
      else if (stockFilter === 'out_of_stock') matchesStock = stock === 0;

      return matchesSearch && matchesCat && matchesStock;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'category') {
        const catA = a.categoryLabel || a.category || '';
        const catB = b.categoryLabel || b.category || '';
        comparison = catA.localeCompare(catB);
      } else if (sortField === 'brand') {
        comparison = 'ZIMOR'.localeCompare('ZIMOR');
      } else if (sortField === 'price') {
        comparison = (a.price || 0) - (b.price || 0);
      } else if (sortField === 'stock') {
        comparison = (a.stock ?? 0) - (b.stock ?? 0);
      } else if (sortField === 'created') {
        const dateA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const dateB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, search, selectedCategory, stockFilter, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Selection helpers
  const allCurrentPageSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id));

  const toggleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cardBg = isDark
    ? 'bg-[#1E1C1A] border-[#2E3A47]'
    : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-xs';

  const inputClass = isDark
    ? 'w-full px-3 py-2 bg-[#25221F] border border-[#36312C] rounded-md text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220]'
    : 'w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD7] rounded-md text-xs text-[#24211F] placeholder-[#8C837A] focus:outline-none focus:border-[#B44220] focus:bg-[#FFFFFF]';

  return (
    <div className="space-y-6">
      {/* Studio Header Bar when editing or creating */}
      {(editingProduct || isCreatingNew) ? (
        <form onSubmit={handleSaveProduct} className="space-y-6">
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
              }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="p-1.5 rounded-md hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#B44220]" />
                <span>Back to Products</span>
              </button>
              <span className="opacity-30">|</span>
              <span className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">
                {isCreatingNew ? 'Create New Product' : `Editing: ${editingProduct?.name}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#E5DFD7] dark:border-[#36312C] text-[#5A534E] dark:text-[#B4B4B4] hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Product Changes'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Identity & Category */}
          <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-[#E5DFD7] dark:border-[#36312C]">
              <FileText className="w-4 h-4 text-[#B44220]" />
              <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">1. Product Identity & Category</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-semibold mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. ZIMOR DELO TOTE"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block font-semibold mb-1">Category / Type *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-semibold mb-1">Tagline / Subheading</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Structured Architectural Laptop Tote"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-[#E5DFD7] dark:border-[#36312C]">
              <DollarSign className="w-4 h-4 text-[#2E7D5A]" />
              <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">2. Pricing & Warehouse Inventory</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Selling Price (₹ INR) *</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  required
                  min={0}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">MRP / Compare At Price (₹ INR)</label>
                <input
                  type="number"
                  value={formComparePrice}
                  onChange={(e) => setFormComparePrice(Number(e.target.value))}
                  min={0}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Stock Units Available *</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  required
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-[#E5DFD7] dark:border-[#36312C]">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">3. Editorial Description & Story</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={inputClass}
                  placeholder="Detail the product design, construction, and lifestyle utility..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Why You'll Love It</label>
                  <textarea
                    rows={2}
                    value={formWhyLoveIt}
                    onChange={(e) => setFormWhyLoveIt(e.target.value)}
                    className={inputClass}
                    placeholder="Key highlights that make this piece extraordinary..."
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Laptop & Device Compatibility</label>
                  <input
                    type="text"
                    value={formLaptopCompatibility}
                    onChange={(e) => setFormLaptopCompatibility(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Padded compartment for up to 15.6 inch laptops"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Imagery */}
          <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center justify-between border-[#E5DFD7] dark:border-[#36312C]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">4. Product High-Resolution Imagery</h2>
              </div>
              <span className="text-[11px] text-[#8C837A]">{formImages.length} images added</span>
            </div>

            {/* Hidden file input for uploading from device */}
            <input
              ref={productImageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleProductImageUpload}
            />

            {/* Upload Buttons & Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => productImageInputRef.current?.click()}
                disabled={uploadingProductImages}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#B44220] hover:bg-[#9B381B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingProductImages ? 'Uploading Images...' : 'Upload Images from Computer'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProductMediaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#24211F] dark:text-[#E8E1DA] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B44220]" />
                <span>Browse Catalog / Library</span>
              </button>
            </div>

            {/* Optional URL Input */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (https://res.cloudinary.com/... or /products/...)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  if (newImageUrl.trim()) {
                    setFormImages([...formImages, { url: newImageUrl.trim(), alt: formName }]);
                    setNewImageUrl('');
                  }
                }}
                className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#25221F] border border-[#E5DFD7] dark:border-[#36312C] rounded-md text-xs font-semibold hover:border-[#B44220] transition-colors shrink-0 cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Image Thumbnails Grid or Empty State */}
            {formImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {formImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group aspect-square rounded-lg overflow-hidden border bg-[#FAF7F2] dark:bg-[#25221F] ${
                      idx === 0 ? 'ring-2 ring-[#B44220] border-transparent' : 'border-[#E5DFD7] dark:border-[#36312C]'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || formName} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsPrimaryImage(idx)}
                          className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B44220] text-white uppercase tracking-wider shadow-xs">
                        Primary Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => productImageInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-[#E5DFD7] dark:border-[#36312C] rounded-lg text-center space-y-2 bg-[#FAF7F2]/50 dark:bg-[#1E1C1A]/50 cursor-pointer hover:border-[#B44220] transition-colors"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-[#B44220]/10 flex items-center justify-center text-[#B44220]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                  No images added yet
                </p>
                <p className="text-[11px] text-[#8C837A] max-w-sm mx-auto">
                  Click here to upload product images from your computer, or use the buttons above to browse existing catalog photos.
                </p>
              </div>
            )}
          </div>

          {/* Section 5: Visibility & Publishing */}
          <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-[#E5DFD7] dark:border-[#36312C]">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">5. Storefront Publishing & Badging</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B44220] focus:ring-0"
                />
                <div>
                  <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">Published on Storefront</p>
                  <p className="text-[10px] text-[#8C837A]">Live and visible to shoppers</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B44220] focus:ring-0"
                />
                <div>
                  <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">Featured on Homepage</p>
                  <p className="text-[10px] text-[#8C837A]">Elevated in curated highlights</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsComingSoon}
                  onChange={(e) => setFormIsComingSoon(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B44220] focus:ring-0"
                />
                <div>
                  <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">Coming Soon Flag</p>
                  <p className="text-[10px] text-[#8C837A]">Displays waitlist / notify badge</p>
                </div>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between sticky bottom-4 z-20 backdrop-blur-md ${isDark ? 'bg-[#1E1C1A]/95 border-[#36312C]' : 'bg-[#FFFFFF]/95 border-[#E5DFD7] shadow-lg'
              }`}
          >
            <button
              type="button"
              onClick={closeEditor}
              className="px-4 py-2 text-xs font-medium rounded-md border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] transition-colors cursor-pointer"
            >
              Cancel & Exit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold bg-[#B44220] hover:bg-[#9B381B] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* =========================================================================
           TAILADMIN PRODUCTS-LIST VISUAL LAYOUT
           ========================================================================= */
        <div className="space-y-4">
          {/* Top Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
                Products
              </h1>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                Manage your luxury leather product catalog, inventory, and storefront pricing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchProducts}
                title="Refresh products list"
                className="p-2 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] bg-[#FFFFFF] dark:bg-[#1E1C1A] text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#B44220] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={openNewProductForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#B44220] hover:bg-[#963518] text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {message && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Master TailAdmin Table Card */}
          <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
            {/* Top Table Control Bar (Search, Category Filter, Stock Filter, Bulk Actions) */}
            <div
              className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
                }`}
            >
              {/* Search Bar with shortcut hint (matching TailAdmin demo) */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-[#8C837A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search or type command..."
                  className={`w-full pl-9 pr-14 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B44220] transition-colors border ${isDark
                    ? 'bg-[#25221F] border-[#36312C] text-[#E8E1DA] placeholder-[#78726C]'
                    : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] placeholder-[#8C837A]'
                    }`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#8C837A] bg-[#FFFFFF] dark:bg-[#1E1C1A]">
                  ⌘K
                </span>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#B44220] transition-colors cursor-pointer ${isDark
                    ? 'bg-[#25221F] border-[#36312C] text-[#E8E1DA]'
                    : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                    }`}
                >
                  <option value="all">All Categories ({products.length})</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                {/* Stock Status Filter */}
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#B44220] transition-colors cursor-pointer ${isDark
                    ? 'bg-[#25221F] border-[#36312C] text-[#E8E1DA]'
                    : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                    }`}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt; 5)</option>
                  <option value="low_stock">Low Stock (1 - 5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            {/* Bulk Selection Notice Bar */}
            {selectedIds.size > 0 && (
              <div
                className={`px-4 py-2.5 border-b flex items-center justify-between text-xs ${isDark ? 'bg-[#25221F] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
                  }`}
              >
                <span className="font-semibold text-[#B44220]">
                  {selectedIds.size} product(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkPublish(true)}
                    className="px-2.5 py-1 rounded border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FFFFFF] dark:hover:bg-[#1E1C1A] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkPublish(false)}
                    className="px-2.5 py-1 rounded border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FFFFFF] dark:hover:bg-[#1E1C1A] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[#8C837A] hover:text-[#24211F] dark:hover:text-[#E8E1DA] ml-2 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Table Component */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className={`border-b text-sm font-medium ${isDark
                      ? 'border-[#2E3A47] bg-[#1E1C1A] text-[#94A3B8]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B]'
                      }`}
                  >
                    {/* Checkbox */}
                    <th className="py-4 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={toggleSelectAllCurrentPage}
                        className="w-4 h-4 rounded text-[#1C2434] border-gray-300 focus:ring-0 cursor-pointer"
                      />
                    </th>

                    {/* Products Column */}
                    <th
                      onClick={() => handleSort('name')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Products</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Category Column */}
                    <th
                      onClick={() => handleSort('category')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Category</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Brand Column */}
                    <th
                      onClick={() => handleSort('brand')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Brand</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Price Column */}
                    <th
                      onClick={() => handleSort('price')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Price</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Stock Column */}
                    <th
                      onClick={() => handleSort('stock')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Stock</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Created Column */}
                    <th
                      onClick={() => handleSort('created')}
                      className="py-4 px-4 cursor-pointer hover:text-[#1C2434] dark:hover:text-white transition-colors select-none font-medium"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Created</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </th>

                    {/* Actions Column */}
                    <th className="py-4 px-4 text-right w-16 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${isDark ? 'divide-[#2E3A47]' : 'divide-[#E2E8F0]'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs opacity-60">
                        Loading product catalog...
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs opacity-60">
                        No products found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => {
                      const isSelected = selectedIds.has(p.id);
                      const stockCount = p.stock ?? 0;
                      const isLowStock = stockCount > 0 && stockCount <= 5;
                      const isOutOfStock = stockCount === 0;

                      // Format created date nicely like reference (e.g. "29 Jun, 2024")
                      const createdFormatted = (p as any).createdAt
                        ? new Date((p as any).createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        : '14 Nov, 2026';

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${isSelected
                            ? isDark
                              ? 'bg-[#25221F]'
                              : 'bg-[#F8FAFC]'
                            : isDark
                              ? 'hover:bg-[#25221F]'
                              : 'hover:bg-[#F8FAFC]'
                            }`}
                        >
                          {/* Row Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(p.id)}
                              className="w-4 h-4 rounded text-[#1C2434] border-gray-300 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Product Thumbnail + Name (TailAdmin Layout) */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {/* Square Thumbnail */}
                              <div className="w-11 h-11 rounded-lg overflow-hidden relative shrink-0 bg-gray-100 dark:bg-[#25221F] border border-[#E2E8F0] dark:border-[#2E3A47]">
                                <Image
                                  src={
                                    p.images?.[0]?.url ||
                                    'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'
                                  }
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => openEditor(p)}
                                  className="font-normal text-left text-sm text-[#1C2434] dark:text-[#E2E8F0] hover:text-[#2563EB] transition-colors cursor-pointer line-clamp-1"
                                >
                                  {p.name}
                                </button>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                                    /{p.slug}
                                  </span>
                                  {p.isPublished === false && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-[#64748B] font-medium uppercase">
                                      Draft
                                    </span>
                                  )}
                                  {p.isComingSoon && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 font-medium uppercase">
                                      Coming Soon
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal text-sm">
                            {p.categoryLabel || p.category}
                          </td>

                          {/* Brand (TailAdmin Column) */}
                          <td className="py-4 px-4 font-normal text-[#1C2434] dark:text-[#E2E8F0] text-sm">
                            ZIMOR
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4 font-normal text-[#1C2434] dark:text-[#E2E8F0] text-sm">
                            <span>₹{p.price?.toLocaleString('en-IN')}</span>
                            {p.compareAtPrice && p.compareAtPrice > p.price && (
                              <span className="line-through text-[#64748B] dark:text-[#94A3B8] text-xs ml-1.5 font-normal">
                                ₹{p.compareAtPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>

                          {/* Stock Status (Matching Invoices Status style) */}
                          <td className="py-4 px-4">
                            {isOutOfStock ? (
                              <span className="text-[#EF4444] font-medium text-sm">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[#F59E0B] font-medium text-sm">
                                Low Stock ({stockCount})
                              </span>
                            ) : (
                              <span className="text-[#10B981] font-medium text-sm">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal text-sm whitespace-nowrap">
                            {createdFormatted}
                          </td>

                          {/* Row Actions Menu Button (...) */}
                          <td className="py-3.5 px-4 text-right relative">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpenId(actionMenuOpenId === p.id ? null : p.id);
                                }}
                                className="p-1.5 rounded-md hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#8C837A] hover:text-[#24211F] dark:hover:text-[#E8E1DA] transition-colors cursor-pointer"
                                title="Actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {actionMenuOpenId === p.id && (
                                <div
                                  ref={actionMenuRef}
                                  className={`absolute right-0 mt-1 w-44 rounded-lg shadow-lg border py-1 z-30 ${isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FFFFFF] border-[#E5DFD7]'
                                    }`}
                                >
                                  <button
                                    onClick={() => openEditor(p)}
                                    className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#24211F] dark:text-[#E8E1DA] cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#B44220]" />
                                    <span>Edit Product</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      handleTogglePublish(p);
                                      setActionMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#24211F] dark:text-[#E8E1DA] cursor-pointer"
                                  >
                                    {p.isPublished !== false ? (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                        <span>Hide / Draft</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Publish Live</span>
                                      </>
                                    )}
                                  </button>

                                  <Link
                                    href={`/product/${p.slug}`}
                                    target="_blank"
                                    onClick={() => setActionMenuOpenId(null)}
                                    className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#24211F] dark:text-[#E8E1DA] cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>View on Store</span>
                                  </Link>

                                  <div className="border-t my-1 border-[#E5DFD7] dark:border-[#36312C]" />

                                  <button
                                    onClick={() => {
                                      handleDeleteProduct(p.id, p.name);
                                      setActionMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar (TailAdmin Exact Layout) */}
            <div
              className={`p-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs ${isDark ? 'border-[#36312C] text-[#8A837C]' : 'border-[#E5DFD7] text-[#5A534E]'
                }`}
            >
              {/* Left: Showing X to Y of Z */}
              <div>
                {totalItems > 0 ? (
                  <span>
                    Showing <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                      {Math.min(startIndex + itemsPerPage, totalItems)}
                    </span>{' '}
                    of <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">{totalItems}</span>
                  </span>
                ) : (
                  <span>Showing 0 to 0 of 0</span>
                )}
              </div>

              {/* Right: Pagination Buttons [←] [1] [2] [3] [→] */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage === 1}
                    className="p-1.5 rounded-md border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-[#B44220] text-white shadow-xs'
                          : 'border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] text-[#5A534E] dark:text-[#B4B4B4]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validCurrentPage === totalPages}
                    className="p-1.5 rounded-md border border-[#E5DFD7] dark:border-[#36312C] hover:bg-[#FAF7F2] dark:hover:bg-[#25221F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Imagery Modal */}
      {isProductMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`relative w-full max-w-4xl max-h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden ${cardBg}`}>
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between border-[#E5DFD7] dark:border-[#36312C]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B44220]" />
                <h3 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
                  Choose Product Imagery from Catalog
                </h3>
              </div>
              <button
                onClick={() => setIsProductMediaModalOpen(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader: Search & Upload CTA */}
            <div className="p-4 border-b border-[#E5DFD7] dark:border-[#36312C] flex flex-wrap items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productMediaSearch}
                  onChange={(e) => setProductMediaSearch(e.target.value)}
                  placeholder="Search catalog photos (e.g. Delo, Rabota, Crescent)..."
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  productImageInputRef.current?.click();
                  setIsProductMediaModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#B44220] hover:bg-[#9B381B] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
            </div>

            {/* Modal Grid of Catalog Images */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CATALOG_IMAGE_PRESETS.filter(
                (p) =>
                  p.title.toLowerCase().includes(productMediaSearch.toLowerCase()) ||
                  p.category.toLowerCase().includes(productMediaSearch.toLowerCase())
              ).map((preset, idx) => {
                const isAlreadyAdded = formImages.some((img) => img.url === preset.url);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isAlreadyAdded) {
                        setFormImages((prev) => [...prev, { url: preset.url, alt: preset.title }]);
                        setMessage({ type: 'success', text: `Added "${preset.title}" to product imagery!` });
                      }
                    }}
                    className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isAlreadyAdded
                        ? 'border-[#B44220] ring-2 ring-[#B44220]/20 opacity-80'
                        : 'border-[#E5DFD7] dark:border-[#36312C] hover:border-[#B44220]'
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-[#FAF7F2] dark:bg-[#1E1C1A]">
                      <Image src={preset.url} alt={preset.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded bg-white text-black text-[11px] font-bold shadow-md">
                          {isAlreadyAdded ? 'Already Added' : 'Add to Product'}
                        </span>
                      </div>
                      {isAlreadyAdded && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#B44220] text-white text-[9px] font-bold shadow-xs">
                          Added
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] uppercase font-mono text-[#B44220] font-semibold block">
                        {preset.category}
                      </span>
                      <p className="text-[11px] font-medium text-[#24211F] dark:text-[#E8E1DA] truncate mt-0.5">
                        {preset.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#E5DFD7] dark:border-[#36312C] flex items-center justify-between text-xs text-slate-400">
              <span>Click on any image to add it directly to this product.</span>
              <button
                onClick={() => setIsProductMediaModalOpen(false)}
                className="px-3 py-1.5 rounded border border-[#E5DFD7] dark:border-[#36312C] hover:bg-black/5 dark:hover:bg-white/5 text-[#24211F] dark:text-[#E8E1DA] font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
