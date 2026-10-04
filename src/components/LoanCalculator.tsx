import React, { useState } from 'react';
import { RepaymentMonth, LoanPackage } from '../types';
import { FIXED_FEE_UGX, calcRepayment, formatUGX } from '../data/packages';
import { Calculator, Check, ArrowRight, ShieldCheck, Clock, Coins } from 'lucide-react';

interface LoanCalculatorProps {
  onApplyCustom: (pkg: LoanPackage) => void;
  onClose?: () => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onApplyCustom, onClose }) => {
  const [amount, setAmount] = useState<number>(580000);
  const [months, setMonths] = useState<RepaymentMonth>(3);

  const plan = calcRepayment(amount, months);
  const interestAmount = plan.total - amount;

  const handleApply = () => {
    const customPkg: LoanPackage = {
      id: `custom-${Date.now()}`,
      limitUgx: amount,
      limitDisplay: amount.toLocaleString(),
      feeUgx: FIXED_FEE_UGX,
      popular: true,
    };
    onApplyCustom(customPkg);
  };

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_10px_35px_-5px_rgba(10,37,64,0.08)] border border-[#0a2540]/8 max-w-4xl mx-auto my-8 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0a2540] flex items-center justify-center text-[#f5b342]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f]">
              Interactive Loan Calculator
            </h3>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Simulate repayments with transparent low interest rates &amp; zero hidden charges
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1 rounded-full border border-slate-200"
          >
            Close
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Inputs */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Amount Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-xs font-bold text-[#0e1f3f] uppercase tracking-wide">
                Desired Loan Amount
              </label>
              <span className="text-2xl font-extrabold text-[#0a2540]">
                UGX {amount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={1500000}
              step={25000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#f5b342]"
            />
            <div className="flex justify-between text-[11px] text-[#64748b] mt-1 font-medium">
              <span>UGX 100,000</span>
              <span>UGX 800,000</span>
              <span>UGX 1,500,000</span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[145000, 290000, 580000, 855500, 1450000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setAmount(quick)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                    amount === quick
                      ? 'border-[#0a2540] bg-[#0a2540] text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-[#64748b] hover:bg-slate-100'
                  }`}
                >
                  UGX {(quick / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Tenor / Repayment Term */}
          <div>
            <label className="text-xs font-bold text-[#0e1f3f] uppercase tracking-wide block mb-2">
              Repayment Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { m: 3 as RepaymentMonth, label: '3 Months', rateLabel: '5% flat' },
                { m: 6 as RepaymentMonth, label: '6 Months', rateLabel: '10% flat' },
                { m: 12 as RepaymentMonth, label: '1 Year', rateLabel: '20% flat' },
              ].map((term) => (
                <button
                  key={term.m}
                  type="button"
                  onClick={() => setMonths(term.m)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    months === term.m
                      ? 'border-[#f5b342] bg-[#fff8ea] text-[#0e1f3f] ring-2 ring-[#f5b342]/20 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-[#64748b]'
                  }`}
                >
                  <div className="text-sm font-bold text-[#0a2540]">{term.label}</div>
                  <div className="text-[11px] text-[#27ae60] font-semibold mt-0.5">{term.rateLabel}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="md:col-span-5 bg-[#f8fafc] border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
              Monthly Repayment
            </div>
            <div className="text-3xl font-extrabold text-[#0a2540] mb-4">
              {formatUGX(plan.monthly)}
              <span className="text-xs text-[#64748b] font-normal ml-1">/ month</span>
            </div>

            <div className="space-y-2.5 text-xs border-t border-b border-slate-200/70 py-3 mb-4">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Principal Loan Amount:</span>
                <span className="font-bold text-[#0e1f3f]">UGX {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Total Interest ({plan.rate * 100}%):</span>
                <span className="font-semibold text-[#0a2540]">+{formatUGX(interestAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Total Repayment:</span>
                <span className="font-bold text-[#0e1f3f]">{formatUGX(plan.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                <span className="text-[#64748b] flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#f5b342]" />
                  Processing Fee (one-time):
                </span>
                <span className="font-bold text-[#27ae60]">UGX {FIXED_FEE_UGX.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#eaf6ed] p-2.5 rounded-xl text-[11px] text-[#0f6d4a] flex items-center gap-2 mb-4 font-medium">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Direct Mobile Money credit in under 5 minutes</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full bg-[#0a2540] hover:bg-[#07192c] text-[#f5b342] font-bold py-3.5 px-4 rounded-full text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Apply for UGX {amount.toLocaleString()}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
