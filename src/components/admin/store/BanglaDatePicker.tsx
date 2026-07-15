import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const bnDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export function toBanglaDigits(num: number | string) {
  const enToBn: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return String(num).replace(/[0-9]/g, match => enToBn[match]);
}

export default function BanglaDatePicker({
  value,
  onChange,
  onClose
}: {
  value: string;
  onChange: (d: string) => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(() => value ? new Date(value) : new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(new Date(year, month - 1, 1)); };
  const nextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(new Date(year, month + 1, 1)); };

  const selectDate = (e: React.MouseEvent, d: number) => {
    e.stopPropagation();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(dateStr);
    onClose();
  };

  return (
    <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-4 w-64 z-50 cursor-default animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
        <span className="font-bold text-slate-800">{bnMonths[month]} {toBanglaDigits(year)}</span>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {bnDays.map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          
          return (
            <button
              type="button"
              key={d}
              onClick={e => selectDate(e, d)}
              className={`w-7 h-7 mx-auto rounded-full text-xs flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/30' 
                  : 'text-slate-700 hover:bg-red-50 font-medium'
              }`}
            >
              {toBanglaDigits(d)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
         <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); onClose(); }} className="text-xs text-slate-500 hover:text-red-500 font-bold transition-colors">রিসেট (Reset)</button>
         <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors">বন্ধ করুন</button>
      </div>
    </div>
  );
}
