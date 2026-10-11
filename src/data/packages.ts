import { LoanPackage, RepaymentMonth, RepaymentPlan } from '../types';

export const FIXED_FEE_UGX = 9371;
export const MIN_LOAN_UGX = 650000;
export const MAX_LOAN_UGX = 5000000;

// The 12 official packages scaling from UGX 650,000 to UGX 5,000,000
export const LOAN_PACKAGES: LoanPackage[] = [
  {
    id: 'pkg-1',
    limitUgx: 650000,
    limitDisplay: '650,000',
    feeUgx: 9371,
    popular: true,
  },
  {
    id: 'pkg-2',
    limitUgx: 850000,
    limitDisplay: '850,000',
    feeUgx: 12250,
    popular: false,
  },
  {
    id: 'pkg-3',
    limitUgx: 1100000,
    limitDisplay: '1,100,000',
    feeUgx: 15850,
    popular: true,
  },
  {
    id: 'pkg-4',
    limitUgx: 1400000,
    limitDisplay: '1,400,000',
    feeUgx: 20180,
    popular: false,
  },
  {
    id: 'pkg-5',
    limitUgx: 1750000,
    limitDisplay: '1,750,000',
    feeUgx: 25220,
    popular: false,
  },
  {
    id: 'pkg-6',
    limitUgx: 2150000,
    limitDisplay: '2,150,000',
    feeUgx: 30990,
    popular: true,
  },
  {
    id: 'pkg-7',
    limitUgx: 2600000,
    limitDisplay: '2,600,000',
    feeUgx: 37480,
    popular: false,
  },
  {
    id: 'pkg-8',
    limitUgx: 3100000,
    limitDisplay: '3,100,000',
    feeUgx: 44690,
    popular: false,
  },
  {
    id: 'pkg-9',
    limitUgx: 3650000,
    limitDisplay: '3,650,000',
    feeUgx: 52620,
    popular: false,
  },
  {
    id: 'pkg-10',
    limitUgx: 4250000,
    limitDisplay: '4,250,000',
    feeUgx: 61270,
    popular: true,
  },
  {
    id: 'pkg-11',
    limitUgx: 4600000,
    limitDisplay: '4,600,000',
    feeUgx: 66320,
    popular: false,
  },
  {
    id: 'pkg-12',
    limitUgx: 5000000,
    limitDisplay: '5,000,000',
    feeUgx: 72080,
    popular: true,
  },
];

export function getPackageFee(principal: number): number {
  const match = LOAN_PACKAGES.find((p) => p.limitUgx === principal);
  if (match) return match.feeUgx;
  return Math.round(principal * 0.014416);
}

export const INTEREST_RATES: Record<RepaymentMonth, number> = {
  3: 0.05,
  6: 0.10,
  12: 0.20,
};

export function calcRepayment(principal: number, months: RepaymentMonth): RepaymentPlan {
  const rate = INTEREST_RATES[months] ?? 0.05;
  const total = Math.round(principal * (1 + rate));
  const monthly = Math.round(total / months);
  const label = months === 12 ? '1 year' : `${months} months`;
  return {
    months,
    label,
    rate,
    total,
    monthly,
  };
}

export function formatUGX(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

export const UGANDAN_NAMES = [
  'John Okello',
  'Sarah Nakato',
  'David Muwonge',
  'Grace Nankya',
  'Peter Ssali',
  'Rose Nalwanga',
  'Robert Kato',
  'Mary Nakkazi',
  'Joseph Ssebuwufu',
  'Catherine Nambi',
  'Patrick Musoke',
  'Jane Nalubega',
  'Samuel Mukasa',
  'Margaret Nansubuga',
  'Francis Muwanga',
  'Monica Nantongo',
  'Richard Ssempijja',
  'Jessica Nalukwago',
  'Charles Kayemba',
  'Joan Nakato',
  'Brian Byaruhanga',
  'Agnes Namubiru',
  'Ronald Kigozi',
  'Prossy Namutebi',
  'Dennis Ochieng',
  'Florence Akello',
];

export const UGANDAN_CITIES = [
  'Kampala',
  'Entebbe',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Mukono',
  'Masaka',
  'Fort Portal',
  'Mbale',
  'Arua',
];

export function detectUgandaNetwork(phone: string): 'MTN' | 'Airtel' | 'Other' {
  const clean = phone.replace(/[^0-9]/g, '');
  let prefix = '';
  if (clean.startsWith('256')) {
    prefix = clean.slice(3, 5);
  } else if (clean.startsWith('0')) {
    prefix = clean.slice(1, 3);
  } else if (clean.startsWith('7')) {
    prefix = clean.slice(0, 2);
  }

  // MTN prefixes in Uganda: 77, 78, 76, 39
  if (['77', '78', '76', '39'].includes(prefix)) {
    return 'MTN';
  }
  // Airtel prefixes in Uganda: 70, 75, 74
  if (['70', '75', '74'].includes(prefix)) {
    return 'Airtel';
  }
  return 'Other';
}

export function formatUgandaPhoneNumber(phone: string): string | null {
  let formatted = phone.replace(/\s+/g, '');
  if (formatted.startsWith('+')) formatted = formatted.substring(1);
  if (formatted.startsWith('0')) formatted = '256' + formatted.substring(1);
  else if (formatted.startsWith('7')) formatted = '256' + formatted;
  else if (!formatted.startsWith('256')) return null;
  if (formatted.length !== 12 || !formatted.startsWith('256')) return null;
  return formatted;
}

export function generateRandomRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'NZC-';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
