'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Info,
  DollarSign,
  Boxes,
  FileText,
  Sliders,
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

export default function AdminProductsPage() {
  const { isDark } = useAdminTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // All-In-One Single-Page Studio Editor State
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
    setFormImages([
      { url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp', alt: 'Silhouette front view' },
      { url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917828/zimor/products/delo-2.webp', alt: 'Interior organization' },
    ]);
    setFormColors([
      { name: 'Noir Black', hex: '#1C1917' },
      { name: 'Rust', hex: '#C73030' },
    ]);
    setFormFeatures([
      'Spacious main compartment with dedicated padded laptop section',
      'Superior Faux leather with high-grade metal zippers',
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

    const generatedSlug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

  const addImageToForm = () => {
    if (!newImageUrl.trim()) return;
    setFormImages([...formImages, { url: newImageUrl.trim(), alt: formName }]);
    setNewImageUrl('');
  };

  const removeImageFromForm = (idx: number) => {
    setFormImages(formImages.filter((_, i) => i !== idx));
  };

  const addColorToForm = () => {
    if (!newColorName.trim()) return;
    setFormColors([...formColors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const removeColorFromForm = (idx: number) => {
    setFormColors(formColors.filter((_, i) => i !== idx));
  };

  const addFeatureToForm = () => {
    if (!newFeatureText.trim()) return;
    setFormFeatures([...formFeatures, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const removeFeatureFromForm = (idx: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== idx));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  const inputClass = isDark
    ? 'w-full px-3 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220]'
    : 'w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD7] rounded text-xs text-[#24211F] placeholder-[#8C837A] focus:outline-none focus:border-[#B44220] focus:bg-[#FFFFFF]';

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BAR: TITLE & PRIMARY ACTION
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            All-In-One Products Studio
          </h1>
          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}
          >
            Manage entire silhouette attributes in one single place: images, colors, descriptions, specs, and pricing.
          </p>
        </div>

        {!editingProduct && !isCreatingNew && (
          <button
            onClick={openNewProductForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#963518] text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Silhouette</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          NOTIFICATION ALERT
          ========================================================================= */}
      {message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODE 1: ALL-IN-ONE SINGLE-PAGE PRODUCT STUDIO EDITOR
          (Shows when editing existing product or creating new product)
          ========================================================================= */}
      {(editingProduct || isCreatingNew) && (
        <form onSubmit={handleSaveProduct} className="space-y-6">
          {/* Studio Header Bar */}
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="p-1.5 rounded hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#B44220]" />
                <span>Back to Catalog</span>
              </button>
              <span className="opacity-30">|</span>
              <span className="text-xs font-bold text-[#24211F] dark:text-[#E8E1DA]">
                {isCreatingNew ? 'Creating New Silhouette' : `Editing: ${editingProduct?.name}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="px-3.5 py-2 text-xs font-medium rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#5A534E] dark:text-[#B4B4B4] hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Product Changes'}</span>
              </button>
            </div>
          </div>

          {/* Studio Section 1: Core Identity & Classification */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-[#222428]">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold">1. Silhouette Identity & Category</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2">
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

              <div>
                <label className="block font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. zimor-delo-tote"
                  className={inputClass}
                />
              </div>

              <div>
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
                <label className="block font-semibold mb-1">Tagline (Editorial Headline)</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Structured Elegance for Daily Commutes & Boardroom Presence"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Studio Section 2: Pricing, Stock Units & Commercials */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-[#222428]">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold">2. Pricing & Live Inventory Units</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Selling Price (₹ INR) *</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  required
                  className={inputClass}
                />
                <p className="text-[10px] text-slate-400 mt-1">Payable amount charged at checkout</p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Compare-At / MRP Price (₹ INR)</label>
                <input
                  type="number"
                  value={formComparePrice}
                  onChange={(e) => setFormComparePrice(Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-[10px] text-slate-400 mt-1">Strikethrough original price (discount badge)</p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Inventory Stock Units *</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  required
                  className={inputClass}
                />
                <p className="text-[10px] text-slate-400 mt-1">Units available in warehouse</p>
              </div>
            </div>
          </div>

          {/* Studio Section 3: Visual Image Gallery */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center justify-between border-slate-100 dark:border-[#222428]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold">3. Product Image Gallery & Views</h2>
              </div>
              <span className="text-[11px] text-slate-400">{formImages.length} images assigned</span>
            </div>

            {/* Existing Image Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {formImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-md overflow-hidden aspect-square border border-slate-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Product image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                    #{idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImageFromForm(idx)}
                    title="Remove Image"
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image URL bar */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Image URL (e.g. /products/delo-1.webp or Cloudinary URL)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addImageToForm}
                className="px-4 py-2 bg-slate-800 dark:bg-neutral-700 text-white text-xs font-semibold rounded shrink-0 hover:opacity-90"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Studio Section 4: Color Variations & Swatches */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center justify-between border-slate-100 dark:border-[#222428]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-bold">4. Color Options & Swatches</h2>
              </div>
              <span className="text-[11px] text-slate-400">{formColors.length} colors configured</span>
            </div>

            {/* Active Color Chips */}
            <div className="flex flex-wrap gap-2.5">
              {formColors.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs font-medium"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{col.hex}</span>
                  <button
                    type="button"
                    onClick={() => removeColorFromForm(idx)}
                    className="text-slate-400 hover:text-red-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Color inputs */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Color Name (e.g. Espresso Roast)"
                className="flex-1 min-w-[160px] px-3 py-2 bg-slate-50 dark:bg-[#181a1d] border border-slate-200 dark:border-[#272a2f] rounded text-xs"
              />
              <div className="flex items-center gap-1.5 px-2 py-1.5 border border-slate-200 dark:border-[#272a2f] rounded bg-slate-50 dark:bg-[#181a1d]">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs font-mono">{newColorHex}</span>
              </div>
              <button
                type="button"
                onClick={addColorToForm}
                className="px-4 py-2 bg-slate-800 dark:bg-neutral-700 text-white text-xs font-semibold rounded shrink-0 hover:opacity-90"
              >
                Add Color Option
              </button>
            </div>
          </div>

          {/* Studio Section 5: Story, Description & Features */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-[#222428]">
              <FileText className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold">5. Product Description & Why You'll Love It</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Description Story *</label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  placeholder="Detailed description of craftsmanship, texture, capacity and luxury aesthetic..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">"Why You'll Love It" Highlight</label>
                <textarea
                  rows={2}
                  value={formWhyLoveIt}
                  onChange={(e) => setFormWhyLoveIt(e.target.value)}
                  placeholder="Key highlight sentence presented on PDP..."
                  className={inputClass}
                />
              </div>

              {/* Feature Bullet Points */}
              <div>
                <label className="block font-semibold mb-2">Key Features (Bullet Points)</label>
                <div className="space-y-2 mb-2">
                  {formFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className="flex-1 text-xs">{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeatureFromForm(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add a new bullet feature (e.g. Fits 15.6 inch MacBook Pro)"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addFeatureToForm}
                    className="px-4 py-2 bg-slate-800 dark:bg-neutral-700 text-white text-xs font-semibold rounded shrink-0 hover:opacity-90"
                  >
                    Add Bullet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Section 6: Dimensions, Specs & Laptop Size */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-[#222428]">
              <Boxes className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold">6. Exact Dimensions & Specifications</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Length</label>
                <input
                  type="text"
                  value={formLength}
                  onChange={(e) => setFormLength(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Height</label>
                <input
                  type="text"
                  value={formHeight}
                  onChange={(e) => setFormHeight(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Width</label>
                <input
                  type="text"
                  value={formWidth}
                  onChange={(e) => setFormWidth(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Strap Drop</label>
                <input
                  type="text"
                  value={formStrapDrop}
                  onChange={(e) => setFormStrapDrop(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Weight</label>
                <input
                  type="text"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Laptop Fit</label>
                <input
                  type="text"
                  value={formLaptopCompatibility}
                  onChange={(e) => setFormLaptopCompatibility(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Studio Section 7: Merchandising Toggles */}
          <div className={`p-6 rounded-lg border ${cardBg} space-y-4`}>
            <div className="border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-[#222428]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold">7. Merchandising Status & Visibility</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded border border-slate-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0"
                />
                <div>
                  <p className="font-semibold">Featured on Homepage</p>
                  <p className="text-[11px] text-slate-400">Display this bag in the Curated Atelier Silhouettes collection</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded border border-slate-200 dark:border-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsComingSoon}
                  onChange={(e) => setFormIsComingSoon(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0"
                />
                <div>
                  <p className="font-semibold">Mark as Coming Soon</p>
                  <p className="text-[11px] text-slate-400">Display Coming Soon badge and Notify Me action</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded border border-slate-200 dark:border-neutral-700 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0"
                />
                <div>
                  <p className="font-semibold">Published on Live Storefront</p>
                  <p className="text-[11px] text-slate-400">When enabled, this silhouette is visible on the shop page, search, and category listings.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Fixed-Style Action Row */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between sticky bottom-4 z-20 backdrop-blur-md ${
              isDark ? 'bg-[#181a1d]/90 border-[#272a2f]' : 'bg-white/90 border-slate-200 shadow-lg'
            }`}
          >
            <button
              type="button"
              onClick={closeEditor}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              Cancel & Exit Studio
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold bg-[#B44220] hover:bg-[#963518] text-white shadow-xs disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          MODE 2: MASTER SILHOUETTE CATALOG TABLE
          (Shows when not in editor mode)
          ========================================================================= */}
      {!editingProduct && !isCreatingNew && (
        <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
          {/* Catalog Filter Controls */}
          <div
            className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
            }`}
          >
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#8C837A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search silhouettes by name, slug..."
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] rounded text-xs text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#B44220]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] rounded text-xs font-medium text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#B44220]"
              >
                <option value="all">All Categories ({products.length})</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b font-medium uppercase tracking-wider text-[10px] ${
                    isDark
                      ? 'border-[#36312C] bg-[#1E1C1A] text-[#B4B4B4]'
                      : 'border-[#E5DFD7] bg-[#EEE8DF] text-[#5A534E]'
                  }`}
                >
                  <th className="py-3 px-4">Silhouette</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Color Options</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD7] dark:divide-[#36312C]">
                {filteredProducts.map((p) => {
                  const isLow = (p.stock ?? 0) <= 5;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F3EEE6] dark:hover:bg-[#2C2825] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-[#EDE7DE] dark:bg-[#1E1C1A] relative overflow-hidden border border-[#E5DFD7] dark:border-[#36312C] shrink-0">
                            <Image
                              src={p.images?.[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#24211F] dark:text-[#E8E1DA]">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] font-mono">
                              /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#5A534E] dark:text-[#B4B4B4]">
                          {p.categoryLabel || p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-[#24211F] dark:text-[#E8E1DA]">
                            ₹{p.price?.toLocaleString('en-IN')}
                          </span>
                          {p.compareAtPrice && (
                            <span className="line-through text-[#8C837A] dark:text-[#8A837C] text-[10px] ml-1.5">
                              ₹{p.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-semibold ${
                            isLow
                              ? 'text-[#C07D2B] dark:text-[#F0B265]'
                              : 'text-[#24211F] dark:text-[#E8E1DA]'
                          }`}
                        >
                          {p.stock ?? 0} units
                        </span>
                        {isLow && (
                          <span className="block text-[10px] text-[#C07D2B] dark:text-[#F0B265] font-semibold">
                            Low Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.colors?.map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] ml-1">
                            ({p.colors?.length || 0})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                              p.isPublished !== false
                                ? 'bg-[#2E7D5A]/10 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697] border-[#2E7D5A]/25 hover:bg-[#2E7D5A]/20'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25 hover:bg-slate-500/20'
                            }`}
                            title="Click to toggle publication on storefront"
                          >
                            {p.isPublished !== false ? '● Published' : '○ Hidden / Draft'}
                          </button>
                          {p.isComingSoon && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#C07D2B]/10 text-[#9C611B] dark:bg-[#C07D2B]/15 dark:text-[#F0B265] border border-[#C07D2B]/25">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditor(p)}
                            className="p-1.5 rounded hover:bg-[#B44220]/10 text-[#B44220] dark:text-[#E07A5F] font-semibold text-xs flex items-center gap-1 transition-colors"
                            title="Edit all attributes on one page"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Studio</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded hover:bg-[#B9382C]/10 text-[#8C837A] hover:text-[#9C281D] dark:hover:text-[#F28B82] transition-colors"
                            title="Delete silhouette"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
