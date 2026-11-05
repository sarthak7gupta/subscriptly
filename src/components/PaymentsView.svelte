<script lang="ts">
  import {
    paymentMethods,
    subscriptions,
    defaultPayment,
    currency,
    setDefaultPaymentMethod
  } from '../lib/store';
  import { formatMoney, effectiveMonthlyPrice } from '../lib/calculations';
  import type { PaymentMethod, Subscription } from '../lib/types';
  import {
    Plus,
    CreditCard,
    Shield,
    Star,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle2
  } from 'lucide-svelte';

  export let onOpenAddPayment: () => void;
  export let onEditPayment: (pm: PaymentMethod) => void;
  export let onRequestDeletePayment: (pm: PaymentMethod) => void;

  function getLinkedSubs(pmId: string): Subscription[] {
    return $subscriptions.filter(s => s.paymentId === pmId && s.status !== 'cancelled');
  }

  function getLinkedMonthlySpend(pmId: string): number {
    return $subscriptions
      .filter(s => s.paymentId === pmId && s.status !== 'cancelled' && s.status !== 'paused')
      .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  function isCardExpired(pm: PaymentMethod): boolean {
    if (!pm.expiryYear) return false;
    if (pm.expiryYear < currentYear) return true;
    if (pm.expiryYear === currentYear && (pm.expiryMonth ?? 12) < currentMonth) return true;
    return false;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Payment Methods
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Track which credit cards, UPI mandates, and app stores power each subscription.
      </p>
    </div>
    <button
      type="button"
      onclick={onOpenAddPayment}
      class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>Add Payment Method</span>
    </button>
  </div>

  <!-- Security Notice -->
  <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
    <Shield class="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
    <div class="text-xs text-slate-600 dark:text-slate-300">
      <b class="text-slate-900 dark:text-white">Security-First Principle:</b> Only assign nicknames and the last four digits for recognition. Never store full 16-digit card numbers, CVVs, PINs, or banking passwords.
    </div>
  </div>

  <!-- Visual Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each $paymentMethods as pm}
      {@const linked = getLinkedSubs(pm.id)}
      {@const monthlySpend = getLinkedMonthlySpend(pm.id)}
      {@const expired = isCardExpired(pm)}
      {@const isDefault = pm.id === $defaultPayment || pm.isDefault}

      <div class="rounded-2xl p-6 text-white shadow-card relative flex flex-col justify-between overflow-hidden min-h-[220px] transition-transform hover:-translate-y-0.5 duration-200 {pm.brand === 'Visa' ? 'bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30' : pm.brand === 'Mastercard' ? 'bg-gradient-to-tr from-slate-900 via-zinc-900 to-amber-950 border border-amber-500/30' : pm.brand === 'Amex' ? 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30' : pm.brand === 'UPI' ? 'bg-gradient-to-tr from-orange-950 via-amber-900 to-slate-900 border border-orange-500/30' : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border border-slate-700'}">
        <!-- Top row: Brand & Default / Menu -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-extrabold tracking-wider font-mono uppercase bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
              {pm.brand}
            </span>
            {#if isDefault}
              <span class="flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Star class="w-3 h-3 fill-emerald-300" />
                DEFAULT
              </span>
            {/if}
            {#if expired}
              <span class="flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle class="w-3 h-3" />
                EXPIRED
              </span>
            {/if}
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              onclick={() => onEditPayment(pm)}
              class="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Edit payment method"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onclick={() => onRequestDeletePayment(pm)}
              class="p-1.5 text-white/60 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
              title="Delete payment method"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Middle: Chip & Embossed Digits -->
        <div class="my-4">
          <div class="flex items-center gap-3 mb-3">
            <!-- Simulated EMV Chip -->
            <div class="w-9 h-7 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/40 shadow-inner flex flex-col justify-around p-1 opacity-90">
              <div class="w-full h-0.5 bg-amber-600/40"></div>
              <div class="w-full h-0.5 bg-amber-600/40"></div>
            </div>
            <!-- Contactless Icon -->
            <svg class="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.5 16.5a5 5 0 0 1 0-7" />
              <path d="M12 19a8.5 8.5 0 0 0 0-14" />
            </svg>
          </div>

          <div class="font-mono text-base tracking-[0.25em] text-white/90 font-bold">
            {#if pm.type === 'card' && pm.last4}
              ••••  ••••  ••••  {pm.last4}
            {:else}
              {pm.nickname}
            {/if}
          </div>
        </div>

        <!-- Bottom row: Details & Spend summary -->
        <div class="pt-3 border-t border-white/10 flex items-end justify-between text-xs">
          <div>
            <div class="text-[10px] text-white/60 uppercase tracking-wider font-medium">Account / Label</div>
            <div class="font-bold text-white tracking-wide truncate max-w-[140px]">{pm.nickname}</div>
            {#if pm.expiryMonth && pm.expiryYear}
              <div class="text-[10px] text-white/70 font-mono mt-0.5">
                EXP: {String(pm.expiryMonth).padStart(2, '0')}/{String(pm.expiryYear).slice(-2)}
              </div>
            {/if}
          </div>

          <div class="text-right">
            <div class="text-[10px] text-white/60 uppercase tracking-wider font-medium">{linked.length} linked plan{linked.length === 1 ? '' : 's'}</div>
            <div class="font-mono font-bold text-sm text-white">{formatMoney(monthlySpend, $currency)}<span class="text-[10px] text-white/70 font-normal">/mo</span></div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Detailed Payment Allocation Breakdown -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-subtle">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Subscription Allocation</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Review which recurring payments charge to each card or wallet.</p>
      </div>
    </div>

    <div class="divide-y divide-slate-100 dark:divide-slate-800/80">
      {#each $paymentMethods as pm}
        {@const linked = getLinkedSubs(pm.id)}
        {@const monthlySpend = getLinkedMonthlySpend(pm.id)}

        <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <CreditCard class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-900 dark:text-white">{pm.nickname}</span>
                {#if pm.id === $defaultPayment || pm.isDefault}
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    DEFAULT
                  </span>
                {/if}
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                {pm.brand} • {pm.type.toUpperCase()}{pm.last4 ? ` •••• ${pm.last4}` : ''}
              </div>
            </div>
          </div>

          <!-- Linked Subscriptions Chips -->
          <div class="flex-1 px-0 sm:px-6">
            {#if linked.length === 0}
              <span class="text-xs text-slate-400 italic">No subscriptions linked to this method.</span>
            {:else}
              <div class="flex flex-wrap items-center gap-1.5">
                {#each linked as sub}
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: {sub.color || '#6366f1'}"></span>
                    <span>{sub.name}</span>
                  </span>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Total Monthly Charge -->
          <div class="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
            <div class="font-mono font-bold text-sm text-slate-900 dark:text-white">
              {formatMoney(monthlySpend, $currency)}/mo
            </div>
            {#if pm.id !== $defaultPayment}
              <button
                type="button"
                onclick={() => setDefaultPaymentMethod(pm.id)}
                class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
              >
                Make Default
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
