import React, { useState } from 'react';
import { LoanApplication } from '../types';
import { formatUGX } from '../data/packages';
import {
  X,
  History,
  CheckCircle2,
  Calendar,
  Smartphone,
  Copy,
  Check,
  CreditCard,
  Trash2,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface MyLoansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loans: LoanApplication[];
  onClearLoans: () => void;
  onApplyNew: () => void;
}

export const MyLoansDrawer: React.FC<MyLoansDrawerProps> = ({
  isOpen,
  onClose,
  loans,
  onClearLoans,
  onApplyNew,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(ref);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a2540]/70 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0a2540] flex items-center justify-center text-[#f5b342]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0e1f3f]">My Active Loans</h3>
              <p className="text-xs text-[#64748b]">Track repayments and disbursements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {loans.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <CreditCard className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-[#0e1f3f] mb-1">No Loans Yet</h4>
              <p className="text-xs text-[#64748b] max-w-xs mx-auto mb-6">
                You have not submitted any loan applications yet. Choose a package to qualify instantly.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApplyNew();
                }}
                className="bg-[#0a2540] hover:bg-[#081a2e] text-[#f5b342] font-bold text-xs py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Browse Loan Packages</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#eaf6ed] text-[#0f6d4a] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-[#27ae60]" />
                      Disbursed to MoMo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(loan.reference)}
                      className="text-[11px] font-mono font-bold text-[#0a2540] bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 hover:bg-slate-50"
                      title="Copy reference"
                    >
                      <span>{loan.reference}</span>
                      {copiedId === loan.reference ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline my-2">
                    <div className="text-xs text-[#64748b]">Principal Amount</div>
                    <div className="text-xl font-extrabold text-[#0a2540]">
                      UGX {loan.limitDisplay}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credited To:</span>
                      <span className="font-semibold text-slate-800">
                        {loan.disbursementPhone} ({loan.network})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Repayment Plan:</span>
                      <span className="font-semibold text-slate-800">
                        {loan.months} Months ({formatUGX(loan.monthlyRepayment)}/mo)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Due:</span>
                      <span className="font-bold text-[#0a2540]">
                        {formatUGX(loan.totalRepayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Due Date:</span>
                      <span className="font-semibold text-[#0f6d4a]">
                        {loan.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Repayment Instructions */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-xl">
                    <span className="font-bold text-[#0a2540] block mb-0.5">
                      How to Repay via Mobile Money:
                    </span>
                    <span>
                      Dial <strong>*165#</strong> (MTN) or <strong>*185#</strong> (Airtel) → Payments → Goods &amp; Services → Enter Merchant ID <strong>DIGIMAX</strong> &amp; Reference <strong>{loan.reference}</strong>.
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {loans.length} active record{loans.length > 1 ? 's' : ''} saved locally
                </span>
                <button
                  type="button"
                  onClick={onClearLoans}
                  className="text-xs text-rose-500 hover:text-rose-700 inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#f8fafc]">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#0a2540] hover:bg-[#071a2e] text-white font-bold py-3 rounded-full text-xs transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
