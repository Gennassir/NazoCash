import React, { useState } from 'react';
import { LoanPackage } from '../types';
import { calcRepayment, formatUGX } from '../data/packages';
import { Coins, Calendar, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface PackagesListProps {
  packages: LoanPackage[];
  onSelectPackage: (pkg: LoanPackage) => void;
}

export const PackagesList: React.FC<PackagesListProps> = ({ packages, onSelectPackage }) => {
  const [filterTier, setFilterTier] = useState<'all' | 'starter' | 'growth' | 'business'>('all');

  const filteredPackages = packages.filter((pkg) => {
    if (filterTier === 'starter') return pkg.limitUgx <= 362500;
    if (filterTier === 'growth') return pkg.limitUgx > 362500 && pkg.limitUgx <= 710500;
    if (filterTier === 'business') return pkg.limitUgx > 710500;
    return true;
  });

  return (
    <section className="max-w-4xl mx-auto px-4 py-8" id="packages">
      {/* Section Head */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e1f3f] tracking-tight">
          Choose your loan amount
        </h2>
        <p className="text-[#64748b] text-sm sm:text-base mt-1">
          All packages available · processing fee <span className="font-semibold text-[#0a2540]">UGX 5,600</span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterTier('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            filterTier === 'all'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-[#64748b] hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Amounts ({packages.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTier('starter')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            filterTier === 'starter'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-[#64748b] hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Starter (145K - 362.5K)
        </button>
        <button
          type="button"
          onClick={() => setFilterTier('growth')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            filterTier === 'growth'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-[#64748b] hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Growth (464K - 710.5K)
        </button>
        <button
          type="button"
          onClick={() => setFilterTier('business')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            filterTier === 'business'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-[#64748b] hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Business (855.5K - 1.45M)
        </button>
      </div>

      {/* Package List */}
      <div className="flex flex-col gap-4">
        {filteredPackages.map((pkg) => {
          const plan3 = calcRepayment(pkg.limitUgx, 3);
          return (
            <div
              key={pkg.id}
              className="bg-white rounded-[20px] p-5 sm:px-8 sm:py-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-[#0a2540]/6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_35px_-8px_rgba(10,37,64,0.12)] hover:border-[#f5b342]"
            >
              {/* Left Accent Bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#f5b342] to-[#e6a030] rounded-l"></div>

              {/* Left Details */}
              <div className="flex flex-col gap-1 pl-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] tracking-tight">
                  UGX {pkg.limitDisplay}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className="bg-[#eef2f6] px-3.5 py-1 rounded-full font-medium text-[#0a2540] inline-flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#f5b342]" />
                    Processing: <strong className="font-bold text-[#0e1f3f]">UGX {pkg.feeUgx.toLocaleString()}</strong>
                  </span>
                  {pkg.popular && (
                    <span className="bg-[#f5b342] text-[#0e1f3f] font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
                      Popular
                    </span>
                  )}
                </div>
              </div>

              {/* Right Repayment & CTA */}
              <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right flex flex-col md:items-end">
                  <div className="text-xs sm:text-sm text-[#64748b] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#f5b342]" />
                    <span>From <strong className="text-[#0e1f3f] font-bold">{formatUGX(plan3.monthly)}</strong>/mo</span>
                  </div>
                  <span className="inline-block mt-0.5 bg-[#eaf6ed] text-[#0f6d4a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    3‑12 mo terms
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className="bg-gradient-to-r from-[#f5b342] to-[#e6a030] hover:from-[#f7be55] hover:to-[#ebaa42] text-[#0e1f3f] font-bold px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm cursor-pointer shadow-[0_4px_15px_rgba(245,179,66,0.35)] hover:shadow-[0_8px_25px_rgba(245,179,66,0.45)] transition-all duration-200 flex items-center gap-2 group-hover:translate-x-0.5 shrink-0"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
