"use client";
import React, { useState } from 'react';
import { ShoppingCart, Package, CreditCard } from 'lucide-react';
import SaleTab from './SaleTab';
import StockTab from './StockTab';
import PaymentTab from './PaymentTab';

export default function StoreManagementView() {
  const [activeTab, setActiveTab] = useState<'sale' | 'stock' | 'payment'>('sale');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible min-h-[600px] flex flex-col">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 pt-6 px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">স্টোর পরিচালনা</h2>
          <p className="text-slate-500 text-sm mt-1">বই ও স্টেশনারি স্টক, বিক্রয় এবং পেমেন্ট পরিচালনা করুন।</p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sale')}
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
            onClick={() => setActiveTab('stock')}
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
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payment' 
                ? 'border-purple-600 text-purple-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            পেমেন্ট (Payment)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 bg-white overflow-visible">
        {activeTab === 'sale' && <SaleTab />}
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'payment' && <PaymentTab />}
      </div>
    </div>
  );
}
