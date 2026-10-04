import React from 'react';
import { Lock, Zap, Shield, ArrowRight } from 'lucide-react';

interface HeroProps {
  onApplyClick: () => void;
  onOpenCalculator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onApplyClick, onOpenCalculator }) => {
  return (
    <section className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-8 md:pt-10 pb-4 sm:pb-6 text-center">
      <div className="bg-white px-4 sm:px-10 py-6 sm:py-10 rounded-[28px] sm:rounded-[44px] shadow-[0_10px_35px_-5px_rgba(10,37,64,0.08)] border border-[#0a2540]/6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-40 sm:w-48 h-40 sm:h-48 bg-[#f5b342]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-1/4 w-40 sm:w-48 h-40 sm:h-48 bg-[#0a2540]/5 rounded-full blur-3xl pointer-events-none -z-0"></div>

        {/* Instant Approval Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#f8fafc] text-[#0a2540] text-[11px] sm:text-xs font-bold px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 uppercase tracking-wider border border-[#0a2540]/5">
          <span className="w-2 h-2 rounded-full bg-[#f5b342] animate-ping"></span>
          <span>Instant Approval</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0e1f3f] tracking-tight mb-2.5 sm:mb-3 leading-tight">
          Get your{' '}
          <span className="bg-gradient-to-r from-[#f5b342] to-[#e6a030] text-[#0e1f3f] px-3 sm:px-4 py-0.5 rounded-full inline-block shadow-xs">
            loan
          </span>
        </h1>

        {/* Subtitle / Lead */}
        <p className="text-[#64748b] text-xs sm:text-base max-w-lg mx-auto mb-5 sm:mb-6 leading-relaxed">
          Choose your loan amount, qualify in seconds, and pick a repayment plan that suits you. Direct disbursement to MTN &amp; Airtel Mobile Money in 5 minutes.
        </p>

        {/* CTA Button */}
        <div className="max-w-md mx-auto mb-3 sm:mb-4">
          <button
            type="button"
            onClick={onApplyClick}
            className="w-full bg-gradient-to-r from-[#0a2540] via-[#12365a] to-[#1a3a6a] hover:from-[#07192c] hover:to-[#122e54] text-white font-bold text-sm sm:text-lg py-3.5 sm:py-4 px-5 sm:px-6 rounded-full cursor-pointer shadow-[0_12px_24px_rgba(10,37,64,0.25)] hover:shadow-[0_16px_32px_rgba(10,37,64,0.35)] transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 sm:gap-3"
          >
            <span>Apply for a loan now</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5b342]" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-3 my-2.5 sm:my-3">
          <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#0a2540] text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full border border-slate-100">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f5b342]" />
            256-bit SSL
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#0a2540] text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full border border-slate-100">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f5b342]" />
            Instant Decision
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#0a2540] text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full border border-slate-100">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f5b342]" />
            Verified &amp; Regulated
          </span>
        </div>

        {/* Network Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 text-[11px] sm:text-xs text-[#64748b]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]"></span> MTN MoMo
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e60000]"></span> Airtel Money
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="font-semibold text-[#0a2540]">Verification Fee: UGX 5,600</span>
        </div>
      </div>
    </section>
  );
};
