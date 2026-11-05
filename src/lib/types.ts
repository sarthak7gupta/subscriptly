export type Cadence = 'weekly' | 'monthly' | 'quarterly' | 'halfyearly' | 'yearly' | 'custom';

export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled';

export type OfferType = 'none' | 'free' | 'intro' | 'coupon' | 'student' | 'lifetime';

export type OfferDuration = 'trial' | 'first_month' | 'first_3_months' | 'first_6_months' | 'first_year' | 'ongoing' | 'one_time';

export type PaymentType = 'card' | 'upi' | 'paypal' | 'platform' | 'bank';

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' | 'Discover' | 'UPI' | 'PayPal' | 'Apple' | 'Google' | 'Bank' | 'Other';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY' | 'SGD';

export const CATEGORIES = [
  'Entertainment',
  'Music',
  'Productivity',
  'Cloud storage',
  'Fitness',
  'News & reading',
  'Shopping',
  'Food & delivery',
  'Learning',
  'Utilities',
  'Finance',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  currency: Currency;
  regularPrice: number;
  currentPrice: number;
  cadence: Cadence;
  customDays?: number;
  nextDate: string; // YYYY-MM-DD
  status: SubscriptionStatus;
  paymentId: string;
  offerType: OfferType;
  offerPrice?: number;
  offerEnd?: string; // YYYY-MM-DD
  couponCode?: string;
  offerDuration?: OfferDuration;
  reminderDays: number;
  notes?: string;
  color?: string;
  url?: string;
  initials?: string;
}

export interface PaymentMethod {
  id: string;
  nickname: string;
  type: PaymentType;
  brand: CardBrand;
  last4?: string;
  expiryMonth?: number; // 1-12
  expiryYear?: number; // e.g. 2027
  notes?: string;
  isDefault?: boolean;
}

export interface SmartSuggestion {
  id: string;
  type: 'trial_ending' | 'duplicate_plan' | 'unassigned_payment' | 'card_expired' | 'high_spend';
  title: string;
  description: string;
  severity: 'warning' | 'info' | 'success';
  actionLabel?: string;
  subscriptionId?: string;
}

export interface CategorySpend {
  name: Category;
  amount: number;
  percent: number;
  count: number;
  icon: string;
  color: string;
}
