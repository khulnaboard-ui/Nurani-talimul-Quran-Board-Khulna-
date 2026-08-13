"use client";
import React, { useState } from 'react';
import { ShoppingCart, Package, CreditCard, ClipboardList } from 'lucide-react';
import SaleTab from './SaleTab';
import StockTab from './StockTab';
import PaymentTab from './PaymentTab';
import OrderTab from './OrderTab';

import ReceiptTab from './ReceiptTab';

export default function StoreManagementView() {
  const [activeTab, setActiveTab] = useState<'sale' | 'stock' | 'payment' | 'order' | 'receipt'>('sale');

  React.useEffect(() => {
    const saved = localStorage.getItem('store_active_tab');
    if (saved === 'sale' || saved === 'stock' || saved === 'payment' || saved === 'order' || saved === 'receipt') {
      setActiveTab(saved);
    }
  }, []);

  const handleTabChange = (tab: 'sale' | 'stock' | 'payment' | 'order' | 'receipt') => {
    setActiveTab(tab);
    localStorage.setItem('store_active_tab', tab);
  };

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tab: 'sale' | 'stock' | 'payment' | 'order' | 'receipt') => {
    handleTabChange(tab);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 overflow-visible min-h-[600px] flex flex-col -mx-3 md:mx-0">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 md:bg-slate-50/50 pt-2 md:pt-6 px-3 md:px-6">
        <div className="hidden md:block mb-6">
          <h2 className="text-2xl font-bold text-slate-800">স্টোর পরিচালনা</h2>
          <p className="text-slate-500 text-sm mt-1">বই ও স্টেশনারি স্টক, বিক্রয় এবং পেমেন্ট পরিচালনা করুন।</p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={(e) => handleTabClick(e, 'sale')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sale' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            বিক্রয় (Sale)
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'order')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'order' 
                ? 'border-amber-600 text-amber-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            অর্ডার (Order)
          </button>
          
          <button
            onClick={(e) => handleTabClick(e, 'stock')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stock' 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <Package className="w-5 h-5" />
            স্টক ব্যবস্থাপনা
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'payment')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payment' 
                ? 'border-purple-600 text-purple-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            পেমেন্ট (Payment)
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'receipt')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'receipt' 
                ? 'border-emerald-600 text-emerald-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            মানি রিসিট (Receipts)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-3 py-4 md:p-6 bg-transparent md:bg-white overflow-visible">
        {activeTab === 'sale' && <SaleTab />}
        {activeTab === 'order' && <OrderTab />}
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'payment' && <PaymentTab />}
        {activeTab === 'receipt' && <ReceiptTab />}
      </div>
    </div>
  );
}
