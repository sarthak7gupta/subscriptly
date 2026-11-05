<script lang="ts">
  import {
    defaultPayment,
    addPaymentMethod,
    updatePaymentMethod
  } from '../lib/store';
  import type { PaymentMethod, PaymentType, CardBrand } from '../lib/types';
  import { X, CreditCard, AlertCircle } from 'lucide-svelte';

  export let show: boolean = false;
  export let editingPayment: PaymentMethod | null = null;
  export let onClose: () => void;

  let nickname = '';
  let type: PaymentType = 'card';
  let brand: CardBrand = 'Visa';
  let last4 = '';
  let expiryMonth: number | undefined = undefined;
  let expiryYear: number | undefined = undefined;
  let notes = '';
  let isDefault = false;
  let formError = '';

  const brands: CardBrand[] = [
    'Visa',
    'Mastercard',
    'Amex',
    'RuPay',
    'Discover',
    'UPI',
    'PayPal',
    'Apple',
    'Google',
    'Bank',
    'Other'
  ];

  $: if (editingPayment) {
    nickname = editingPayment.nickname;
    type = editingPayment.type;
    brand = editingPayment.brand;
    last4 = editingPayment.last4 || '';
    expiryMonth = editingPayment.expiryMonth;
    expiryYear = editingPayment.expiryYear;
    notes = editingPayment.notes || '';
    isDefault = editingPayment.id === $defaultPayment || Boolean(editingPayment.isDefault);
    formError = '';
  } else {
    nickname = '';
    type = 'card';
    brand = 'Visa';
    last4 = '';
    expiryMonth = undefined;
    expiryYear = undefined;
    notes = '';
    isDefault = false;
    formError = '';
  }

  function handleSave() {
    if (!nickname.trim()) {
      formError = 'Please provide a nickname for this payment method.';
      return;
    }

    if (type === 'card' && last4 && !/^\d{4}$/.test(last4.trim())) {
      formError = 'Please enter exactly the last 4 digits of the card.';
      return;
    }

    const payload = {
      nickname: nickname.trim(),
      type,
      brand,
      last4: last4.trim() ? last4.trim().slice(-4) : undefined,
      expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
      expiryYear: expiryYear ? Number(expiryYear) : undefined,
      notes: notes.trim() || undefined,
      isDefault
    };

    if (editingPayment) {
      updatePaymentMethod({ ...editingPayment, ...payload });
    } else {
      addPaymentMethod(payload);
    }

    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-float overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CreditCard class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">
              {editingPayment ? 'Edit Payment Method' : 'New Payment Method'}
            </h2>
            <p class="text-xs text-slate-400">Card, UPI mandate or billing wallet</p>
          </div>
        </div>
        <button
          type="button"
          onclick={onClose}
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="p-6 space-y-4">
        {#if formError}
          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        {/if}

        <!-- Nickname -->
        <div>
          <label for="pm-nickname-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Nickname / Label *
          </label>
          <input
            id="pm-nickname-input"
            type="text"
            placeholder="e.g. HDFC Regalia, Apple ID, GPay UPI"
            bind:value={nickname}
            required
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Type & Brand -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="pm-type-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Type
            </label>
            <select
              id="pm-type-select"
              bind:value={type}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="card">Credit / Debit Card</option>
              <option value="upi">UPI AutoPay</option>
              <option value="platform">App Store / Apple / Google</option>
              <option value="paypal">PayPal</option>
              <option value="bank">Direct Bank Mandate</option>
            </select>
          </div>

          <div>
            <label for="pm-brand-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Brand / Network
            </label>
            <select
              id="pm-brand-select"
              bind:value={brand}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              {#each brands as b}
                <option value={b}>{b}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Last 4 & Expiry -->
        {#if type === 'card'}
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label for="pm-last4-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Last 4 Digits
              </label>
              <input
                id="pm-last4-input"
                type="text"
                maxlength="4"
                placeholder="4821"
                bind:value={last4}
                class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label for="pm-exp-month-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Exp Month
              </label>
              <input
                id="pm-exp-month-input"
                type="number"
                min="1"
                max="12"
                placeholder="MM (08)"
                bind:value={expiryMonth}
                class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label for="pm-exp-year-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Exp Year
              </label>
              <input
                id="pm-exp-year-input"
                type="number"
                min="2024"
                max="2040"
                placeholder="YYYY (2028)"
                bind:value={expiryYear}
                class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        {/if}

        <!-- Notes -->
        <div>
          <label for="pm-notes-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes (Optional)
          </label>
          <input
            id="pm-notes-input"
            type="text"
            placeholder="e.g. Cashback rewards card, business expenses"
            bind:value={notes}
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Default Checkbox -->
        <div class="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="isDefault"
            bind:checked={isDefault}
            class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
          />
          <label for="isDefault" class="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            Set as default payment method
          </label>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            {editingPayment ? 'Save Changes' : 'Create Payment Method'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
