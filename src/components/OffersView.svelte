<script lang="ts">
  import {
    subscriptions,
    currency,
    totalSavings,
    showToast
  } from '../lib/store';
  import {
    formatMoney,
    formatDate,
    dueLabel,
    effectivePrice,
    calculateSavings,
    CADENCE_LABELS,
    daysUntil
  } from '../lib/calculations';
  import type { Subscription } from '../lib/types';
  import {
    Tag,
    Clock,
    Sparkles,
    Copy,
    Check,
    AlertTriangle,
    Plus,
    Percent
  } from 'lucide-svelte';

  export let onOpenAdd: () => void;
  export let onEditSub: (sub: Subscription) => void;

  let filter: 'all' | 'active' | 'expiring' = 'all';
  let copiedCodeId: string | null = null;

  $: offerSubs = $subscriptions
    .filter(s => s.offerType !== 'none')
    .filter(s => {
      if (filter === 'active') {
        return s.status !== 'cancelled' && (!s.offerEnd || daysUntil(s.offerEnd) >= 0);
      }
      if (filter === 'expiring') {
        return s.offerEnd && daysUntil(s.offerEnd) >= 0 && daysUntil(s.offerEnd) <= 30;
      }
      return true;
    });

  $: expiringSoonCount = $subscriptions.filter(
    s => s.offerEnd && daysUntil(s.offerEnd) >= 0 && daysUntil(s.offerEnd) <= 30
  ).length;

  async function copyCoupon(code: string, id: string) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copiedCodeId = id;
      showToast(`Copied coupon code: ${code}`, 'success');
      setTimeout(() => {
        if (copiedCodeId === id) copiedCodeId = null;
      }, 2000);
    } catch {
      showToast(`Coupon: ${code}`, 'info');
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Deals, Coupons & Free Trials
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Never get caught by surprise price hikes. Track intro discounts, trial end dates, and coupon codes.
      </p>
    </div>
    <button
      type="button"
      onclick={onOpenAdd}
      class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>Track an Offer</span>
    </button>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-card border border-emerald-500/30">
      <div class="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
        <span>Estimated Savings</span>
        <Sparkles class="w-4 h-4 text-emerald-400" />
      </div>
      <div class="mt-3 text-3xl font-extrabold font-mono text-emerald-400">
        {formatMoney($totalSavings, $currency)}
      </div>
      <div class="mt-2 text-xs text-slate-300">
        Saved vs standard regular pricing
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Active Offers
      </div>
      <div class="mt-3 text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
        {$subscriptions.filter(s => s.offerType !== 'none' && s.status !== 'cancelled').length}
      </div>
      <div class="mt-2 text-xs text-slate-400">
        Trials, coupons & intro rates
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
        <span>Price Jumps Soon</span>
        <Clock class="w-4 h-4 text-amber-500" />
      </div>
      <div class="mt-3 text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
        {expiringSoonCount}
      </div>
      <div class="mt-2 text-xs text-slate-400">
        Expiring within next 30 days
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Future Regular Price
      </div>
      <div class="mt-3 text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
        {$subscriptions.filter(s => s.offerType !== 'none' && s.regularPrice > 0).length}
      </div>
      <div class="mt-2 text-xs text-slate-400">
        Plans with post-deal commitment tracked
      </div>
    </div>
  </div>

  <!-- Filter & Table Panel -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-subtle">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Offers & Promotions Roster</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">All monitored coupons, intro periods and free trials</p>
      </div>

      <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          type="button"
          onclick={() => filter = 'all'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}"
        >
          All Offers
        </button>
        <button
          type="button"
          onclick={() => filter = 'active'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {filter === 'active' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}"
        >
          Active Only
        </button>
        <button
          type="button"
          onclick={() => filter = 'expiring'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {filter === 'expiring' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}"
        >
          Expiring Soon (30d)
        </button>
      </div>
    </div>

    {#if offerSubs.length === 0}
      <div class="py-16 text-center">
        <Tag class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching offers found</h3>
        <p class="text-xs text-slate-400 mt-1">Add a subscription with a free trial or promotional coupon.</p>
        <button
          type="button"
          onclick={onOpenAdd}
          class="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Track Offer</span>
        </button>
      </div>
    {:else}
      <div class="overflow-x-auto mt-4">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-4">Service</th>
              <th class="py-3 px-4">Offer Type</th>
              <th class="py-3 px-4">Current Price</th>
              <th class="py-3 px-4">Regular Price</th>
              <th class="py-3 px-4">Offer Ends</th>
              <th class="py-3 px-4">Est. Savings</th>
              <th class="py-3 px-4">Coupon Code</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/70">
            {#each offerSubs as sub}
              {@const savings = calculateSavings(sub)}
              {@const remaining = sub.offerEnd ? daysUntil(sub.offerEnd) : 9999}

              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <!-- Service Name -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style="background-color: {sub.color || '#6366f1'}"
                    >
                      {sub.initials || sub.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                      <div class="text-[10px] text-slate-400">{sub.category}</div>
                    </div>
                  </div>
                </td>

                <!-- Offer Type -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    {sub.offerType}
                  </span>
                </td>

                <!-- Current Promo Price -->
                <td class="py-3.5 px-4">
                  <div class="font-mono font-bold text-slate-900 dark:text-white">
                    {formatMoney(effectivePrice(sub), sub.currency)}
                  </div>
                  <div class="text-[10px] text-slate-400">/{CADENCE_LABELS[sub.cadence].toLowerCase()}</div>
                </td>

                <!-- Regular Price -->
                <td class="py-3.5 px-4">
                  <div class="font-mono text-slate-600 dark:text-slate-300">
                    {formatMoney(sub.regularPrice, sub.currency)}
                  </div>
                  <div class="text-[10px] text-slate-400">After promo</div>
                </td>

                <!-- Expiry Date -->
                <td class="py-3.5 px-4">
                  {#if sub.offerEnd}
                    <div class="font-medium text-slate-900 dark:text-white">
                      {formatDate(sub.offerEnd)}
                    </div>
                    <div class="text-[10px] font-semibold {remaining <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}">
                      {dueLabel(sub.offerEnd)}
                    </div>
                  {:else}
                    <span class="text-slate-400 italic">No end date</span>
                  {/if}
                </td>

                <!-- Savings -->
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatMoney(savings, sub.currency)}
                </td>

                <!-- Coupon Code -->
                <td class="py-3.5 px-4">
                  {#if sub.couponCode}
                    <button
                      type="button"
                      onclick={() => copyCoupon(sub.couponCode!, sub.id)}
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Click to copy code"
                    >
                      <span>{sub.couponCode}</span>
                      {#if copiedCodeId === sub.id}
                        <Check class="w-3 h-3 text-emerald-500" />
                      {:else}
                        <Copy class="w-3 h-3 text-slate-400" />
                      {/if}
                    </button>
                  {:else}
                    <span class="text-slate-400 italic">—</span>
                  {/if}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onclick={() => onEditSub(sub)}
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- Educational Tips Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
        <Clock class="w-5 h-5" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white">Track the Conversion Date</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Always set an <b>Offer End Date</b> on free trials or 50%-off deals. Subscriptly monitors this date so you can cancel or downgrade before regular rates hit your statement.
        </p>
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
        <Percent class="w-5 h-5" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white">Save Verified Coupon Codes</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Store your coupon codes directly on each plan. When contacting customer support for retention or price renewals, you have instant proof of your historical promotion.
        </p>
      </div>
    </div>
  </div>
</div>
