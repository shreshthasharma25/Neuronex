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
    white: "bg-white border border-[#D8E2D9] shadow-sm",
    lightBlue: "bg-[#EBF5EE] border border-[#C3E2CD] text-[#162832]",
    teaLight: "bg-[#EBF5EE] border border-[#C3E2CD] text-[#162832]",
    softYellow: "bg-[#FFF6E5] border border-[#F7D59A] text-[#162832]",
    mugaLight: "bg-[#FFF6E5] border border-[#F7D59A] text-[#162832]",
    softGreen: "bg-[#EBF5EE] border border-[#C3E2CD] text-[#162832]",
    softRed: "bg-[#FDF2F2] border border-[#F5C2C2] text-[#162832]",
    primary: "bg-[#1E5E3A] text-white border border-transparent shadow-md shadow-[#1E5E3A]/20",
    bamboo: "bg-[#FAF7F2] border border-[#E5DFD3] text-[#162832]",
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
