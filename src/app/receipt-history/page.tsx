"use client";
import React, { useState } from "react";
import { Search, FileText, Clock, Receipt, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ReceiptHistoryPage() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!receiptNumber.trim()) { setError("মানি রিসিট নম্বর দিন"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ number: receiptNumber.trim(), history: "1" });
      if (phone.trim()) params.append("phone", phone.trim());
      const res = await fetch(`/api/store/receipts/verify?${params}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "তথ্য পাওয়া যায়নি");
      }
    } catch (e) {
      setError("সার্ভার ত্রুটি, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-black text-slate-800">মানি রিসিট ব্যালান্স চেক</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-slate-600 text-sm mb-5">
            আপনার মানি রিসিট নম্বর এবং মোবাইল নম্বর দিয়ে ব্যালান্স ও ব্যবহারের ইতিহাস দেখুন।
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">মানি রিসিট নম্বর <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="যেমন: MR-123456"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">মোবাইল নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> খুঁজছি...</>
              ) : (
                <><Search className="w-5 h-5" /> ব্যালান্স দেখুন</>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Balance Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold text-emerald-100 text-sm">রিসিট সত্যায়িত</span>
                </div>
                <p className="text-3xl font-black">৳{result.availableBalance.toFixed(2)}</p>
                <p className="text-emerald-100 text-sm mt-1">উপলব্ধ ব্যালান্স</p>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4 text-center border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">মোট পরিমাণ</p>
                  <p className="font-black text-slate-800 text-lg">৳{result.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">ব্যবহার হয়েছে</p>
                  <p className="font-black text-rose-500 text-lg">৳{result.usedAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">স্ট্যাটাস</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${result.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {result.status === 'Active' ? 'সক্রিয়' : 'শেষ'}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">রিসিট নম্বর</p>
                  <p className="text-sm font-bold text-slate-700">{result.receiptNumber}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-400">তৈরির তারিখ</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(result.createdAt).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
            </div>

            {/* Usage History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-700">ব্যবহারের ইতিহাস</h2>
                <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">{result.usages?.length || 0} বার</span>
              </div>
              {!result.usages || result.usages.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">এখনও কোন ব্যবহার হয়নি</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {result.usages.map((u: any) => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Invoice: {u.invoiceId}</p>
                          <p className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleString('bn-BD')}</p>
                        </div>
                      </div>
                      <span className="text-rose-500 font-black">-৳{u.usedAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
