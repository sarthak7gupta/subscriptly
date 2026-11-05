import type { Currency, PaymentMethod, Subscription } from './types';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscriptly_subscriptions_v2',
  PAYMENTS: 'subscriptly_payments_v2',
  CURRENCY: 'subscriptly_currency_v2',
  DEFAULT_PAYMENT: 'subscriptly_default_pm_v2',
  THEME: 'subscriptly_theme_v2',
  // legacy keys for auto-migration
  LEGACY_SUBSCRIPTIONS: 'subscriptly_subscriptions',
  LEGACY_PAYMENTS: 'subscriptly_payments',
  LEGACY_CURRENCY: 'subscriptly_currency',
  LEGACY_DEFAULT: 'subscriptly_default'
};

export function getInitialDemoData(): { subscriptions: Subscription[]; paymentMethods: PaymentMethod[] } {
  const today = new Date();
  const rel = (days: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm_hdfc',
      nickname: 'HDFC Regalia Gold',
      type: 'card',
      brand: 'Visa',
      last4: '4821',
      expiryMonth: 8,
      expiryYear: 2028,
      notes: 'Primary card for streaming and SaaS',
      isDefault: true
    },
    {
      id: 'pm_icici',
      nickname: 'ICICI Amazon Pay',
      type: 'card',
      brand: 'Mastercard',
      last4: '0936',
      expiryMonth: 11,
      expiryYear: 2027,
      notes: 'Shopping & delivery cashback',
      isDefault: false
    },
    {
      id: 'pm_upi',
      nickname: 'GPay AutoPay',
      type: 'upi',
      brand: 'UPI',
      notes: 'UPI recurring mandate linked to savings bank',
      isDefault: false
    },
    {
      id: 'pm_apple',
      nickname: 'Apple ID Billing',
      type: 'platform',
      brand: 'Apple',
      notes: 'App Store and iCloud in-app billing',
      isDefault: false
    }
  ];

  const subscriptions: Subscription[] = [
    {
      id: 'sub_netflix',
      name: 'Netflix Premium (4K)',
      category: 'Entertainment',
      currency: 'INR',
      regularPrice: 649,
      currentPrice: 499,
      cadence: 'monthly',
      nextDate: rel(3),
      status: 'active',
      paymentId: 'pm_hdfc',
      offerType: 'coupon',
      offerPrice: 499,
      offerEnd: rel(25),
      couponCode: 'BINGE150',
      offerDuration: 'first_3_months',
      reminderDays: 3,
      notes: 'Discounted promotional rate active',
      color: '#ef4444',
      initials: 'N'
    },
    {
      id: 'sub_spotify',
      name: 'Spotify Premium Individual',
      category: 'Music',
      currency: 'INR',
      regularPrice: 119,
      currentPrice: 0,
      cadence: 'monthly',
      nextDate: rel(2),
      status: 'trial',
      paymentId: 'pm_icici',
      offerType: 'free',
      offerPrice: 0,
      offerEnd: rel(2),
      couponCode: '',
      offerDuration: 'trial',
      reminderDays: 2,
      notes: 'Free trial ends soon! Regular price ₹119/mo afterwards.',
      color: '#10b981',
      initials: 'SP'
    },
    {
      id: 'sub_chatgpt',
      name: 'ChatGPT Plus',
      category: 'Productivity',
      currency: 'INR',
      regularPrice: 1999,
      currentPrice: 1999,
      cadence: 'monthly',
      nextDate: rel(8),
      status: 'active',
      paymentId: 'pm_hdfc',
      offerType: 'none',
      reminderDays: 3,
      notes: 'Primary AI coding and writing assistant',
      color: '#10b981',
      initials: 'AI'
    },
    {
      id: 'sub_icloud',
      name: 'iCloud+ 50GB',
      category: 'Cloud storage',
      currency: 'INR',
      regularPrice: 75,
      currentPrice: 75,
      cadence: 'monthly',
      nextDate: rel(14),
      status: 'active',
      paymentId: 'pm_apple',
      offerType: 'none',
      reminderDays: 3,
      notes: 'iPhone device backup & photo sync',
      color: '#0ea5e9',
      initials: 'iC'
    },
    {
      id: 'sub_youtube',
      name: 'YouTube Premium Annual',
      category: 'Entertainment',
      currency: 'INR',
      regularPrice: 1490,
      currentPrice: 1290,
      cadence: 'yearly',
      nextDate: rel(22),
      status: 'active',
      paymentId: 'pm_upi',
      offerType: 'student',
      offerPrice: 1290,
      offerEnd: rel(140),
      couponCode: '',
      offerDuration: 'first_year',
      reminderDays: 7,
      notes: 'Annual billing discount',
      color: '#f43f5e',
      initials: 'YT'
    },
    {
      id: 'sub_notion',
      name: 'Notion Plus',
      category: 'Productivity',
      currency: 'INR',
      regularPrice: 850,
      currentPrice: 425,
      cadence: 'monthly',
      nextDate: rel(18),
      status: 'active',
      paymentId: 'pm_hdfc',
      offerType: 'intro',
      offerPrice: 425,
      offerEnd: rel(60),
      couponCode: '',
      offerDuration: 'first_6_months',
      reminderDays: 5,
      notes: 'Introductory 50% discount for early adopters',
      color: '#8b5cf6',
      initials: 'N+'
    },
    {
      id: 'sub_prime',
      name: 'Amazon Prime Annual',
      category: 'Shopping',
      currency: 'INR',
      regularPrice: 1499,
      currentPrice: 1499,
      cadence: 'yearly',
      nextDate: rel(45),
      status: 'active',
      paymentId: 'pm_icici',
      offerType: 'none',
      reminderDays: 14,
      notes: 'Free fast delivery and Prime Video bundle',
      color: '#f59e0b',
      initials: 'AP'
    },
    {
      id: 'sub_googleone',
      name: 'Google One 100GB',
      category: 'Cloud storage',
      currency: 'INR',
      regularPrice: 130,
      currentPrice: 130,
      cadence: 'monthly',
      nextDate: rel(28),
      status: 'active',
      paymentId: 'pm_upi',
      offerType: 'none',
      reminderDays: 3,
      notes: 'Google Drive, Gmail, and Photos storage',
      color: '#3b82f6',
      initials: 'G1'
    }
  ];

  return { subscriptions, paymentMethods };
}

export function loadStoredData(): {
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  currency: Currency;
  defaultPayment: string;
  theme: 'light' | 'dark' | 'system';
} {
  if (typeof window === 'undefined') {
    const demo = getInitialDemoData();
    return {
      subscriptions: demo.subscriptions,
      paymentMethods: demo.paymentMethods,
      currency: 'INR',
      defaultPayment: 'pm_hdfc',
      theme: 'system'
    };
  }

  try {
    let rawSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    let rawPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    let currency = (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || 'INR';
    let defaultPayment = localStorage.getItem(STORAGE_KEYS.DEFAULT_PAYMENT) || '';
    let theme = (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'system') || 'system';

    // Auto-migrate from legacy keys if new keys are empty
    if (!rawSubs && localStorage.getItem(STORAGE_KEYS.LEGACY_SUBSCRIPTIONS)) {
      rawSubs = localStorage.getItem(STORAGE_KEYS.LEGACY_SUBSCRIPTIONS);
    }
    if (!rawPayments && localStorage.getItem(STORAGE_KEYS.LEGACY_PAYMENTS)) {
      rawPayments = localStorage.getItem(STORAGE_KEYS.LEGACY_PAYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENCY) && localStorage.getItem(STORAGE_KEYS.LEGACY_CURRENCY)) {
      currency = (localStorage.getItem(STORAGE_KEYS.LEGACY_CURRENCY) as Currency) || 'INR';
    }
    if (!defaultPayment && localStorage.getItem(STORAGE_KEYS.LEGACY_DEFAULT)) {
      defaultPayment = localStorage.getItem(STORAGE_KEYS.LEGACY_DEFAULT) || '';
    }

    let subscriptions: Subscription[] = rawSubs ? JSON.parse(rawSubs) : [];
    let paymentMethods: PaymentMethod[] = rawPayments ? JSON.parse(rawPayments) : [];

    if (!subscriptions.length && !paymentMethods.length) {
      const demo = getInitialDemoData();
      subscriptions = demo.subscriptions;
      paymentMethods = demo.paymentMethods;
      defaultPayment = paymentMethods[0]?.id || '';
      saveStoredData(subscriptions, paymentMethods, currency, defaultPayment, theme);
    }

    return { subscriptions, paymentMethods, currency, defaultPayment, theme };
  } catch (err) {
    console.error('Failed to load Subscriptly data:', err);
    const demo = getInitialDemoData();
    return {
      subscriptions: demo.subscriptions,
      paymentMethods: demo.paymentMethods,
      currency: 'INR',
      defaultPayment: 'pm_hdfc',
      theme: 'system'
    };
  }
}

export function saveStoredData(
  subscriptions: Subscription[],
  paymentMethods: PaymentMethod[],
  currency: Currency,
  defaultPayment: string,
  theme: 'light' | 'dark' | 'system'
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentMethods));
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    localStorage.setItem(STORAGE_KEYS.DEFAULT_PAYMENT, defaultPayment);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export function exportToCSV(subscriptions: Subscription[], paymentMethods: PaymentMethod[]): void {
  const pmMap = new Map(paymentMethods.map(p => [p.id, p.nickname]));
  const headers = [
    'Subscription Name',
    'Category',
    'Regular Price',
    'Current Price',
    'Currency',
    'Cadence',
    'Next Renewal Date',
    'Status',
    'Payment Method',
    'Offer Type',
    'Offer Price',
    'Offer End Date',
    'Coupon Code',
    'Notes'
  ];

  const esc = (val: unknown): string => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = subscriptions.map(s => [
    s.name,
    s.category,
    s.regularPrice,
    s.currentPrice,
    s.currency,
    s.cadence,
    s.nextDate,
    s.status,
    pmMap.get(s.paymentId) || 'Unassigned',
    s.offerType,
    s.offerPrice ?? '',
    s.offerEnd ?? '',
    s.couponCode ?? '',
    s.notes ?? ''
  ].map(esc).join(','));

  const csvContent = [headers.map(esc).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `subscriptly-export-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportBackupJSON(
  subscriptions: Subscription[],
  paymentMethods: PaymentMethod[],
  currency: Currency,
  defaultPayment: string
): void {
  const data = {
    app: 'Subscriptly',
    version: 2,
    exportedAt: new Date().toISOString(),
    currency,
    defaultPayment,
    paymentMethods,
    subscriptions
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `subscriptly-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

export function validateBackupJSON(jsonStr: string): {
  valid: boolean;
  data?: {
    subscriptions: Subscription[];
    paymentMethods: PaymentMethod[];
    currency?: Currency;
    defaultPayment?: string;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File is not a valid JSON object.' };
    }
    if (!Array.isArray(parsed.subscriptions)) {
      return { valid: false, error: 'Backup is missing the subscriptions array.' };
    }
    if (!Array.isArray(parsed.paymentMethods)) {
      return { valid: false, error: 'Backup is missing the paymentMethods array.' };
    }

    // Clean and validate each subscription
    const validatedSubs: Subscription[] = parsed.subscriptions.map((s: any, idx: number) => ({
      id: String(s.id || `sub_restored_${idx}_${Date.now()}`),
      name: String(s.name || 'Unnamed Subscription').trim(),
      category: s.category || 'Other',
      currency: s.currency || 'INR',
      regularPrice: Number(s.regularPrice) || 0,
      currentPrice: typeof s.currentPrice === 'number' ? s.currentPrice : (Number(s.regularPrice) || 0),
      cadence: s.cadence || 'monthly',
      customDays: s.customDays ? Number(s.customDays) : undefined,
      nextDate: s.nextDate || new Date().toISOString().slice(0, 10),
      status: s.status || 'active',
      paymentId: String(s.paymentId || ''),
      offerType: s.offerType || 'none',
      offerPrice: s.offerPrice ? Number(s.offerPrice) : undefined,
      offerEnd: s.offerEnd || undefined,
      couponCode: s.couponCode || undefined,
      offerDuration: s.offerDuration || undefined,
      reminderDays: Number(s.reminderDays) || 3,
      notes: s.notes || undefined,
      color: s.color || undefined,
      url: s.url || undefined,
      initials: s.initials || s.name?.slice(0, 2).toUpperCase() || 'S'
    }));

    const validatedPayments: PaymentMethod[] = parsed.paymentMethods.map((p: any, idx: number) => ({
      id: String(p.id || `pm_restored_${idx}_${Date.now()}`),
      nickname: String(p.nickname || 'Payment Method').trim(),
      type: p.type || 'card',
      brand: p.brand || 'Visa',
      last4: p.last4 ? String(p.last4).slice(-4) : undefined,
      expiryMonth: p.expiryMonth ? Number(p.expiryMonth) : undefined,
      expiryYear: p.expiryYear ? Number(p.expiryYear) : undefined,
      notes: p.notes || undefined,
      isDefault: Boolean(p.isDefault)
    }));

    return {
      valid: true,
      data: {
        subscriptions: validatedSubs,
        paymentMethods: validatedPayments,
        currency: parsed.currency,
        defaultPayment: parsed.defaultPayment
      }
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Malformed JSON file.' };
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
