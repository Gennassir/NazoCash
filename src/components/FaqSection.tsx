import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Coins, Clock } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How fast is loan approval and disbursement in Uganda?',
    a: 'Approval is automated and takes only 30 seconds. Once your application is confirmed, funds are credited directly to your MTN Mobile Money or Airtel Money account within 5 minutes.',
  },
  {
    q: 'What are the requirements to qualify for a NazoCash loan?',
    a: 'You only need to be a Ugandan citizen aged 18 or above, have a valid Ugandan National ID (NIN), and possess an active registered MTN or Airtel line that has been active for at least 3 months.',
  },
  {
    q: 'Why is there a flat processing fee of UGX 5,600?',
    a: 'The one-time processing fee of UGX 5,600 covers instant identity verification through the national civil registry, Credit Reference Bureau (CRB) underwriting, and mobile money transaction charges.',
  },
  {
    q: 'What repayment terms and interest rates are available?',
    a: 'We offer flexible repayment terms of 3 months (5% flat interest), 6 months (10% flat interest), and 12 months (20% flat interest). There are zero hidden fees or compounding rollover penalties.',
  },
  {
    q: 'How do I make my monthly repayments?',
    a: 'Repaying is simple and done straight from your mobile phone. Dial *165# for MTN Mobile Money or *185# for Airtel Money, select Payments, enter Merchant Code DIGIMAX, and input your unique Loan Reference ID.',
  },
  {
    q: 'Can I repay early without penalties?',
    a: 'Yes! Early repayments are completely free of charge and boost your credit score, automatically unlocking higher loan limits up to UGX 1,450,000 for future applications.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12" id="faq">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-[#f8fafc] text-[#0a2540] text-xs font-bold px-4 py-1.5 rounded-full mb-2 border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-[#f5b342]" />
          <span>Transparent Lending Uganda</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e1f3f]">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          Everything you need to know about getting your instant loan with NazoCash
        </p>
      </div>

      {/* Grid of 3 key benefit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#eaf6ed] text-[#27ae60] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#0e1f3f]">5-Minute Payout</h4>
            <p className="text-[11px] text-[#64748b] mt-0.5">Instant credit to MTN &amp; Airtel mobile wallets 24/7.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff8ea] text-[#f5b342] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-[#0a2540]" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#0e1f3f]">UGX 5,600 Flat Fee</h4>
            <p className="text-[11px] text-[#64748b] mt-0.5">No surprise deductions or hidden maintenance fees.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0a2540] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#0e1f3f]">Bank-Grade Security</h4>
            <p className="text-[11px] text-[#64748b] mt-0.5">256-bit encrypted data handling compliant with Ugandan regulations.</p>
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left font-bold text-sm text-[#0e1f3f] flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#0a2540]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs text-[#64748b] leading-relaxed border-t border-slate-100">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
