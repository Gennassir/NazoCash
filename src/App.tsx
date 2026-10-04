import React, { useState, useEffect } from 'react';
import { LoanPackage, LoanApplication } from './types';
import { LOAN_PACKAGES } from './data/packages';
import { Topbar } from './components/Topbar';
import { Hero } from './components/Hero';
import { PackagesList } from './components/PackagesList';
import { LoanCalculator } from './components/LoanCalculator';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ApplicationModal } from './components/ApplicationModal';
import { MyLoansDrawer } from './components/MyLoansDrawer';

const LOCAL_STORAGE_KEY = 'nazocash_loans_history_v1';

export default function App() {
  const [selectedPackage, setSelectedPackage] = useState<LoanPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMyLoansOpen, setIsMyLoansOpen] = useState(false);
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);

  // Load saved loans from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMyLoans(parsed);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Save loans to localStorage
  const saveLoans = (updated: LoanApplication[]) => {
    setMyLoans(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  };

  const handleSelectPackage = (pkg: LoanPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleHeroApply = () => {
    // Open default popular package (UGX 145,000)
    const defaultPkg = LOAN_PACKAGES[0];
    handleSelectPackage(defaultPkg);
  };

  const handleScrollToPackages = () => {
    const el = document.getElementById('packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoanApproved = (newLoan: LoanApplication) => {
    const updated = [newLoan, ...myLoans];
    saveLoans(updated);
  };

  const handleClearLoans = () => {
    saveLoans([]);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-[#0e1f3f] selection:bg-[#f5b342] selection:text-[#0e1f3f]">
      {/* Topbar */}
      <Topbar
        onScrollToPackages={handleScrollToPackages}
        onOpenCalculator={() => setIsCalculatorOpen((prev) => !prev)}
        onOpenMyLoans={() => setIsMyLoansOpen(true)}
        myLoansCount={myLoans.length}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onApplyClick={handleHeroApply}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />

        {/* Optional Collapsible / Inline Calculator */}
        {isCalculatorOpen && (
          <div className="px-3.5 sm:px-4 max-w-4xl mx-auto my-2">
            <LoanCalculator
              onApplyCustom={(customPkg) => {
                handleSelectPackage(customPkg);
                setIsCalculatorOpen(false);
              }}
              onClose={() => setIsCalculatorOpen(false)}
            />
          </div>
        )}

        {/* 12 Loan Packages list */}
        <PackagesList
          packages={LOAN_PACKAGES}
          onSelectPackage={handleSelectPackage}
        />

        {/* Interactive Loan Calculator trigger banner if not open */}
        {!isCalculatorOpen && (
          <div className="max-w-4xl mx-auto px-3.5 sm:px-4 my-4">
            <div className="bg-gradient-to-r from-[#0a2540] to-[#1a3a6a] text-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f5b342] bg-white/10 px-2.5 py-1 rounded-full">
                  Custom Amount
                </span>
                <h3 className="text-lg sm:text-2xl font-extrabold mt-2">
                  Need a custom loan amount?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                  Use our interactive calculator to simulate any amount from UGX 100,000 to UGX 1,500,000 with flexible 3 to 12 months repayment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full sm:w-auto bg-[#f5b342] hover:bg-[#e6a030] text-[#0e1f3f] font-bold px-6 py-3 rounded-full text-xs sm:text-sm whitespace-nowrap shadow-md transition-all active:scale-95 text-center"
              >
                Launch Calculator
              </button>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onScrollToPackages={handleScrollToPackages}
        onOpenCalculator={() => {
          setIsCalculatorOpen(true);
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
      />

      {/* Application Multi-step Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        packageData={selectedPackage}
        onClose={() => setIsModalOpen(false)}
        onLoanApproved={handleLoanApproved}
      />

      {/* My Loans History Drawer */}
      <MyLoansDrawer
        isOpen={isMyLoansOpen}
        onClose={() => setIsMyLoansOpen(false)}
        loans={myLoans}
        onClearLoans={handleClearLoans}
        onApplyNew={handleHeroApply}
      />
    </div>
  );
}
