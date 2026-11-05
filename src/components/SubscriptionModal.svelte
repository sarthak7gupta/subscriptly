<script lang="ts">
  import {
    currency as globalCurrency,
    paymentMethods,
    defaultPayment,
    addSubscription,
    updateSubscription
  } from '../lib/store';
  import {
    CATEGORIES,
    type Subscription,
    type Cadence,
    type SubscriptionStatus,
    type OfferType,
    type OfferDuration,
    type Currency
  } from '../lib/types';
  import { CADENCE_LABELS, CURRENCY_SYMBOLS } from '../lib/calculations';
  import { X, Sparkles, AlertCircle } from 'lucide-svelte';

  export let show: boolean = false;
  export let editingSub: Subscription | null = null;
  export let onClose: () => void;

  const colorPalette = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#64748b'  // Slate
  ];

  let name = '';
  let category = CATEGORIES[0];
  let currency: Currency = $globalCurrency;
  let regularPrice: number = 0;
  let cadence: Cadence = 'monthly';
  let customDays: number = 30;
  let nextDate = new Date().toISOString().slice(0, 10);
  let status: SubscriptionStatus = 'active';
  let paymentId = $defaultPayment || '';
  let offerType: OfferType = 'none';
  let offerPrice: number = 0;
  let offerEnd: string = '';
  let couponCode = '';
  let offerDuration: OfferDuration = 'first_month';
  let reminderDays = 3;
  let notes = '';
  let color = colorPalette[0];
  let formError = '';

  $: if (editingSub) {
    name = editingSub.name;
    category = editingSub.category;
    currency = editingSub.currency || $globalCurrency;
    regularPrice = editingSub.regularPrice;
    cadence = editingSub.cadence;
    customDays = editingSub.customDays || 30;
    nextDate = editingSub.nextDate;
    status = editingSub.status;
    paymentId = editingSub.paymentId || '';
    offerType = editingSub.offerType;
    offerPrice = editingSub.offerPrice ?? 0;
    offerEnd = editingSub.offerEnd ?? '';
    couponCode = editingSub.couponCode ?? '';
    offerDuration = editingSub.offerDuration ?? 'first_month';
    reminderDays = editingSub.reminderDays ?? 3;
    notes = editingSub.notes ?? '';
    color = editingSub.color || colorPalette[0];
    formError = '';
  } else {
    name = '';
    category = CATEGORIES[0];
    currency = $globalCurrency;
    regularPrice = 0;
    cadence = 'monthly';
    customDays = 30;
    nextDate = new Date().toISOString().slice(0, 10);
    status = 'active';
    paymentId = $defaultPayment || ($paymentMethods[0]?.id ?? '');
    offerType = 'none';
    offerPrice = 0;
    offerEnd = '';
    couponCode = '';
    offerDuration = 'first_month';
    reminderDays = 3;
    notes = '';
    color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    formError = '';
  }

  function handleSave() {
    if (!name.trim()) {
      formError = 'Please provide a subscription name.';
      return;
    }
    if (regularPrice < 0) {
      formError = 'Regular price cannot be negative.';
      return;
    }

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    const payload = {
      name: name.trim(),
      category,
      currency,
      regularPrice: Number(regularPrice) || 0,
      currentPrice: offerType === 'free' && status === 'trial' ? 0 : (offerType !== 'none' && typeof offerPrice === 'number' ? Number(offerPrice) : Number(regularPrice)),
      cadence,
      customDays: cadence === 'custom' ? Number(customDays) || 30 : undefined,
      nextDate: nextDate || new Date().toISOString().slice(0, 10),
      status,
      paymentId,
      offerType,
      offerPrice: offerType !== 'none' ? Number(offerPrice) : undefined,
      offerEnd: offerType !== 'none' && offerEnd ? offerEnd : undefined,
      couponCode: offerType !== 'none' && couponCode ? couponCode.trim() : undefined,
      offerDuration: offerType !== 'none' ? offerDuration : undefined,
      reminderDays: Number(reminderDays) || 3,
      notes: notes.trim() || undefined,
      color,
      initials
    };

    if (editingSub) {
      updateSubscription({ ...editingSub, ...payload });
    } else {
      addSubscription(payload);
    }

    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
    <div
      class="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-float overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style="background-color: {color}">
            {name ? name.slice(0, 2).toUpperCase() : '✦'}
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">
              {editingSub ? 'Edit Subscription' : 'New Subscription'}
            </h2>
            <p class="text-xs text-slate-400">
              {editingSub ? 'Update billing terms and card link' : 'Add recurring service to your tracker'}
            </p>
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

      <!-- Modal Body Form -->
      <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        {#if formError}
          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        {/if}

        <!-- Name & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="sub-name-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Service Name *
            </label>
            <input
              id="sub-name-input"
              type="text"
              placeholder="e.g. Netflix, ChatGPT, Spotify"
              bind:value={name}
              required
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="sub-category-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="sub-category-select"
              bind:value={category}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              {#each CATEGORIES as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Price & Cadence -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="sub-regular-price-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Regular Price ({CURRENCY_SYMBOLS[currency]})
            </label>
            <input
              id="sub-regular-price-input"
              type="number"
              step="any"
              min="0"
              bind:value={regularPrice}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="sub-cadence-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Billing Cadence
            </label>
            <select
              id="sub-cadence-select"
              bind:value={cadence}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              {#each Object.entries(CADENCE_LABELS) as [val, lbl]}
                <option value={val}>{lbl}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="sub-next-date-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Next Renewal Date
            </label>
            <input
              id="sub-next-date-input"
              type="date"
              bind:value={nextDate}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {#if cadence === 'custom'}
          <div>
            <label for="sub-custom-days-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Days Interval
            </label>
            <input
              id="sub-custom-days-input"
              type="number"
              min="1"
              bind:value={customDays}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        {/if}

        <!-- Status & Payment Method -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="sub-status-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Plan Status
            </label>
            <select
              id="sub-status-select"
              bind:value={status}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="trial">Free Trial</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label for="sub-payment-method-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method Allocation
            </label>
            <select
              id="sub-payment-method-select"
              bind:value={paymentId}
              class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {#each $paymentMethods as pm}
                <option value={pm.id}>{pm.nickname} ({pm.brand})</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Promotional Offer & Trial Settings -->
        <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-4">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <Sparkles class="w-4 h-4 text-indigo-500" />
            <span>Promotional Offer, Free Trial & Coupon</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="sub-offer-type-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deal Type
              </label>
              <select
                id="sub-offer-type-select"
                bind:value={offerType}
                class="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="none">No promotion (Standard pricing)</option>
                <option value="free">Free trial</option>
                <option value="intro">Introductory discounted rate</option>
                <option value="coupon">Coupon / Discount code</option>
                <option value="student">Student / Member discount</option>
                <option value="lifetime">One-time / Lifetime deal</option>
              </select>
            </div>

            {#if offerType !== 'none'}
              <div>
                <label for="sub-offer-end-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Offer / Trial End Date
                </label>
                <input
                  id="sub-offer-end-input"
                  type="date"
                  bind:value={offerEnd}
                  class="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {#if offerType !== 'free'}
                <div>
                  <label for="sub-offer-price-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Discounted Promo Price ({CURRENCY_SYMBOLS[currency]})
                  </label>
                  <input
                    id="sub-offer-price-input"
                    type="number"
                    step="any"
                    min="0"
                    bind:value={offerPrice}
                    class="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              {/if}

              <div>
                <label for="sub-coupon-code-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Coupon Code (Optional)
                </label>
                <input
                  id="sub-coupon-code-input"
                  type="text"
                  placeholder="e.g. SUMMER50"
                  bind:value={couponCode}
                  class="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            {/if}
          </div>
        </div>

        <!-- Color Tag Picker -->
        <div>
          <span class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Badge Accent Color
          </span>
          <div class="flex items-center gap-2">
            {#each colorPalette as c}
              <button
                type="button"
                onclick={() => color = c}
                class="w-7 h-7 rounded-xl transition-transform {color === c ? 'scale-115 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'}"
                style="background-color: {c}"
                aria-label="Select color {c}"
              ></button>
            {/each}
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="sub-notes-input" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Personal Notes (Optional)
          </label>
          <input
            id="sub-notes-input"
            type="text"
            placeholder="e.g. Shared with family, cancel before trip"
            bind:value={notes}
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Modal Footer Actions -->
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
            {editingSub ? 'Save Changes' : 'Create Subscription'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
