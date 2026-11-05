import { describe, it, expect } from 'vitest';
import { validateBackupJSON, getInitialDemoData } from '../src/lib/storage';

describe('storage.ts', () => {
  it('generates non-empty demo data with valid relational payment IDs', () => {
    const demo = getInitialDemoData();
    expect(demo.subscriptions.length).toBeGreaterThan(0);
    expect(demo.paymentMethods.length).toBeGreaterThan(0);

    const pmIds = new Set(demo.paymentMethods.map(p => p.id));
    for (const sub of demo.subscriptions) {
      if (sub.paymentId) {
        expect(pmIds.has(sub.paymentId)).toBe(true);
      }
    }
  });

  it('validates a correct JSON backup structure', () => {
    const validJson = JSON.stringify({
      app: 'Subscriptly',
      version: 2,
      currency: 'USD',
      defaultPayment: 'pm_1',
      subscriptions: [
        {
          id: 'sub_1',
          name: 'Netflix',
          category: 'Entertainment',
          currency: 'USD',
          regularPrice: 15.99,
          cadence: 'monthly',
          nextDate: '2026-11-20',
          status: 'active',
          paymentId: 'pm_1'
        }
      ],
      paymentMethods: [
        {
          id: 'pm_1',
          nickname: 'Chase Sapphire',
          type: 'card',
          brand: 'Visa',
          last4: '1234',
          isDefault: true
        }
      ]
    });

    const result = validateBackupJSON(validJson);
    expect(result.valid).toBe(true);
    expect(result.data?.subscriptions.length).toBe(1);
    expect(result.data?.subscriptions[0].name).toBe('Netflix');
    expect(result.data?.paymentMethods[0].brand).toBe('Visa');
  });

  it('rejects invalid or corrupted JSON backups', () => {
    expect(validateBackupJSON('not a json').valid).toBe(false);
    expect(validateBackupJSON('{"subscriptions": "not-array"}').valid).toBe(false);
    expect(validateBackupJSON('{"subscriptions": []}').valid).toBe(false); // missing paymentMethods
  });
});
