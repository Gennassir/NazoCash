import React from 'react';
import { Shield, Lock, PhoneCall, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onScrollToPackages: () => void;
  onOpenCalculator: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToPackages, onOpenCalculator }) => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-[#0e1f3f]">
                Nazo<span className="text-[#f5b342]">Cash</span>
              </span>
              <span className="bg-[#f8fafc] text-[#0a2540] text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                Uganda
              </span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed max-w-sm">
              NazoCash Uganda provides fast, transparent, and non-collateral instant mobile money credit to individuals and small businesses across Kampala, Jinja, Entebbe, Gulu, and throughout Uganda.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-[#0a2540] font-semibold">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#f5b342]" /> 256-bit SSL Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#27ae60]" /> Regulated Data Protection
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#0e1f3f] uppercase tracking-wider mb-2">
              Services
            </h4>
            <ul className="space-y-1.5 text-xs text-[#64748b]">
              <li>
                <button
                  type="button"
                  onClick={onScrollToPackages}
                  className="hover:text-[#0a2540] transition-colors"
                >
                  Loan Packages (UGX 145K - 1.45M)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCalculator}
                  className="hover:text-[#0a2540] transition-colors"
                >
                  Interactive Loan Calculator
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#0a2540] transition-colors">
                  Repayment Guidelines (*165# / *185#)
                </a>
              </li>
              <li>
                <a
                  href="https://pay.jjuma.com/pay/digimax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0a2540] transition-colors"
                >
                  Official JJuma Payment Gateway
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#0e1f3f] uppercase tracking-wider mb-2">
              Contact &amp; Location
            </h4>
            <div className="space-y-2 text-xs text-[#64748b]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#f5b342] shrink-0 mt-0.5" />
                <span>Kampala Road, Central Business District, Kampala, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#f5b342] shrink-0" />
                <span>support@nazocash.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#27ae60] shrink-0" />
                <span>Available 24/7 for automated disbursement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 space-y-1 text-center">
          <p>
            Disclaimer: NazoCash is an instant micro-lending provider. Always borrow responsibly and ensure timely repayments to preserve your Credit Reference Bureau rating.
          </p>
          <p className="font-medium text-slate-500 pt-1">
            © 2026 NazoCash · Instant Loans Uganda · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
