import type {
  Cadence,
  Category,
  Currency,
  PaymentMethod,
  SmartSuggestion,
  Subscription,
  CategorySpend
} from './types';

export const CADENCE_LABELS: Record<Cadence, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  halfyearly: 'Semi-Annually',
  yearly: 'Yearly',
  custom: 'Custom'
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
  SGD: 'S$'
};

export function cadenceDays(cadence: Cadence, customDays?: number): number {
  switch (cadence) {
    case 'weekly':
      return 7;
    case 'monthly':
      return 30.4375;
    case 'quarterly':
      return 91.3125;
    case 'halfyearly':
      return 182.625;
    case 'yearly':
      return 365.25;
    case 'custom':
      return customDays && customDays > 0 ? customDays : 30;
  }
}

export function monthlyEquivalent(price: number, cadence: Cadence, customDays?: number): number {
  const days = cadenceDays(cadence, customDays);
  return (price / days) * 30.4375;
}

export function annualEquivalent(price: number, cadence: Cadence, customDays?: number): number {
  return monthlyEquivalent(price, cadence, customDays) * 12;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function daysUntil(targetDate: string, fromDate: Date = new Date()): number {
  if (!targetDate) return 9999;
  const [y, m, d] = targetDate.split('-').map(Number);
  const targetUtc = Date.UTC(y, m - 1, d);
  const fromUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  return Math.round((targetUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

export function dueLabel(targetDate: string, fromDate: Date = new Date()): string {
  const d = daysUntil(targetDate, fromDate);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  return `In ${d} days`;
}

export function formatDate(dateStr: string, locale: string = 'en-US'): string {
  if (!dateStr) return '—';
  try {
    const d = parseISODate(dateStr);
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatMoney(amount: number, currency: Currency = 'INR', locale: string = 'en-IN'): string {
  const num = Number.isFinite(amount) ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
  return `${symbol}${formatted}`;
}

export function isOfferActive(sub: Subscription, referenceDate: Date = new Date()): boolean {
  if (sub.offerType === 'none') return false;
  if (!sub.offerEnd) return true;
  return daysUntil(sub.offerEnd, referenceDate) >= 0;
}

export function effectivePrice(sub: Subscription, referenceDate: Date = new Date()): number {
  if (sub.status === 'trial') {
    if (isOfferActive(sub, referenceDate) && sub.offerType === 'free') {
      return 0;
    }
  }
  if (isOfferActive(sub, referenceDate) && typeof sub.offerPrice === 'number') {
    return sub.offerPrice;
  }
  return sub.currentPrice ?? sub.regularPrice ?? 0;
}

export function effectiveMonthlyPrice(sub: Subscription, referenceDate: Date = new Date()): number {
  const price = effectivePrice(sub, referenceDate);
  return monthlyEquivalent(price, sub.cadence, sub.customDays);
}

export function calculateSavings(sub: Subscription, referenceDate: Date = new Date()): number {
  if (sub.offerType === 'none') return 0;
  const regular = sub.regularPrice ?? 0;
  const current = effectivePrice(sub, referenceDate);
  const diff = Math.max(0, regular - current);
  if (diff === 0) return 0;

  if (sub.offerEnd) {
    const remainingDays = Math.max(0, Math.min(365, daysUntil(sub.offerEnd, referenceDate)));
    const daysInCycle = cadenceDays(sub.cadence, sub.customDays);
    return (diff / daysInCycle) * remainingDays;
  }

  // Ongoing offer default to 1 year savings projection
  return monthlyEquivalent(diff, sub.cadence, sub.customDays) * 12;
}

export function advanceRenewalDate(currentDateStr: string, cadence: Cadence, customDays?: number): string {
  const [y, m, d] = currentDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  switch (cadence) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'halfyearly':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      date.setDate(date.getDate() + (customDays && customDays > 0 ? customDays : 30));
      break;
  }

  const newY = date.getFullYear();
  const newM = String(date.getMonth() + 1).padStart(2, '0');
  const newD = String(date.getDate()).padStart(2, '0');
  return `${newY}-${newM}-${newD}`;
}

const CATEGORY_PALETTE: Record<Category, { icon: string; color: string }> = {
  'Entertainment': { icon: '◉', color: '#6366f1' },
  'Music': { icon: '♫', color: '#ec4899' },
  'Productivity': { icon: '✦', color: '#8b5cf6' },
  'Cloud storage': { icon: '☁', color: '#06b6d4' },
  'Fitness': { icon: '⚡', color: '#f97316' },
  'News & reading': { icon: '▤', color: '#10b981' },
  'Shopping': { icon: '◇', color: '#eab308' },
  'Food & delivery': { icon: '♧', color: '#f43f5e' },
  'Learning': { icon: '▱', color: '#3b82f6' },
  'Utilities': { icon: '⚙', color: '#64748b' },
  'Finance': { icon: '₹', color: '#14b8a6' },
  'Other': { icon: '◌', color: '#94a3b8' }
};

export function calculateCategoryBreakdown(
  subscriptions: Subscription[],
  period: 'month' | 'year' = 'month',
  referenceDate: Date = new Date()
): CategorySpend[] {
  const map: Record<string, { amount: number; count: number }> = {};

  const activeSubs = subscriptions.filter(s => s.status !== 'cancelled' && s.status !== 'paused');

  for (const s of activeSubs) {
    const monthlyAmt = effectiveMonthlyPrice(s, referenceDate);
    const amt = period === 'year' ? monthlyAmt * 12 : monthlyAmt;
    if (!map[s.category]) {
      map[s.category] = { amount: 0, count: 0 };
    }
    map[s.category].amount += amt;
    map[s.category].count += 1;
  }

  const total = Object.values(map).reduce((sum, item) => sum + item.amount, 0);

  return Object.entries(map)
    .map(([cat, val]) => {
      const category = cat as Category;
      const meta = CATEGORY_PALETTE[category] || CATEGORY_PALETTE['Other'];
      return {
        name: category,
        amount: val.amount,
        percent: total > 0 ? Math.round((val.amount / total) * 100) : 0,
        count: val.count,
        icon: meta.icon,
        color: meta.color
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function generateSuggestions(
  subscriptions: Subscription[],
  paymentMethods: PaymentMethod[],
  referenceDate: Date = new Date()
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  // 1. Check for free trials ending within 7 days
  subscriptions
    .filter(s => s.status === 'trial' && s.offerEnd)
    .forEach(s => {
      const remaining = daysUntil(s.offerEnd!, referenceDate);
      if (remaining >= 0 && remaining <= 7) {
        suggestions.push({
          id: `trial_${s.id}`,
          type: 'trial_ending',
          title: `${s.name} trial ends in ${remaining === 0 ? 'today' : remaining + 'd'}`,
          description: `Price will convert to ${formatMoney(s.regularPrice, s.currency)}/${CADENCE_LABELS[s.cadence].toLowerCase()}. Cancel or review now to avoid unexpected charges.`,
          severity: 'warning',
          actionLabel: 'Review Trial',
          subscriptionId: s.id
        });
      }
    });

  // 2. Check for duplicate subscriptions with same name
  const nameCounts: Record<string, Subscription[]> = {};
  subscriptions
    .filter(s => s.status !== 'cancelled')
    .forEach(s => {
      const cleanName = s.name.trim().toLowerCase();
      if (!nameCounts[cleanName]) nameCounts[cleanName] = [];
      nameCounts[cleanName].push(s);
    });

  Object.entries(nameCounts)
    .filter(([, list]) => list.length > 1)
    .forEach(([cleanName, list]) => {
      suggestions.push({
        id: `dup_${cleanName}`,
        type: 'duplicate_plan',
        title: `Possible duplicate: ${list[0].name}`,
        description: `You have ${list.length} active entries with this name. Check if you are being charged twice for overlapping services.`,
        severity: 'info',
        actionLabel: 'Audit Plans',
        subscriptionId: list[0].id
      });
    });

  // 3. Subscriptions with no payment method assigned
  const unassigned = subscriptions.filter(s => s.status !== 'cancelled' && !s.paymentId);
  if (unassigned.length > 0) {
    suggestions.push({
      id: 'unassigned_cards',
      type: 'unassigned_payment',
      title: `${unassigned.length} subscriptions lack a payment method`,
      description: 'Assign your cards to identify which account will be charged and audit your card spend accurately.',
      severity: 'info',
      actionLabel: 'Assign Methods'
    });
  }

  // 4. Check for expired or expiring payment methods
  const nowYear = referenceDate.getFullYear();
  const nowMonth = referenceDate.getMonth() + 1;
  paymentMethods.forEach(pm => {
    if (pm.expiryYear) {
      const isExpired = pm.expiryYear < nowYear || (pm.expiryYear === nowYear && (pm.expiryMonth ?? 12) < nowMonth);
      if (isExpired) {
        const linkedCount = subscriptions.filter(s => s.paymentId === pm.id && s.status !== 'cancelled').length;
        suggestions.push({
          id: `card_exp_${pm.id}`,
          type: 'card_expired',
          title: `${pm.nickname} is expired`,
          description: `Card expired in ${pm.expiryMonth}/${pm.expiryYear}. ${linkedCount} subscription${linkedCount === 1 ? '' : 's'} linked to it may fail to renew.`,
          severity: 'warning',
          actionLabel: 'Update Card'
        });
      }
    }
  });

  if (suggestions.length === 0 && subscriptions.length > 0) {
    suggestions.push({
      id: 'all_good',
      type: 'high_spend',
      title: 'Everything is in control',
      description: 'All your trials, recurring cycles, and payment cards are monitored and up to date.',
      severity: 'success'
    });
  }

  return suggestions;
}
