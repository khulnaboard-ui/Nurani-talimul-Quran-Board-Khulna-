"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  menuPlacement?: 'top' | 'bottom';
}

export default function Select({ options, value, onChange, placeholder = "Select...", className = "", menuPlacement = 'bottom' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white hover:bg-slate-100 transition-all ${isOpen ? 'bg-white ring-2 ring-blue-500/50 border-transparent' : ''}`}
      >
        <span className={`block truncate text-[15px] ${!selectedOption ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full bg-white border border-slate-100 rounded-xl shadow-xl py-1 max-h-60 overflow-auto duration-200 ${
          menuPlacement === 'top' 
            ? 'bottom-full mb-2 animate-in fade-in slide-in-from-bottom-2' 
            : 'top-full mt-2 animate-in fade-in slide-in-from-top-2'
        }`}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">কোনো অপশন নেই</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                  ${value === option.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
