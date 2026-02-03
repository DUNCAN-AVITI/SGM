
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 focus:ring-indigo-100 border-2 border-transparent",
    secondary: "bg-white text-slate-700 border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 shadow-sm focus:ring-slate-100",
    danger: "bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-md focus:ring-red-100"
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[10px]",
    md: "px-6 py-3.5 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
