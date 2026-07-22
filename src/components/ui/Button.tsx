import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'sub' | 'option' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  
  // Base styles applied to all buttons
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95";
  
  // Size variations
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  // Color variants based on user request
  const variants = {
    // Primary brand color
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 border border-transparent shadow-md",
    
    // Secondary action (lighter or outline)
    secondary: "bg-white text-slate-700 hover:bg-slate-50 hover:text-primary border border-slate-200 focus:ring-slate-200",
    
    // Sub action (very subtle, low contrast)
    sub: "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-transparent shadow-none",
    
    // Option/List items (for dropdowns, selections)
    option: "bg-transparent text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent shadow-none w-full justify-start font-medium",
    
    // Danger
    danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 focus:ring-red-500/30"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
