import React, { useState } from 'react';
import { Wallet, Sparkles, History, Menu, X } from 'lucide-react';

interface TopbarProps {
  onScrollToPackages: () => void;
  onOpenCalculator: () => void;
  onOpenMyLoans: () => void;
  myLoansCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  onScrollToPackages,
  onOpenCalculator,
  onOpenMyLoans,
  myLoansCount,
}) => {
  const [imgError, setImgError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileMenuOpen(false);
          }}
        >
          {!imgError ? (
            <img
              src="https://www.nazocash.com/images/logo2.png"
              alt="NazoCash"
              className="h-8 sm:h-10 w-auto object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0a2540] flex items-center justify-center text-[#f5b342] shadow-sm">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div>
            <div className="font-extrabold text-lg sm:text-2xl text-[#0e1f3f] tracking-tight leading-none">
              Nazo<span className="text-[#f5b342]">Cash</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#64748b] font-medium flex items-center gap-1.5 mt-0.5">
              <span>Instant Loans</span>
              <span className="w-1 h-1 rounded-full bg-[#f5b342]"></span>
              <span>Uganda</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Calculator button */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-[#0a2540] hover:bg-slate-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f5b342]" />
            <span>Loan Calculator</span>
          </button>

          {/* My Loans button */}
          <button
            type="button"
            onClick={onOpenMyLoans}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#0a2540]/25 text-[#0a2540] hover:bg-slate-50 transition-colors relative"
          >
            <History className="w-3.5 h-3.5" />
            <span>My Loans</span>
            {myLoansCount > 0 && (
              <span className="bg-[#27ae60] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                {myLoansCount}
              </span>
            )}
          </button>

          {/* View Plans CTA */}
          <button
            type="button"
            onClick={onScrollToPackages}
            className="bg-[#0a2540] text-white hover:bg-[#07192c] font-semibold px-5 py-1.5 rounded-full text-xs transition-all duration-200 shadow-xs"
          >
            View Plans
          </button>
        </div>

        {/* Mobile Navigation Actions (< md) */}
        <div className="flex md:hidden items-center gap-2">
          {/* My Loans compact button on mobile */}
          <button
            type="button"
            onClick={onOpenMyLoans}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full border border-[#0a2540]/20 text-[#0a2540] bg-slate-50 active:bg-slate-100 relative"
            title="My Loans"
          >
            <History className="w-3.5 h-3.5" />
            <span className="text-[11px]">Loans</span>
            {myLoansCount > 0 && (
              <span className="bg-[#27ae60] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {myLoansCount}
              </span>
            )}
          </button>

          {/* View Plans compact button on mobile */}
          <button
            type="button"
            onClick={onScrollToPackages}
            className="bg-[#0a2540] text-white font-bold px-3 py-1.5 rounded-full text-xs active:bg-[#07192c] transition-colors shadow-xs"
          >
            Apply
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 animate-fade-down shadow-lg">
          <button
            type="button"
            onClick={() => {
              onOpenCalculator();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-[#0a2540] bg-slate-50 hover:bg-slate-100"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f5b342]" />
              Loan Calculator
            </span>
            <span className="text-[10px] text-slate-400">Custom amounts</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onScrollToPackages();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-[#0a2540] bg-slate-50 hover:bg-slate-100"
          >
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              All 12 Loan Plans
            </span>
            <span className="text-[10px] text-slate-400">From UGX 145,000</span>
          </button>
        </div>
      )}
    </header>
  );
};
