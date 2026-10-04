import { LoanPackage, RepaymentMonth, RepaymentPlan } from '../types';

export const FIXED_FEE_UGX = 5600;
export const KSH_TO_UGX = 29;

// The exact 12 packages from https://nazocashug.edgeone.dev
export const PACKAGES_RAW = [
  { kshLimit: 5000, popular: true },
  { kshLimit: 7500, popular: false },
  { kshLimit: 10000, popular: true },
  { kshLimit: 12500, popular: false },
  { kshLimit: 16000, popular: false },
  { kshLimit: 20000, popular: true },
  { kshLimit: 24500, popular: false },
  { kshLimit: 29500, popular: false },
  { kshLimit: 33000, popular: false },
  { kshLimit: 38500, popular: true },
  { kshLimit: 43000, popular: false },
  { kshLimit: 50000, popular: true },
];

export const LOAN_PACKAGES: LoanPackage[] = PACKAGES_RAW.map((p, idx) => {
  const principalUGX = Math.round(p.kshLimit * KSH_TO_UGX);
  return {
    id: `pkg-${idx + 1}`,
    limitUgx: principalUGX,
    limitDisplay: principalUGX.toLocaleString(),
    feeUgx: FIXED_FEE_UGX,
    popular: p.popular,
  };
});

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
