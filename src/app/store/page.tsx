"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, ShoppingBag, Package, Heart, Star, LayoutGrid, List,
  SlidersHorizontal, X, ChevronRight, ShoppingCart, Eye, Filter, ArrowLeft
} from "lucide-react";
import Link from "next/link";

type Product = {
  id: string; name: string; category: string; price: number;
  stock: number; unit: string; rating?: number; reviews?: number;
  imageUrl?: string; className?: string; subject?: string; description?: string | null;
};

const STAR_RATINGS: Record<string, { rating: number; reviews: number }> = {};

function StarDisplay({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs text-slate-400 ml-1">({reviews})</span>
    </div>
  );
}

function ListProductRow({ 
  product, index, cartQty, updateCartQty, setDetailProduct 
}: { 
  product: Product, index: number, cartQty: number,
  updateCartQty: (p:Product, q:number)=>void, setDetailProduct: (p:Product)=>void 
}) {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors bg-slate-100/50">
       <td className="p-3 text-center font-bold text-slate-800 hidden sm:table-cell">{String(index + 1).padStart(2, '0')}</td>
       <td className="p-2 hidden sm:table-cell">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0 mx-auto overflow-hidden shadow-sm">
             {product.imageUrl ? (
               <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
             ) : (
               <Package className="w-6 h-6 text-slate-300" />
             )}
          </div>
       </td>
       <td className="p-3 text-center text-sm font-bold text-slate-700 hidden sm:table-cell">{String(index + 1).padStart(2, '0')}</td>
       <td className="p-3">
          <h3 className="font-bold text-slate-800 text-sm cursor-pointer hover:text-primary transition-colors line-clamp-2" onClick={() => setDetailProduct(product)}>{product.name}</h3>
       </td>
       <td className="p-3 text-center text-xs sm:text-sm font-bold text-slate-600">
          {product.className ? `${product.className}${product.subject ? ` - ${product.subject}` : ''}` : '-'}
       </td>
       <td className="p-3 text-center text-xs sm:text-sm font-bold text-slate-600 hidden sm:table-cell">
          {product.category}
       </td>
       <td className="p-3 text-center font-bold text-slate-800">{product.price.toFixed(2)}</td>
       <td className="p-3">
          <div className="flex items-center justify-center gap-1 mx-auto w-fit">
             <button onClick={()=>updateCartQty(product, Math.max(0, cartQty-1))} className="w-7 h-7 bg-slate-400 text-white flex items-center justify-center rounded-sm font-bold text-lg leading-none">-</button>
             <input 
               type="number" 
               value={cartQty || ""} 
               onChange={(e) => updateCartQty(product, parseInt(e.target.value) || 0)} 
               onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
               className="w-10 sm:w-16 h-7 text-center text-sm font-bold border border-slate-300 rounded-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             />
             <button onClick={()=>updateCartQty(product, cartQty+1)} className="w-7 h-7 bg-[#2f8c5b] hover:bg-[#2f8c5b]/90 text-white flex items-center justify-center rounded-sm font-bold text-lg leading-none">+</button>
          </div>
       </td>
       <td className="p-3 text-right pr-6 font-bold text-slate-800 hidden sm:table-cell">{(product.price * cartQty).toFixed(2)}</td>
    </tr>
  );
}

function ProductDetailModal({
  product, onClose, onAddToCart, isFav, onToggleFav
}: {
  product: Product; onClose: () => void;
  onAddToCart: (p: Product) => void;
  isFav: boolean; onToggleFav: () => void;
}) {
  const r = STAR_RATINGS[product.id] || { rating: 4.2, reviews: 18 };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-56 flex items-center justify-center rounded-t-2xl overflow-hidden relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <Package className="w-24 h-24 text-slate-300" />
            )}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{product.category}</span>
          <h2 className="text-2xl font-black text-slate-800 mt-3 mb-1">{product.name}</h2>
          {product.className && (
            <p className="text-sm font-medium text-slate-500 mb-2">
              {product.className}{product.subject ? ` - ${product.subject}` : ''}
            </p>
          )}
          {product.description && (
            <p className="text-slate-500 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div>
              <span className="text-3xl font-black text-primary">৳{product.price}</span>
              <span className="text-slate-400 text-sm ml-2">প্রতি {product.unit}</span>
            </div>
          </div>
          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderFormModal({ onClose, total }: { onClose: () => void; total: number }) {
  const [ilhak, setIlhak] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found" | "error">("idle");

  const searchIlhak = async () => {
    if (!ilhak.trim()) return;
    setIsLoading(true);
    setSearchStatus("idle");
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(ilhak)}`);
      if (res.ok) {
        const data = await res.json();
        setInstituteName(data.name || "");
        setOwnerName(data.ownerName || "");
        setContactNo(data.contactNo || "");
        setAddress(data.address || "");
        setSearchStatus("found");
      } else if (res.status === 404) {
        setSearchStatus("not_found");
      } else {
        setSearchStatus("error");
      }
    } catch (e) {
      setSearchStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!ownerName || !instituteName || !address) {
      alert("অনুগ্রহ করে মালিকের নাম, প্রতিষ্ঠানের নাম এবং ঠিকানা প্রদান করুন।");
      return;
    }
    setIsSubmitting(true);
    try {
      if (ilhak.trim() && searchStatus !== "found") {
        await fetch("/api/madrasa/ilhak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: ilhak, name: instituteName, ownerName, contactNo, address }),
        });
      }
      
      alert("অর্ডার সম্পন্ন হয়েছে! আপনার তথ্য সেভ করা হয়েছে।");
      onClose();
    } catch (e) {
      alert("অর্ডার করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="font-bold text-slate-800 text-lg">অর্ডার নিশ্চিত করুন</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">ইলহাক বা মোবাইল নম্বর (পুরাতন তথ্যের জন্য)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ilhak}
                  onChange={(e) => setIlhak(e.target.value)}
                  placeholder="যেমন: 1234 বা 01XXXXXXXXX" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" 
                />
                <button 
                  onClick={searchIlhak}
                  disabled={isLoading || !ilhak.trim()}
                  className="px-5 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {isLoading ? "খুঁজছি..." : "খুঁজুন"}
                </button>
              </div>
              {searchStatus === "found" && <p className="text-xs text-emerald-600 mt-1.5 font-medium">✓ ইলহাক পাওয়া গেছে, তথ্য অটো-ফিল করা হয়েছে!</p>}
              {searchStatus === "not_found" && <p className="text-xs text-amber-600 mt-1.5 font-medium">⚠ ইলহাক পাওয়া যায়নি। নতুন তথ্য সেভ করা হবে।</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">মালিকের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="আপনার পুরো নাম" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="মাদরাসা/প্রতিষ্ঠানের নাম" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">মোবাইল নম্বর</label>
              <input 
                type="tel" 
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="01XXXXXXXXX" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা" 
                rows={3} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-slate-50 focus:bg-white"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-500">সর্বমোট বিল:</span>
            <span className="text-2xl font-black text-primary">৳{total.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="mt-6 w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? "অপেক্ষা করুন..." : "কনফার্ম করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name" | "rating">("default");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/store/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    // Load view mode from localStorage
    try {
      const savedView = localStorage.getItem("store_view_mode");
      if (savedView === "card" || savedView === "list") setViewMode(savedView);
    } catch { }
    // Load favourites from localStorage
    try {
      const fav = JSON.parse(localStorage.getItem("store_favourites") || "[]");
      setFavourites(new Set(fav));
    } catch { }
    // Load cart from localStorage
    try {
      const savedCart = JSON.parse(localStorage.getItem("store_cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        setCart(savedCart);
      }
    } catch { }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { 
      document.body.style.overflow = "auto"; 
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("store_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const toggleFav = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("store_favourites", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const updateCartQty = (product: Product, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(i => i.product.id !== product.id);
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const highestPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000, [products]);

  const getProductRating = (id: string) => STAR_RATINGS[id] || { rating: 4 + Math.random(), reviews: Math.floor(Math.random() * 50) + 5 };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategories.size > 0) list = list.filter(p => selectedCategories.has(p.category));
    if (showOnlyInStock) list = list.filter(p => p.stock > 0);
    if (showOnlyFavourites) list = list.filter(p => favourites.has(p.id));
    if (minPrice) list = list.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice));
    if (ratingFilter > 0) list = list.filter(p => getProductRating(p.id).rating >= ratingFilter);
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "rating") list.sort((a, b) => getProductRating(b.id).rating - getProductRating(a.id).rating);
    return list;
  }, [products, search, selectedCategories, showOnlyInStock, showOnlyFavourites, favourites, minPrice, maxPrice, sortBy, ratingFilter]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-sm flex-shrink-0">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 flex items-center justify-between gap-3">
          <h1 className="text-lg font-black text-slate-800 whitespace-nowrap hidden sm:block">বই ও স্টেশনারি</h1>
          
          {/* Search & Filters */}
          <div className="flex flex-1 items-center gap-2">
            <Link href="/" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0 lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                lang="bn"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>
            
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 hidden md:block">
              <option value="default">ডিফল্ট</option>
              <option value="price-asc">মূল্য: কম থেকে বেশি</option>
              <option value="price-desc">মূল্য: বেশি থেকে কম</option>
              <option value="name">নামানুসারে</option>
            </select>
            
            <button 
              onClick={() => {
                const newMode = viewMode === "card" ? "list" : "card";
                setViewMode(newMode);
                try { localStorage.setItem("store_view_mode", newMode); } catch {}
              }} 
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center"
            >
              {viewMode === "card" ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-1 overflow-hidden relative bg-slate-50">

        {/* Main Content */}
        <div className="flex-1 min-w-0 h-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Horizontal Category Tabs (Mobile & Desktop) */}
          <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-shrink-0">
            <div className="flex items-center gap-2 w-max">
              <button
                onClick={(e) => {
                  setSelectedCategories(new Set());
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${selectedCategories.size === 0 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                সকল
              </button>
              {categories.map(cat => {
                const isSelected = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={(e) => {
                      toggleCategory(cat);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${isSelected ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Bar */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <p className="text-sm text-slate-500 font-medium">
              {loading ? "লোড হচ্ছে..." : <><span className="font-bold text-slate-700">{filtered.length}</span> টি পণ্য পাওয়া গেছে</>}
            </p>
            {/* Mobile sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 md:hidden">
              <option value="default">ডিফল্ট</option>
              <option value="price-asc">মূল্য ↑</option>
              <option value="price-desc">মূল্য ↓</option>
              <option value="name">নাম</option>
            </select>
          </div>

          {/* Scrollable Products Area */}
          <div className="flex-1 overflow-y-auto pr-1 pb-10">

          {/* CARD VIEW */}
          {viewMode === "card" && (
            <>
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Package className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,240px)] justify-stretch sm:justify-start gap-4 sm:gap-5">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-row sm:flex-col">
                  <div className="w-32 sm:w-full aspect-square sm:aspect-[4/3] flex-shrink-0 bg-slate-100" />
                  <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-6 bg-slate-100 rounded w-1/3 mt-auto pt-2" />
                  </div>
                </div>
              )) : filtered.map(product => {
                const r = getProductRating(product.id);
                const isFav = favourites.has(product.id);
                const cartItem = cart.find(c => c.product.id === product.id);
                const cartQty = cartItem ? cartItem.qty : 0;
                
                return (
                  <div key={product.id} onClick={() => setDetailProduct(product)} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-row sm:flex-col cursor-pointer">
                    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 w-32 sm:w-full aspect-square sm:aspect-[4/3] flex-shrink-0 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-slate-100">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 group-hover:scale-105 transition-transform" />
                      )}
                      <span className="absolute bottom-2 left-2 text-[10px] sm:text-xs text-primary font-bold bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm z-10 max-w-[calc(100%-16px)] truncate">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex flex-1 min-w-0">
                      <div className="p-3 flex flex-col flex-1 min-w-0 border-r border-slate-50 border-dashed">
                        <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 sm:line-clamp-1">{product.name}</h3>
                        {product.className && (
                          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                            {product.className}{product.subject ? ` - ${product.subject}` : ''}
                          </p>
                        )}
                        <div className="mt-auto pt-2">
                          <span className="text-xl font-black text-primary">৳{product.price}</span>
                        </div>
                      </div>
                      <div className="w-14 flex flex-col items-center justify-center bg-slate-50/50 p-2">
                         {cartQty > 0 ? (
                           <div className="flex flex-col items-center gap-1 h-full justify-between w-full" onClick={e => e.stopPropagation()}>
                             <button onClick={() => updateCartQty(product, cartQty + 1)}
                               className="w-full h-8 bg-primary rounded text-white text-xl font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                             <span className="w-full flex-1 flex items-center justify-center text-sm font-black text-slate-800 py-1">{cartQty}</span>
                             <button onClick={() => updateCartQty(product, cartQty - 1)}
                               className="w-full h-8 bg-slate-200 rounded text-slate-600 text-xl font-medium flex items-center justify-center hover:bg-slate-300 transition-colors">−</button>
                           </div>
                         ) : (
                           <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                             className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                             <ShoppingCart className="w-5 h-5" />
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex-1 mb-4 flex flex-col">
              <div className="bg-[#e8f3ec] text-[#2f8c5b] py-3 text-center font-black text-xl border-b border-slate-200">
                বই ও স্টেশনারী আইটেম অনলাইন-এ অর্ডার করুন
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-full sm:min-w-[800px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#2f8c5b] text-white text-sm">
                      <th className="p-3 font-bold text-center border-r border-white/20 w-16 hidden sm:table-cell">ক্রম</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-16 sm:w-20 hidden sm:table-cell">ছবি</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-20 hidden sm:table-cell">কোড</th>
                      <th className="p-3 font-bold text-center border-r border-white/20">পণ্যের নাম</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-24">শ্রেণী</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-28 hidden sm:table-cell">ক্যাটাগরি</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-20 sm:w-32">মূল্য(৳)</th>
                      <th className="p-3 font-bold text-center border-r border-white/20 w-28 sm:w-48">পরিমাণ</th>
                      <th className="p-3 font-bold text-right pr-6 w-36 hidden sm:table-cell">পরিমাণ*মূল্য(৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Package className="w-16 h-16 mb-4 text-slate-200" />
                            <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                            <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {loading ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 animate-pulse">
                        <td colSpan={8} className="p-4"><div className="h-8 bg-slate-100 rounded w-full" /></td>
                      </tr>
                    )) : filtered.map((product, index) => {
                      const cartItem = cart.find(c => c.product.id === product.id);
                      return (
                        <ListProductRow 
                          key={product.id} product={product} index={index}
                          cartQty={cartItem ? cartItem.qty : 0} 
                          updateCartQty={updateCartQty} setDetailProduct={setDetailProduct} 
                        />
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-white">
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 hidden sm:table-row">
                      <td colSpan={8} className="p-4 text-right text-slate-800">সর্বমোট অর্ডারকৃত পণ্যের মূল্য(৳) =</td>
                      <td className="p-4 text-right pr-6 text-lg text-slate-900">{cartTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="bg-white border-t border-slate-200 p-6 hidden sm:flex flex-col items-center">
                 <p className="text-red-500 font-bold text-lg mb-4 text-center">অর্ডারকৃত পণ্যের পরিমাণ সঠিকভাবে বসানোর পর নিচের "বিলে যুক্ত করুন" বাটনে ক্লিক করুন</p>
                 <button onClick={() => setIsOrderModalOpen(true)} className="px-8 py-3 bg-[#2d3282] hover:bg-[#2d3282]/90 text-white rounded font-bold transition-colors shadow-md">
                   বিলে যুক্ত করুন
                 </button>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right Sidebar - Cart */}
        <aside className={`
          hidden xl:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden bg-white
          ${rightSidebarOpen ? "w-96 border-l border-slate-200 opacity-100" : "w-0 border-l-0 opacity-0"}
        `}>
          <div className="flex flex-col h-full w-96 flex-shrink-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> আমার কার্ট</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="font-medium text-sm">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 relative group bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 hover:shadow-md transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                           <p className="font-bold text-slate-900 text-base line-clamp-1 pr-2">{item.product.name}</p>
                           <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="text-slate-300 hover:text-red-500 transition-colors mt-0.5 bg-slate-50 hover:bg-red-50 rounded-full p-1">
                             <X className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                           <span className="font-bold text-slate-900 text-base">৳{(item.product.price * item.qty).toFixed(2)}</span>
                           <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1.5 py-1.5 border border-slate-200">
                             <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                               className="w-7 h-7 bg-white rounded-md shadow-sm text-slate-600 text-lg font-medium flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                             <span className="w-5 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                             <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                               className="w-7 h-7 bg-primary rounded-md shadow-sm text-white text-lg font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white z-10 relative">
                <div className="flex justify-between text-slate-800 mb-4 items-end">
                  <span className="font-bold">সর্বমোট পরিমাণ</span>
                  <span className="text-xl font-black text-primary">৳{cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setIsOrderModalOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 active:scale-[0.98]">
                  অর্ডার করুন
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Floating Stylish Cart Summary (Mobile/Tablet) */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 p-4 flex items-center justify-between animate-in slide-in-from-bottom-10 xl:hidden">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">মোট {cartCount} টি পণ্য</span>
            <span className="text-xl font-black text-primary">৳{cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => setCartOpen(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> কার্ট দেখুন
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={addToCart}
          isFav={favourites.has(detailProduct.id)}
          onToggleFav={() => toggleFav(detailProduct.id)}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> আমার কার্ট</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="font-medium">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 relative group bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 hover:shadow-md transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                           <p className="font-bold text-slate-900 text-base line-clamp-1 pr-2">{item.product.name}</p>
                           <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="text-slate-300 hover:text-red-500 transition-colors mt-0.5 bg-slate-50 hover:bg-red-50 rounded-full p-1">
                             <X className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                           <span className="font-bold text-slate-900 text-lg">৳{(item.product.price * item.qty).toFixed(2)}</span>
                           <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1.5 py-1.5 border border-slate-200">
                             <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                               className="w-7 h-7 bg-white rounded-md shadow-sm text-slate-600 text-lg font-medium flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                             <span className="w-5 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                             <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                               className="w-7 h-7 bg-primary rounded-md shadow-sm text-white text-lg font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white z-10 relative">
                <div className="flex justify-between text-slate-800 mb-4 items-end">
                  <span className="font-bold">সর্বমোট পরিমাণ</span>
                  <span className="text-xl font-black text-primary">৳{cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setIsOrderModalOpen(true)} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 active:scale-[0.98]">
                  অর্ডার করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <OrderFormModal onClose={() => setIsOrderModalOpen(false)} total={cartTotal} />
      )}
    </div>
  );
}
