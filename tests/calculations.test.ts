import { describe, it, expect } from 'vitest';
import {
  cadenceDays,
  monthlyEquivalent,
  annualEquivalent,
  daysUntil,
  dueLabel,
  formatMoney,
  effectivePrice,
  effectiveMonthlyPrice,
  calculateSavings,
  advanceRenewalDate,
  calculateCategoryBreakdown,
  generateSuggestions
} from '../src/lib/calculations';
import type { Subscription, PaymentMethod } from '../src/lib/types';

describe('calculations.ts', () => {
  it('correctly calculates days for each cadence', () => {
    expect(cadenceDays('weekly')).toBe(7);
    expect(cadenceDays('monthly')).toBe(30.4375);
    expect(cadenceDays('quarterly')).toBe(91.3125);
    expect(cadenceDays('halfyearly')).toBe(182.625);
    expect(cadenceDays('yearly')).toBe(365.25);
    expect(cadenceDays('custom', 45)).toBe(45);
    expect(cadenceDays('custom', 0)).toBe(30);
  });

  it('normalizes monthly equivalent accurately', () => {
    // 1200 / year = 100 / month
    expect(Math.round(monthlyEquivalent(1200, 'yearly'))).toBe(100);
    // 300 / quarter = 100 / month
    expect(Math.round(monthlyEquivalent(300, 'quarterly'))).toBe(100);
    // 50 / month = 50 / month
    expect(Math.round(monthlyEquivalent(50, 'monthly'))).toBe(50);
    // 14 / 7 days (weekly) = ~61 / month
    expect(Math.round(monthlyEquivalent(14, 'weekly'))).toBe(61);
  });

  it('calculates annual equivalent', () => {
    expect(Math.round(annualEquivalent(100, 'monthly'))).toBe(1200);
  });

  it('computes daysUntil and dueLabel accurately', () => {
    const fixedToday = new Date(2026, 10, 5, 0, 0, 0); // Nov 5, 2026
    expect(daysUntil('2026-11-05', fixedToday)).toBe(0);
    expect(dueLabel('2026-11-05', fixedToday)).toBe('Today');

    expect(daysUntil('2026-11-06', fixedToday)).toBe(1);
    expect(dueLabel('2026-11-06', fixedToday)).toBe('Tomorrow');

    expect(daysUntil('2026-11-10', fixedToday)).toBe(5);
    expect(dueLabel('2026-11-10', fixedToday)).toBe('In 5 days');

    expect(daysUntil('2026-11-01', fixedToday)).toBe(-4);
    expect(dueLabel('2026-11-01', fixedToday)).toBe('4d overdue');
  });

  it('formats currency correctly', () => {
    expect(formatMoney(1499, 'INR')).toBe('₹1,499');
    expect(formatMoney(19.99, 'USD')).toBe('$19.99');
    expect(formatMoney(9.5, 'EUR')).toBe('€9.50');
  });

  it('calculates effective price considering free trials and discounts', () => {
    const fixedToday = new Date(2026, 10, 5, 0, 0, 0); // Nov 5, 2026

    const freeTrialActive: Subscription = {
      id: 'sub1',
      name: 'Test Trial',
      category: 'Entertainment',
      currency: 'INR',
      regularPrice: 500,
      currentPrice: 0,
      cadence: 'monthly',
      nextDate: '2026-11-07',
      status: 'trial',
      paymentId: 'pm1',
      offerType: 'free',
      offerPrice: 0,
      offerEnd: '2026-11-07',
      reminderDays: 3
    };
    expect(effectivePrice(freeTrialActive, fixedToday)).toBe(0);

    const introDiscount: Subscription = {
      id: 'sub2',
      name: 'Test Intro',
      category: 'Productivity',
      currency: 'INR',
      regularPrice: 800,
      currentPrice: 400,
      cadence: 'monthly',
      nextDate: '2026-11-10',
      status: 'active',
      paymentId: 'pm1',
      offerType: 'intro',
      offerPrice: 400,
      offerEnd: '2026-12-05',
      reminderDays: 3
    };
    expect(effectivePrice(introDiscount, fixedToday)).toBe(400);

    const expiredDeal: Subscription = {
      id: 'sub3',
      name: 'Expired Promo',
      category: 'Music',
      currency: 'INR',
      regularPrice: 300,
      currentPrice: 300,
      cadence: 'monthly',
      nextDate: '2026-11-15',
      status: 'active',
      paymentId: 'pm1',
      offerType: 'coupon',
      offerPrice: 150,
      offerEnd: '2026-10-31', // Expired
      reminderDays: 3
    };
    expect(effectivePrice(expiredDeal, fixedToday)).toBe(300);
  });

  it('calculates promotional savings accurately', () => {
    const fixedToday = new Date(2026, 10, 5, 0, 0, 0); // Nov 5, 2026
    const trialSub: Subscription = {
      id: 'sub1',
      name: 'Test Trial',
      category: 'Entertainment',
      currency: 'INR',
      regularPrice: 300,
      currentPrice: 0,
      cadence: 'monthly',
      nextDate: '2026-11-20',
      status: 'trial',
      paymentId: 'pm1',
      offerType: 'free',
      offerPrice: 0,
      offerEnd: '2026-11-20', // 15 days remaining
      reminderDays: 3
    };

    const savings = calculateSavings(trialSub, fixedToday);
    expect(savings).toBeGreaterThan(0);
  });

  it('advances renewal dates correctly', () => {
    expect(advanceRenewalDate('2026-01-15', 'monthly')).toBe('2026-02-15');
    expect(advanceRenewalDate('2026-01-15', 'quarterly')).toBe('2026-04-15');
    expect(advanceRenewalDate('2026-01-15', 'halfyearly')).toBe('2026-07-15');
    expect(advanceRenewalDate('2026-01-15', 'yearly')).toBe('2027-01-15');
    expect(advanceRenewalDate('2026-01-15', 'weekly')).toBe('2026-01-22');
    expect(advanceRenewalDate('2026-01-15', 'custom', 10)).toBe('2026-01-25');
  });

  it('generates suggestions for ending trials and duplicates', () => {
    const fixedToday = new Date(2026, 10, 5, 0, 0, 0); // Nov 5, 2026
    const subs: Subscription[] = [
      {
        id: 's1',
        name: 'Prime Video',
        category: 'Entertainment',
        currency: 'INR',
        regularPrice: 299,
        currentPrice: 0,
        cadence: 'monthly',
        nextDate: '2026-11-08',
        status: 'trial',
        paymentId: '',
        offerType: 'free',
        offerEnd: '2026-11-08', // 3 days remaining!
        reminderDays: 3
      },
      {
        id: 's2',
        name: 'Prime Video', // Duplicate!
        category: 'Entertainment',
        currency: 'INR',
        regularPrice: 299,
        currentPrice: 299,
        cadence: 'monthly',
        nextDate: '2026-11-20',
        status: 'active',
        paymentId: 'pm1',
        offerType: 'none',
        reminderDays: 3
      }
    ];

    const pms: PaymentMethod[] = [
      {
        id: 'pm1',
        nickname: 'Old Card',
        type: 'card',
        brand: 'Visa',
        expiryMonth: 5,
        expiryYear: 2025 // Expired!
      }
    ];

    const suggestions = generateSuggestions(subs, pms, fixedToday);
    expect(suggestions.some(s => s.type === 'trial_ending')).toBe(true);
    expect(suggestions.some(s => s.type === 'duplicate_plan')).toBe(true);
    expect(suggestions.some(s => s.type === 'card_expired')).toBe(true);
    expect(suggestions.some(s => s.type === 'unassigned_payment')).toBe(true);
  });
});
