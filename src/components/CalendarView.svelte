<script lang="ts">
  import {
    subscriptions,
    paymentMethods,
    currency,
    advanceSubscriptionDate
  } from '../lib/store';
  import {
    formatMoney,
    formatDate,
    dueLabel,
    effectivePrice,
    CADENCE_LABELS,
    daysUntil,
    parseISODate
  } from '../lib/calculations';
  import type { Subscription } from '../lib/types';
  import {
    Calendar as CalendarIcon,
    Clock,
    Sparkles,
    Check,
    CreditCard,
    Tag,
    AlertCircle
  } from 'lucide-svelte';

  export let onEditSub: (sub: Subscription) => void;

  let windowDays = 30;

  const pmMap = new Map();
  $: {
    pmMap.clear();
    $paymentMethods.forEach(p => pmMap.set(p.id, p.nickname));
  }

  $: windowSubs = $subscriptions
    .filter(s => s.status !== 'cancelled' && s.status !== 'paused' && s.nextDate)
    .filter(s => {
      const d = daysUntil(s.nextDate);
      return d >= 0 && d <= windowDays;
    })
    .sort((a, b) => (a.nextDate || '9999').localeCompare(b.nextDate || '9999'));

  $: totalDueInWindow = windowSubs.reduce((sum, s) => sum + effectivePrice(s), 0);

  $: expiringOffersInWindow = $subscriptions.filter(s => {
    if (s.offerType === 'none' || !s.offerEnd || s.status === 'cancelled') return false;
    const d = daysUntil(s.offerEnd);
    return d >= 0 && d <= windowDays;
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Renewal Calendar
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Timeline of scheduled recurring payments and trial expiration dates.
      </p>
    </div>

    <!-- Window range selector -->
    <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
      {#each [7, 30, 60, 90] as days}
        <button
          type="button"
          onclick={() => windowDays = days}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {windowDays === days ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}"
        >
          {days} Days
        </button>
      {/each}
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Total Due (Next {windowDays} Days)
      </div>
      <div class="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
        {formatMoney(totalDueInWindow, $currency)}
      </div>
      <div class="mt-1 text-xs text-slate-400">
        {windowSubs.length} recurring charge{windowSubs.length === 1 ? '' : 's'}
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Scheduled Transactions
      </div>
      <div class="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
        {windowSubs.length}
      </div>
      <div class="mt-1 text-xs text-slate-400">
        Active subscriptions charging in this range
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-subtle">
      <div class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
        <span>Trial / Offer Expiries</span>
        <Clock class="w-4 h-4 text-amber-500" />
      </div>
      <div class="mt-2 text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
        {expiringOffersInWindow.length}
      </div>
      <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Offers converting to regular price in this window
      </div>
    </div>
  </div>

  <!-- Timeline Flow -->
  <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-subtle">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
      <h2 class="text-base font-bold text-slate-900 dark:text-white">Chronological Timeline</h2>
      <span class="text-xs text-slate-400">Earliest to latest renewal</span>
    </div>

    {#if windowSubs.length === 0}
      <div class="py-16 text-center">
        <CalendarIcon class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">No renewals in this time window</h3>
        <p class="text-xs text-slate-400 mt-1">Try expanding to 60 or 90 days.</p>
      </div>
    {:else}
      <div class="mt-6 space-y-4">
        {#each windowSubs as sub}
          {@const dateObj = parseISODate(sub.nextDate)}
          {@const dayNum = dateObj.getDate()}
          {@const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' })}
          {@const remaining = daysUntil(sub.nextDate)}

          <div class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
            <!-- Date Badge -->
            <div class="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-xs">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{monthStr}</span>
              <span class="text-lg font-black font-mono text-slate-900 dark:text-white leading-none mt-0.5">{dayNum}</span>
            </div>

            <!-- Service Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                  style="background-color: {sub.color || '#6366f1'}"
                >
                  {sub.initials || sub.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-white truncate">{sub.name}</h3>
                {#if sub.status === 'trial'}
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    TRIAL
                  </span>
                {/if}
              </div>

              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{sub.category}</span>
                <span>•</span>
                <span>{CADENCE_LABELS[sub.cadence]}</span>
                {#if sub.paymentId && pmMap.has(sub.paymentId)}
                  <span>•</span>
                  <span class="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <CreditCard class="w-3 h-3" />
                    {pmMap.get(sub.paymentId)}
                  </span>
                {/if}
                {#if sub.offerEnd && daysUntil(sub.offerEnd) <= 14}
                  <span class="text-amber-600 dark:text-amber-400 font-semibold">
                    (Offer ends {formatDate(sub.offerEnd)})
                  </span>
                {/if}
              </div>
            </div>

            <!-- Amount Due & Actions -->
            <div class="text-right shrink-0">
              <div class="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                {formatMoney(effectivePrice(sub), sub.currency)}
              </div>
              <div class="text-xs font-semibold {remaining <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}">
                {dueLabel(sub.nextDate)}
              </div>
            </div>

            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onclick={() => advanceSubscriptionDate(sub.id)}
                class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Mark as paid (advance to next cycle)"
              >
                <Check class="w-4 h-4" />
              </button>
              <button
                type="button"
                onclick={() => onEditSub(sub)}
                class="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
