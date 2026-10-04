export interface LoanPackage {
  id: string;
  limitUgx: number;
  limitDisplay: string;
  feeUgx: number;
  popular?: boolean;
}

export type RepaymentMonth = 3 | 6 | 12;

export interface RepaymentPlan {
  months: RepaymentMonth;
  label: string;
  rate: number;
  total: number;
  monthly: number;
}

export interface LoanApplication {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  disbursementPhone: string;
  network: 'MTN' | 'Airtel' | 'Other';
  idNumber: string;
  principal: number;
  limitDisplay: string;
  fee: number;
  months: RepaymentMonth;
  totalRepayment: number;
  monthlyRepayment: number;
  status: 'disbursed' | 'pending_repayment' | 'processing';
  createdAt: string;
  dueDate: string;
  disbursementTxId: string;
}

export interface LiveToast {
  id: string;
  name: string;
  amount: number;
  createdAt: number;
  city?: string;
}
