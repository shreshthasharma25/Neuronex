import React from 'react';
import { sounds } from '../../utils/soundPlayer';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  className = '',
  disabled = false,
  fullWidth = false,
  icon: Icon,
  playTap = true,
  type = 'button',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    if (playTap) {
      sounds.playGentleTap();
    }
    if (onClick) onClick(e);
  };

  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none no-select";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-xl min-h-[44px]",
    md: "px-5 py-3 text-base rounded-2xl min-h-[50px]",
    lg: "px-6 py-4 text-lg rounded-2xl min-h-[56px] tracking-wide",
    xl: "px-8 py-5 text-xl font-bold rounded-3xl min-h-[64px]",
  };

  const variantStyles = {
    primary: "bg-[#2F6FED] text-white hover:bg-[#255ecf] shadow-md shadow-[#2F6FED]/20 border border-transparent",
    secondary: "bg-[#EAF2FF] text-[#2F6FED] hover:bg-[#dbe7ff] border border-[#d0e1fd]",
    yellow: "bg-[#FFC857] text-[#172B4D] hover:bg-[#f5bc43] shadow-sm font-bold border border-[#f0b538]",
    softYellow: "bg-[#FFF8E1] text-[#B45309] hover:bg-[#fef3c7] border border-[#fde68a]",
    emergency: "bg-[#FDECEC] text-[#D32F2F] hover:bg-[#fcdede] border-2 border-[#fca5a5] font-bold shadow-sm",
    emergencySolid: "bg-[#D32F2F] text-white hover:bg-[#b71c1c] font-bold shadow-lg shadow-red-500/25",
    success: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#d5eed7] border border-[#c8e6c9] font-bold",
    outline: "bg-white text-[#172B4D] hover:bg-slate-50 border-2 border-slate-200",
    ghost: "bg-transparent text-[#172B4D] hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.lg}
        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={`w-6 h-6 mr-2.5 flex-shrink-0`} />}
      <span>{children}</span>
    </button>
  );
}
