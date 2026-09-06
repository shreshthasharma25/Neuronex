import React from 'react';

export default function Card({
  children,
  className = '',
  variant = 'white',
  onClick = null,
  interactive = false,
  ...props
}) {
  const variantStyles = {
    white: "bg-white border border-[#E2E8F0] shadow-sm",
    lightBlue: "bg-[#EAF2FF] border border-[#CFE1FF] text-[#172B4D]",
    softYellow: "bg-[#FFF8E1] border border-[#FDE68A] text-[#172B4D]",
    softGreen: "bg-[#E8F5E9] border border-[#C8E6C9] text-[#172B4D]",
    softRed: "bg-[#FDECEC] border border-[#FECACA] text-[#172B4D]",
    primary: "bg-[#2F6FED] text-white border border-transparent shadow-md shadow-[#2F6FED]/20",
  };

  const isClickable = Boolean(onClick) || interactive;

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-150
        ${variantStyles[variant] || variantStyles.white}
        ${isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.99] touch-target' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
