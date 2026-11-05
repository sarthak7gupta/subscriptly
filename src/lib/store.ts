import { writable, derived, get } from 'svelte/store';
import type { Currency, PaymentMethod, Subscription, SubscriptionStatus, Category } from './types';
import {
  loadStoredData,
  saveStoredData,
  getInitialDemoData,
  exportToCSV,
  exportBackupJSON
} from './storage';
import {
  effectivePrice,
  effectiveMonthlyPrice,
  calculateSavings,
  daysUntil,
  advanceRenewalDate,
  generateSuggestions,
  calculateCategoryBreakdown
} from './calculations';

export type NavTab = 'overview' | 'subscriptions' | 'calendar' | 'payments' | 'offers' | 'insights' | 'settings';

const initial = loadStoredData();

export const subscriptions = writable<Subscription[]>(initial.subscriptions);
export const paymentMethods = writable<PaymentMethod[]>(initial.paymentMethods);
export const currency = writable<Currency>(initial.currency);
export const defaultPayment = writable<string>(initial.defaultPayment);
export const theme = writable<'light' | 'dark' | 'system'>(initial.theme);

export const activeTab = writable<NavTab>('overview');
export const searchQuery = writable<string>('');
export const filterCategory = writable<string>('');
export const filterStatus = writable<string>('');

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const toast = writable<ToastState>({ show: false, message: '', type: 'info' });
let toastTimeout: NodeJS.Timeout | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.set({ show: true, message, type });
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.update(t => ({ ...t, show: false }));
  }, 3000);
}

// Auto-persist whenever stores change in browser
if (typeof window !== 'undefined') {
  let isHydrated = false;
  // Delay first save so we don't overwrite on initial load
  setTimeout(() => {
    isHydrated = true;
  }, 100);

  const persist = () => {
    if (!isHydrated) return;
    saveStoredData(
      get(subscriptions),
      get(paymentMethods),
      get(currency),
      get(defaultPayment),
      get(theme)
    );
  };

  subscriptions.subscribe(persist);
  paymentMethods.subscribe(persist);
  currency.subscribe(persist);
  defaultPayment.subscribe(persist);
  theme.subscribe(persist);
}

// Derived Metrics
export const activeSubscriptions = derived(subscriptions, $subs =>
  $subs.filter(s => s.status !== 'cancelled')
);

export const totalMonthlySpend = derived(
  [subscriptions, currency],
  ([$subs]) => $subs
    .filter(s => s.status !== 'cancelled' && s.status !== 'paused')
    .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0)
);

export const totalAnnualSpend = derived(
  totalMonthlySpend,
  $monthly => $monthly * 12
);

export const totalSavings = derived(
  subscriptions,
  $subs => $subs
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + calculateSavings(s), 0)
);

export const upcomingRenewals = derived(
  subscriptions,
  $subs => $subs
    .filter(s => s.status !== 'cancelled' && s.status !== 'paused' && s.nextDate)
    .sort((a, b) => (a.nextDate || '9999').localeCompare(b.nextDate || '9999'))
);

export const smartSuggestions = derived(
  [subscriptions, paymentMethods],
  ([$subs, $pms]) => generateSuggestions($subs, $pms)
);

export const categoryBreakdown = derived(
  subscriptions,
  $subs => calculateCategoryBreakdown($subs, 'month')
);

// Store Actions
export function addSubscription(sub: Omit<Subscription, 'id'>) {
  const newSub: Subscription = {
    ...sub,
    id: `sub_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
  };
  subscriptions.update(list => [newSub, ...list]);
  showToast(`Added ${newSub.name}`, 'success');
  return newSub;
}

export function updateSubscription(updated: Subscription) {
  subscriptions.update(list => list.map(s => (s.id === updated.id ? updated : s)));
  showToast(`Updated ${updated.name}`, 'success');
}

export function deleteSubscription(id: string) {
  let name = '';
  subscriptions.update(list => {
    const target = list.find(s => s.id === id);
    if (target) name = target.name;
    return list.filter(s => s.id !== id);
  });
  showToast(name ? `Removed ${name}` : 'Subscription removed', 'info');
}

export function advanceSubscriptionDate(id: string) {
  subscriptions.update(list =>
    list.map(s => {
      if (s.id !== id) return s;
      const nextDate = advanceRenewalDate(s.nextDate, s.cadence, s.customDays);
      return { ...s, nextDate };
    })
  );
  showToast('Renewal date advanced to next cycle', 'success');
}

export function toggleSubscriptionPause(id: string) {
  subscriptions.update(list =>
    list.map(s => {
      if (s.id !== id) return s;
      const newStatus: SubscriptionStatus = s.status === 'paused' ? 'active' : 'paused';
      return { ...s, status: newStatus };
    })
  );
}

export function addPaymentMethod(pm: Omit<PaymentMethod, 'id'>) {
  const newPm: PaymentMethod = {
    ...pm,
    id: `pm_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
  };
  paymentMethods.update(list => {
    if (newPm.isDefault || list.length === 0) {
      defaultPayment.set(newPm.id);
      return [...list.map(p => ({ ...p, isDefault: false })), newPm];
    }
    return [...list, newPm];
  });
  showToast(`Payment method "${newPm.nickname}" added`, 'success');
  return newPm;
}

export function updatePaymentMethod(updated: PaymentMethod) {
  paymentMethods.update(list => {
    if (updated.isDefault) {
      defaultPayment.set(updated.id);
      return list.map(p => (p.id === updated.id ? updated : { ...p, isDefault: false }));
    }
    return list.map(p => (p.id === updated.id ? updated : p));
  });
  showToast(`Payment method updated`, 'success');
}

export function deletePaymentMethod(id: string) {
  paymentMethods.update(list => list.filter(p => p.id !== id));
  // Unassign linked subscriptions
  subscriptions.update(list =>
    list.map(s => (s.paymentId === id ? { ...s, paymentId: '' } : s))
  );
  if (get(defaultPayment) === id) {
    const remaining = get(paymentMethods);
    defaultPayment.set(remaining[0]?.id || '');
  }
  showToast('Payment method removed and unlinked', 'info');
}

export function setDefaultPaymentMethod(id: string) {
  defaultPayment.set(id);
  paymentMethods.update(list => list.map(p => ({ ...p, isDefault: p.id === id })));
  showToast('Default payment method updated', 'success');
}

export function loadDemoData() {
  const demo = getInitialDemoData();
  subscriptions.set(demo.subscriptions);
  paymentMethods.set(demo.paymentMethods);
  defaultPayment.set(demo.paymentMethods[0]?.id || '');
  showToast('Loaded demo workspace with 8 subscriptions', 'success');
}

export function clearWorkspaceData() {
  subscriptions.set([]);
  paymentMethods.set([]);
  defaultPayment.set('');
  showToast('All workspace data cleared', 'info');
}

export function triggerCSVExport() {
  exportToCSV(get(subscriptions), get(paymentMethods));
  showToast('Exported subscriptions to CSV', 'success');
}

export function triggerJSONBackup() {
  exportBackupJSON(get(subscriptions), get(paymentMethods), get(currency), get(defaultPayment));
  showToast('Downloaded complete JSON backup', 'success');
}
