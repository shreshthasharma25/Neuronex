import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GamosaRibbon } from './CulturalMotifs';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  showClose = true
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop with Mountain Slate Tint */}
      <div 
        className="fixed inset-0 bg-[#162832]/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full ${maxWidth} bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#D8E2D9] max-h-[92vh] flex flex-col overflow-hidden z-10`}>
        {/* Cultural Gamosa Top Trim */}
        <GamosaRibbon height={8} />

        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex items-start justify-between border-b border-[#E5EADF] bg-[#FAFBF9]">
          <div>
            {title && <h3 className="text-lg sm:text-2xl font-extrabold text-[#162832] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-base text-slate-500 font-medium mt-0.5 sm:mt-1">{subtitle}</p>}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 -mr-1 sm:-mr-2 -mt-1 text-slate-400 hover:text-[#1E5E3A] bg-slate-100 hover:bg-[#EBF5EE] rounded-full transition-colors touch-target"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
