"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Filter, Download, FileText, MoreVertical, CheckCircle, Trash2, Share2, X, Scan, Edit } from 'lucide-react';
import BanglaDatePicker, { toBanglaDigits } from './BanglaDatePicker';

type SaleItem = { id: string; quantity: number; unitPrice: number; product: { name: string } };
type Sale = {
  id: string; invoiceId: string; customerName: string; instituteId?: string | null; totalAmount: number;
  paidAmount: number; status: string; createdAt: string; items: SaleItem[];
};

type Product = { id: string; name: string; price: number; stock: number; unit: string; barcode?: string | null };

const toEnglishDigits = (str: string) => {
  const bnToEn: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return str.replace(/[০-৯]/g, match => bnToEn[match]);
};

// Single product search bar for adding to cart
function ProductSearchBar({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Barcode scan auto-add
  useEffect(() => {
    if (!query) return;
    const byBarcode = products.find(p => p.barcode && p.barcode === query.trim());
    if (byBarcode) { onAdd(byBarcode); setQuery(''); setOpen(false); setScanMode(false); }
  }, [query, products, onAdd]);

  const filtered = query
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.includes(query))
      )
    : products.slice(0, 8);

  return (
    <div className="relative" ref={wrapRef}>
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={scanMode ? '📷 বারকোড স্ক্যান করুন...' : 'পণ্য খুঁজুন বা স্ক্যান করুন...'}
            className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
              scanMode ? 'border-amber-400 focus:ring-amber-300 bg-amber-50' : 'border-slate-200 focus:ring-primary/50 bg-white'
            }`}
          />
        </div>
        <button type="button" onClick={() => { setScanMode(s => !s); setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }}
          className={`px-3 py-2 rounded-xl border flex items-center transition-colors ${
            scanMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
          }`}>
          <Scan className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400 text-center">কোনো পণ্য পাওয়া যায়নি</p>
          ) : filtered.map(p => (
            <button key={p.id} type="button"
              onMouseDown={() => { onAdd(p); setQuery(''); setOpen(false); setScanMode(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center justify-between gap-2 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                {p.barcode && <p className="text-xs text-slate-400">{p.barcode}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-blue-600">{p.price} ৳</p>
                <p className="text-xs text-slate-400">মজুদ: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Cart item card
function CartItemCard({
  product,
  quantity,
  onQtyChange,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-500">{product.price} ৳ x {quantity} = <span className="font-bold text-blue-600">{(product.price * quantity).toFixed(2)} ৳</span></p>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onQtyChange(Math.max(1, quantity - 1))}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm">−</button>
        <input type="text" inputMode="numeric" value={quantity || ''}
          onChange={e => {
            const val = Math.max(1, parseInt(toEnglishDigits(e.target.value)) || 1);
            onQtyChange(val);
          }}
          onFocus={e => (e.target as HTMLInputElement).select()}
          className="w-10 text-center font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded" />
        <button type="button" onClick={() => onQtyChange(quantity + 1)}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm">+</button>
      </div>
      <button type="button" onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function NewSaleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pastSales, setPastSales] = useState<Sale[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [pastBuyers, setPastBuyers] = useState<string[]>([]);
  const [buyerOpen, setBuyerOpen] = useState(false);
  const buyerRef = useRef<HTMLDivElement>(null);
  // Invoice search
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [promiseDate, setPromiseDate] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/store/products').then(r => r.json()).then(setProducts); }, []);
  useEffect(() => {
    fetch('/api/store/sales').then(r => r.json()).then((data: Sale[]) => {
      if (Array.isArray(data)) {
        const names = Array.from(new Set(data.map(s => s.customerName).filter(Boolean)));
        setPastBuyers(names);
        setPastSales(data);
      }
    });
  }, []);
  
  // Close buyer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buyerRef.current && !buyerRef.current.contains(e.target as Node)) setBuyerOpen(false);
      if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addProductToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.findIndex(i => i.productId === product.id);
      if (existing >= 0) {
        return prev.map((item, idx) => idx === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  }, []);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateQty = useCallback((i: number, q: number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: q } : item)), []);

  const subtotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const parsedDiscount = parseFloat(toEnglishDigits(discountValue)) || 0;
  const parsedPaid = parseFloat(toEnglishDigits(paidAmount)) || 0;
  const discountAmount = discountType === 'percentage' ? (subtotal * parsedDiscount) / 100 : parsedDiscount;
  const total = Math.max(0, subtotal - discountAmount);
  const due = Math.max(0, total - parsedPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerName || items.length === 0) {
      setError('ক্রেতার নাম ও কমপক্ষে ১টি পণ্য যোগ করুন।'); return;
    }
    setLoading(true);
    const res = await fetch('/api/store/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerPhone: customerPhone || null, instituteId: instituteId || null, items, discount: discountAmount, paidAmount: parsedPaid, promiseDate: promiseDate || null, paymentMethod }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'সেভ করতে সমস্যা হয়েছে'); }
  };

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const sidebarInputRef = useRef<HTMLInputElement>(null);

  // Barcode scan auto-add
  useEffect(() => {
    if (!sidebarSearch || !scanMode) return;
    const byBarcode = products.find(p => p.barcode && p.barcode === sidebarSearch.trim());
    if (byBarcode) { addProductToCart(byBarcode); setSidebarSearch(''); setScanMode(false); }
  }, [sidebarSearch, products, addProductToCart, scanMode]);

  const sidebarFiltered = sidebarSearch
    ? products.filter(p =>
        p.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        (p.barcode && p.barcode.includes(sidebarSearch))
      )
    : products;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">নতুন বিক্রয় তৈরি করুন</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 min-h-0 overflow-hidden">
          {/* ═══ LEFT SIDEBAR: Product Browser ═══ */}
          <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">পণ্য তালিকা</p>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={sidebarInputRef}
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder={scanMode ? '📷 স্ক্যান করুন...' : 'পণ্য খুঁজুন...'}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      scanMode ? 'border-amber-400 focus:ring-amber-300 bg-amber-50' : 'border-slate-200 focus:ring-primary/50 bg-white'
                    }`}
                  />
                </div>
                <button type="button" onClick={() => { setScanMode(s => !s); setSidebarSearch(''); setTimeout(() => sidebarInputRef.current?.focus(), 50); }}
                  className={`px-3 py-2 rounded-xl border flex items-center transition-colors ${
                    scanMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}>
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sidebarFiltered.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">কোনো পণ্য পাওয়া যায়নি</p>
              )}
              {sidebarFiltered.map(p => {
                const inCart = items.find(i => i.productId === p.id);
                return (
                  <button key={p.id} type="button"
                    onClick={() => addProductToCart(p)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 flex items-center justify-between gap-2 transition-colors border ${
                      inCart ? 'bg-green-50 border-green-200' : 'bg-white border-transparent hover:bg-white hover:border-slate-200'
                    }`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.price} ৳ · মজুদ: {p.stock}</p>
                    </div>
                    {inCart ? (
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{inCart.quantity}</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ RIGHT MAIN AREA: Order / Cart ═══ */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

              {/* Customer & Invoice row */}
              <div className="grid grid-cols-2 gap-3">
                <div ref={invoiceRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> পুরনো ইনভয়েস</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input value={invoiceQuery} onChange={e => { setInvoiceQuery(e.target.value); setInvoiceOpen(true); }} onFocus={() => setInvoiceOpen(true)}
                      placeholder="ইনভয়েস / নাম..."
                      className="w-full pl-8 pr-3 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm" />
                  </div>
                  {invoiceOpen && invoiceQuery && (() => {
                    const filtered = pastSales.filter(s =>
                      s.invoiceId.toLowerCase().includes(invoiceQuery.toLowerCase()) ||
                      s.customerName.toLowerCase().includes(invoiceQuery.toLowerCase()) ||
                      (s.instituteId && s.instituteId.toLowerCase().includes(invoiceQuery.toLowerCase()))
                    ).slice(0, 6);
                    if (filtered.length === 0) return <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm text-slate-400 text-center">পাওয়া যায়নি</div>;
                    return (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {filtered.map(sale => (
                          <button key={sale.id} type="button"
                            onMouseDown={() => { setCustomerName(sale.customerName); setInstituteId(sale.instituteId || ''); setInvoiceQuery(sale.invoiceId); setInvoiceOpen(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition-colors">
                            <div>
                              <p className="text-sm font-bold text-blue-700">{sale.invoiceId}</p>
                              <p className="text-xs text-slate-500">{sale.customerName}</p>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(sale.createdAt).toLocaleDateString('bn-BD')}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ইলহাক / প্রতিষ্ঠান আইডি</label>
                  <input value={instituteId} onChange={e => setInstituteId(e.target.value)}
                    placeholder="ইলহাক নম্বর..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              {/* Buyer name and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div ref={buyerRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ক্রেতার নাম *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input value={customerName} onChange={e => { setCustomerName(e.target.value); setBuyerOpen(true); }} onFocus={() => setBuyerOpen(true)}
                      placeholder="ক্রেতার নাম লিখুন..." lang="en"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  </div>
                  {buyerOpen && (() => {
                    const filtered = pastBuyers.filter(b => !customerName || b.toLowerCase().includes(customerName.toLowerCase()));
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                        {filtered.map(buyer => (
                          <button key={buyer} type="button" onMouseDown={() => { setCustomerName(buyer); setBuyerOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-800 flex items-center gap-2 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{buyer.charAt(0).toUpperCase()}</span>
                            {buyer}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">মোবাইল নাম্বার</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel"
                    placeholder="017..." lang="en"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>



              {/* Cart items */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  অর্ডার তালিকা {items.length > 0 && <span className="ml-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{items.length}</span>}
                </label>
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-100 rounded-xl py-10 text-center text-slate-400 text-sm">
                    <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    বাম পাশ থেকে পণ্য বেছে নিন
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((item, i) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      return <CartItemCard key={item.productId} product={product} quantity={item.quantity} onQtyChange={q => updateQty(i, q)} onRemove={() => removeItem(i)} />;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed bottom: Ultra Compact 2-Row Footer */}
            <div className="border-t border-slate-100 p-3 bg-slate-50 flex-shrink-0 flex flex-col gap-3">
              
              {/* Row 1: Discount, Due, Total */}
              <div className="flex items-center gap-3">
                {/* Discount */}
                <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                  <div className="px-2 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">ডিসকাউন্ট:</div>
                  <input type="text" inputMode="numeric" value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    placeholder="0"
                    className="flex-1 w-0 min-w-0 text-center px-1 bg-transparent text-sm font-bold focus:outline-none" lang="en" />
                  <div className="flex gap-1 ml-1">
                    <button type="button" onClick={() => setDiscountType('amount')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'amount' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>৳</button>
                    <button type="button" onClick={() => setDiscountType('percentage')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'percentage' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>%</button>
                  </div>
                </div>

                {/* Due */}
                <div 
                  onClick={() => {
                    if (due > 0) setDatePickerOpen(true);
                  }}
                  className={`relative flex-1 flex items-center justify-between bg-white rounded-lg shadow-sm border ${due > 0 ? 'border-red-200 cursor-pointer hover:bg-red-50' : 'border-slate-200'} p-1.5 px-3 transition-colors`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">বকেয়া:</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-red-500 font-black text-sm leading-none">{due > 0 ? `${toBanglaDigits(due.toFixed(2))} ৳` : '০.০০ ৳'}</span>
                    {due > 0 && promiseDate && <span className="text-[9px] font-bold text-red-400 mt-1 leading-none">{new Date(promiseDate).toLocaleDateString('bn-BD')}</span>}
                  </div>
                  {due > 0 && datePickerOpen && (
                    <BanglaDatePicker value={promiseDate} onChange={setPromiseDate} onClose={() => setDatePickerOpen(false)} />
                  )}
                </div>

                {/* Total */}
                <div className="flex-1 flex flex-col justify-center items-end px-2">
                  <div className="text-[10px] text-slate-500 font-medium leading-none mb-1">
                    সাবটোটাল: {subtotal.toFixed(2)} {discountAmount > 0 && <span className="text-red-500">(-{discountAmount.toFixed(2)})</span>}
                  </div>
                  <div className="flex items-baseline gap-1 leading-none flex-wrap justify-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">সর্বমোট:</span>
                    <span className="text-xl font-black text-slate-900">{total.toFixed(2)} ৳</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Received Amount & Save Button */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-blue-200 flex items-center overflow-hidden h-[44px]">
                  <div className="pl-3 pr-2 text-[10px] font-bold text-blue-800 uppercase whitespace-nowrap bg-blue-50/50 h-full flex flex-col justify-center border-r border-blue-100">
                    <div>জমা প্রদান</div>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bg-transparent font-black focus:outline-none cursor-pointer mt-0.5 text-blue-600">
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div className="relative flex-1 flex items-center h-full px-2">
                    <span className="text-lg font-black text-slate-300 ml-1">৳</span>
                    <input type="text" inputMode="numeric" value={paidAmount}
                      onChange={e => setPaidAmount(e.target.value)}
                      onFocus={e => (e.target as HTMLInputElement).select()}
                      className="w-full h-full px-2 bg-transparent text-xl font-black text-slate-800 focus:outline-none placeholder-slate-200" placeholder="0.00" lang="en" />
                  </div>
                  <button type="button" onClick={() => setPaidAmount(total.toFixed(2))} className="px-3 h-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px] font-bold transition-colors whitespace-nowrap">
                    সম্পূর্ণ বিল
                  </button>
                </div>
                
                <button type="submit" disabled={loading} className="w-1/3 h-[44px] bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? 'সেভ হচ্ছে...' : 'বিক্রয় সম্পন্ন করুন'}
                </button>
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg text-center mt-[-4px]">{error}</p>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
function ActionDropdown({ sale, onUpdate }: { sale: Sale; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markPaid = async () => {
    await fetch(`/api/store/sales/${sale.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Paid', paidAmount: sale.totalAmount }),
    });
    onUpdate(); setOpen(false);
  };

  const deleteSale = async () => {
    if (!confirm('এই বিক্রয়টি মুছে দিতে চান?')) return;
    await fetch(`/api/store/sales/${sale.id}`, { method: 'DELETE' });
    onUpdate(); setOpen(false);
  };

  const printInvoice = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice ${sale.invoiceId}</title>
      <style>body{font-family:sans-serif;padding:20px;max-width:500px;margin:0 auto}
      h1{font-size:18px;text-align:center}table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#f5f5f5}.total{text-align:right;font-weight:bold;margin-top:8px}</style>
      </head><body>
      <h1>নূরানী তালিমুল কুরআন বোর্ড খুলনা</h1>
      <p><b>ইনভয়েস:</b> ${sale.invoiceId}</p>
      <p><b>ক্রেতা:</b> ${sale.customerName}</p>
      <p><b>তারিখ:</b> ${new Date(sale.createdAt).toLocaleDateString('bn-BD')}</p>
      <table><tr><th>পণ্য</th><th>পরিমাণ</th><th>দাম</th><th>মোট</th></tr>
      ${sale.items.map(i => `<tr><td>${i.product.name}</td><td>${i.quantity}</td><td>${i.unitPrice} ৳</td><td>${(i.quantity * i.unitPrice).toFixed(2)} ৳</td></tr>`).join('')}
      </table><p class="total">সর্বমোট: ${sale.totalAmount.toFixed(2)} ৳</p>
      <p class="total">পরিশোধিত: ${sale.paidAmount.toFixed(2)} ৳</p>
      <p class="total">বাকি: ${(sale.totalAmount - sale.paidAmount).toFixed(2)} ৳</p>
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close(); setOpen(false);
  };

  const shareInvoice = () => {
    const text = `ইনভয়েস: ${sale.invoiceId}\nক্রেতা: ${sale.customerName}\nমোট: ${sale.totalAmount} ৳\nস্ট্যাটাস: ${sale.status}`;
    if (navigator.share) { navigator.share({ title: `Invoice ${sale.invoiceId}`, text }); }
    else { navigator.clipboard.writeText(text); alert('ইনভয়েস তথ্য কপি হয়েছে!'); }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden">
          <button onClick={printInvoice} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <FileText className="w-4 h-4 text-blue-500" /> প্রিন্ট ইনভয়েস
          </button>
          <button onClick={shareInvoice} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4 text-green-500" /> শেয়ার করুন
          </button>
          <button onClick={() => alert('এডিট অপশনটি শীঘ্রই আসছে!')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Edit className="w-4 h-4 text-amber-500" /> এডিট করুন
          </button>
          {sale.status !== 'Paid' && (
            <button onClick={markPaid} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> পরিশোধিত
            </button>
          )}
          <div className="border-t border-slate-100" />
          <button onClick={deleteSale} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> মুছে দিন
          </button>
        </div>
      )}
    </div>
  );
}

export default function SaleTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/sales');
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch { setSales([]); }
    setLoading(false);
  };

  useEffect(() => { fetchSales(); }, []);

  const filtered = sales.filter(s =>
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {showModal && <NewSaleModal onClose={() => setShowModal(false)} onSaved={fetchSales} />}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search by invoice ID or customer name..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            lang="en"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => {
            const csv = ['ইনভয়েস,ক্রেতা,তারিখ,মোট,স্ট্যাটাস', ...filtered.map(s => `${s.invoiceId},${s.customerName},${new Date(s.createdAt).toLocaleDateString()},${s.totalAmount},${s.status}`)].join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'sales.csv'; a.click();
          }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> এক্সপোর্ট
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> নতুন বিক্রয়
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white">
        <div className="min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">ইনভয়েস আইডি</th>
                <th className="px-6 py-4 font-medium">তারিখ</th>
                <th className="px-6 py-4 font-medium">ক্রেতার নাম</th>
                <th className="px-6 py-4 font-medium">আইটেম</th>
                <th className="px-6 py-4 font-medium">মোট (৳)</th>
                <th className="px-6 py-4 font-medium">পরিশোধ (৳)</th>
                <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
                <th className="px-6 py-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">কোনো বিক্রয় পাওয়া যায়নি</td></tr>
              ) : filtered.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{sale.invoiceId}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(sale.createdAt).toLocaleDateString('bn-BD')}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{sale.customerName}</td>
                  <td className="px-6 py-4 text-slate-600">{sale.items.reduce((sum, item) => sum + item.quantity, 0)} টি</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{sale.totalAmount.toFixed(2)} ৳</td>
                  <td className="px-6 py-4 text-slate-600">{sale.paidAmount.toFixed(2)} ৳</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sale.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : sale.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sale.status === 'Paid' ? 'পরিশোধিত' : sale.status === 'Pending' ? 'বকেয়া' : 'আংশিক'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right"><ActionDropdown sale={sale} onUpdate={fetchSales} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
