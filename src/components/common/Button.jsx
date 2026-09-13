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
    // North Eastern Themed Variants
    primary: "bg-[#1E5E3A] text-white hover:bg-[#164E30] shadow-md shadow-[#1E5E3A]/25 border border-[#174A2E]",
    secondary: "bg-[#EBF5EE] text-[#1E5E3A] hover:bg-[#DDF0E2] border border-[#C3E2CD] font-bold",
    yellow: "bg-[#D98A1E] text-white hover:bg-[#C27915] shadow-md shadow-[#D98A1E]/25 font-bold border border-[#B36F10]",
    softYellow: "bg-[#FFF6E5] text-[#92540B] hover:bg-[#FDF0D0] border border-[#F7D59A] font-bold",
    emergency: "bg-[#FDF2F2] text-[#C92A2A] hover:bg-[#FCE5E5] border-2 border-[#F5B5B5] font-bold shadow-sm",
    emergencySolid: "bg-[#C92A2A] text-white hover:bg-[#A82020] font-bold shadow-lg shadow-[#C92A2A]/25",
    success: "bg-[#EBF5EE] text-[#1E5E3A] hover:bg-[#DDF0E2] border border-[#C3E2CD] font-bold",
    outline: "bg-white text-[#162832] hover:bg-[#FAF7F2] border-2 border-[#D8E2D9] font-bold",
    ghost: "bg-transparent text-[#162832] hover:bg-[#EBF5EE] hover:text-[#1E5E3A]",
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
