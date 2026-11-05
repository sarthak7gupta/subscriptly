<script lang="ts">
  import {
    subscriptions,
    paymentMethods,
    currency,
    totalMonthlySpend,
    totalAnnualSpend,
    totalSavings,
    upcomingRenewals,
    smartSuggestions,
    categoryBreakdown,
    advanceSubscriptionDate,
    toggleSubscriptionPause,
    defaultPayment,
    showToast
  } from '../../lib/store';
  import {
    formatMoney,
    formatDate,
    dueLabel,
    effectivePrice,
    effectiveMonthlyPrice,
    calculateSavings,
    CADENCE_LABELS,
    daysUntil
  } from '../../lib/calculations';
  import { CATEGORIES, type Subscription, type PaymentMethod, type Category } from '../../lib/types';
  import {
    TrendingUp,
    Sparkles,
    Calendar,
    Clock,
    CreditCard,
    Check,
    Plus,
    Tag,
    AlertCircle,
    ArrowUpRight,
    Search,
    Copy,
    Edit3,
    Trash2,
    Pause,
    Play,
    Layers,
    Shield
  } from 'lucide-svelte';

  export let onOpenAdd: () => void;
  export let onEditSub: (sub: Subscription) => void;
  export let onRequestDeleteSub: (sub: Subscription) => void;

  // State
  let selectedCardId: string = 'all';
  let searchQuery = '';
  let selectedCategory: string = '';
  let selectedStatus: string = '';
  let copiedCodeId: string | null = null;

  // Selected subscription for the Swiss right-hand inspector
  let selectedSubId: string = '';

  const pmMap = new Map<string, PaymentMethod>();
  $: {
    pmMap.clear();
    $paymentMethods.forEach(p => pmMap.set(p.id, p));
  }

  // Filter subscriptions based on:
  // 1. Selected payment card filter (Neo-physical style)
  // 2. Search query
  // 3. Category
  // 4. Status
  $: filteredSubs = $subscriptions.filter(s => {
    if (selectedCardId !== 'all' && s.paymentId !== selectedCardId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const pmName = pmMap.get(s.paymentId)?.nickname || '';
      const text = `${s.name} ${s.category} ${s.notes || ''} ${pmName}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (selectedCategory && s.category !== selectedCategory) return false;
    if (selectedStatus && s.status !== selectedStatus) return false;
    return true;
  });

  // Keep inspector selected sub valid
  $: selectedSub = filteredSubs.find(s => s.id === selectedSubId) || filteredSubs[0] || $subscriptions[0];

  // Card specific metrics
  $: activeCard = $paymentMethods.find(p => p.id === selectedCardId);

  $: visibleMonthlySpend = filteredSubs
    .filter(s => s.status !== 'cancelled' && s.status !== 'paused')
    .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);

  $: expiringTrials = filteredSubs.filter(s => s.offerEnd && daysUntil(s.offerEnd) >= 0 && daysUntil(s.offerEnd) <= 30);

  function getCardSubCount(pmId: string): number {
    return $subscriptions.filter(s => s.paymentId === pmId && s.status !== 'cancelled').length;
  }

  function getCardMonthlySpend(pmId: string): number {
    return $subscriptions
      .filter(s => s.paymentId === pmId && s.status !== 'cancelled' && s.status !== 'paused')
      .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);
  }

  async function copyCoupon(code: string, id: string) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copiedCodeId = id;
      showToast(`Copied coupon: ${code}`, 'success');
      setTimeout(() => {
        if (copiedCodeId === id) copiedCodeId = null;
      }, 2000);
    } catch {
      showToast(`Coupon: ${code}`, 'info');
    }
  }
</script>

<div class="space-y-6">
  <!-- ========================================================================= -->
  <!-- 1. TOP: NEO-PHYSICAL PAYMENT METHOD WISE CAROUSEL FILTER -->
  <!-- ========================================================================= -->
  <div class="space-y-2.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Layers class="w-4 h-4 text-indigo-500" />
        <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Payment Method Allocation Deck
        </h2>
        <span class="text-xs text-slate-400">
          (Click card to filter liabilities)
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => selectedCardId = 'all'}
          class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all {selectedCardId === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}"
        >
          All Cards ({$subscriptions.filter(s => s.status !== 'cancelled').length})
        </button>
      </div>
    </div>

    <!-- Horizontal Card Deck -->
    <div class="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x scrollbar-none">
      {#each $paymentMethods as pm}
        {@const isSelected = selectedCardId === pm.id}
        {@const count = getCardSubCount(pm.id)}
        {@const spend = getCardMonthlySpend(pm.id)}

        <button
          type="button"
          onclick={() => selectedCardId = pm.id}
          class="w-72 shrink-0 p-4 rounded-2xl text-left text-white transition-all snap-start relative flex flex-col justify-between min-h-[155px] cursor-pointer {isSelected ? 'scale-102 ring-4 ring-indigo-500 shadow-float' : 'opacity-85 hover:opacity-100 hover:-translate-y-1 shadow-card'} {pm.brand === 'Visa' ? 'bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 border border-blue-400/30' : pm.brand === 'Mastercard' ? 'bg-gradient-to-tr from-slate-900 via-zinc-900 to-amber-950 border border-amber-400/30' : pm.brand === 'Amex' ? 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 border border-emerald-400/30' : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border border-slate-700'}"
        >
          <div class="flex items-center justify-between w-full">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/15">
              {pm.brand}
            </span>
            {#if pm.id === $defaultPayment}
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300">
                DEFAULT
              </span>
            {/if}
          </div>

          <div class="my-2">
            <div class="text-[10px] text-white/60 uppercase font-medium">ACCOUNT / LABEL</div>
            <div class="font-bold text-sm tracking-wide text-white truncate">{pm.nickname}</div>
            <div class="font-mono text-xs tracking-widest text-white/80 mt-1">
              •••• {pm.last4 || 'AUTO'}
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-2 border-t border-white/10 w-full">
            <span class="text-white/70 text-[11px]">{count} linked plans</span>
            <span class="font-mono font-bold text-white">{formatMoney(spend, $currency)}/mo</span>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 2. MIDDLE: BENTO GRID WIDGETS & STATS -->
  <!-- ========================================================================= -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Tile 1: Hero Burn Rate Widget (Span 2) -->
    <div class="md:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 text-white shadow-card flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">
          {selectedCardId === 'all' ? 'Total Monthly Burn Rate' : `Card Spend: ${activePayment?.nickname}`}
        </span>
        <TrendingUp class="w-4 h-4 text-emerald-400" />
      </div>

      <div class="my-3">
        <div class="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
          {formatMoney(visibleMonthlySpend, $currency)}
        </div>
        <p class="text-xs text-slate-300 mt-1">
          {filteredSubs.length} active plans · Annualized commitment: <b class="text-white font-mono">{formatMoney(visibleMonthlySpend * 12, $currency)}</b>
        </p>
      </div>

      <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Normalized 30-day cadence
        </span>
        <span class="text-emerald-400 font-semibold font-mono">+{formatMoney($totalSavings, $currency)} saved via deals</span>
      </div>
    </div>

    <!-- Tile 2: Trial & Offer Countdown Radar (Span 1) -->
    <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-subtle flex flex-col justify-between">
      <div class="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
        <span>Trial & Deal Watch</span>
        <Clock class="w-4 h-4 text-amber-500" />
      </div>

      <div class="my-2">
        <div class="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
          {expiringTrials.length}
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {expiringTrials.length === 1 ? '1 deal expiring' : `${expiringTrials.length} deals expiring`} in 30 days
        </p>
      </div>

      <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        Cancel or renegotiate before price hike.
      </div>
    </div>

    <!-- Tile 3: Top Category Share Meter (Span 1) -->
    <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
      <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span>Category Share</span>
        <Tag class="w-4 h-4 text-indigo-500" />
      </div>

      <div class="space-y-2 my-2">
        {#each $categoryBreakdown.slice(0, 3) as cat}
          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span class="text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{cat.name}</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">{cat.percent}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full rounded-full" style="width: {cat.percent}%; background-color: {cat.color}"></div>
            </div>
          </div>
        {/each}
      </div>

      <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
        {$categoryBreakdown[0]?.name || 'All'} leads spend
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 3. MAIN: MASTER-DETAIL SPLIT VIEW (SWISS DETAILS INSPECTOR ON RIGHT) -->
  <!-- ========================================================================= -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left: Subscription Roster Table / Cards (7 Cols) -->
    <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-subtle space-y-4">
      <!-- Toolbar: Search + Quick Category Filter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plans or notes..."
            bind:value={searchQuery}
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="flex items-center gap-2">
          <select
            bind:value={selectedCategory}
            class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {#each CATEGORIES as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>

          <button
            type="button"
            onclick={onOpenAdd}
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <!-- Subscriptions List -->
      <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-[580px] overflow-y-auto pr-1">
        {#if filteredSubs.length === 0}
          <div class="py-16 text-center text-xs text-slate-400">
            No subscriptions match the selected card and filters.
          </div>
        {:else}
          {#each filteredSubs as sub}
            {@const isSelected = selectedSub?.id === sub.id}
            {@const dueDays = daysUntil(sub.nextDate)}

            <div
              onclick={() => selectedSubId = sub.id}
              class="py-3 px-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 my-1 {isSelected ? 'bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/50 shadow-xs' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}"
            >
              <!-- Service Info -->
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                  style="background-color: {sub.color || '#6366f1'}"
                >
                  {sub.initials || sub.name.slice(0, 2).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-sm text-slate-900 dark:text-white truncate">{sub.name}</span>
                    {#if sub.status === 'trial'}
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        TRIAL
                      </span>
                    {:else if sub.offerType !== 'none'}
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        OFFER
                      </span>
                    {/if}
                  </div>
                  <div class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{sub.category}</span>
                    <span>•</span>
                    <span class="text-slate-600 dark:text-slate-300 font-medium">{pmMap.get(sub.paymentId)?.nickname || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <!-- Price & Due Date -->
              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right">
                  <div class="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {formatMoney(effectivePrice(sub), sub.currency)}
                  </div>
                  <div class="text-[10px] {dueDays <= 3 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}">
                    {dueLabel(sub.nextDate)}
                  </div>
                </div>

                <button
                  type="button"
                  onclick={(e) => { e.stopPropagation(); advanceSubscriptionDate(sub.id); }}
                  class="p-2 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Mark as paid (advance cycle)"
                >
                  <Check class="w-4 h-4" />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Right: SWISS-STYLE INDIVIDUAL SUBSCRIPTION INSPECTOR DOCK (5 Cols) -->
    <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-5 sticky top-20 self-start">
      {#if selectedSub}
        <div>
          <!-- Inspector Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-sm"
                style="background-color: {selectedSub.color || '#6366f1'}"
              >
                {selectedSub.initials || selectedSub.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  SUBSCRIPTION_INSPECTOR
                </span>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">{selectedSub.name}</h3>
              </div>
            </div>

            <span class="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider {selectedSub.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : selectedSub.status === 'trial' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
              {selectedSub.status}
            </span>
          </div>

          <!-- Price Matrix -->
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span class="text-[10px] font-mono text-slate-400 uppercase">Effective Price</span>
              <div class="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                {formatMoney(effectivePrice(selectedSub), selectedSub.currency)}
              </div>
              <span class="text-[10px] text-slate-400">per {CADENCE_LABELS[selectedSub.cadence].toLowerCase()}</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <span class="text-[10px] font-mono text-slate-400 uppercase">Normalized 30-Day</span>
              <div class="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                {formatMoney(effectiveMonthlyPrice(selectedSub), selectedSub.currency)}
              </div>
              <span class="text-[10px] text-slate-400">monthly burn rate</span>
            </div>
          </div>

          <!-- Free Trial / Deal Watch -->
          {#if selectedSub.offerType !== 'none'}
            <div class="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mt-4 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                <span class="flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-amber-600" />
                  <span>DEAL: {selectedSub.offerType.toUpperCase()}</span>
                </span>
                {#if selectedSub.offerEnd}
                  <span>{dueLabel(selectedSub.offerEnd)}</span>
                {/if}
              </div>

              {#if selectedSub.offerEnd}
                <div class="text-xs text-amber-800 dark:text-amber-300">
                  Expires on <b>{formatDate(selectedSub.offerEnd)}</b>. Converts to regular rate: {formatMoney(selectedSub.regularPrice, selectedSub.currency)}.
                </div>
              {/if}

              {#if selectedSub.couponCode}
                <div class="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
                  <span class="text-[11px] text-amber-800 dark:text-amber-300">Coupon Code:</span>
                  <button
                    type="button"
                    onclick={() => copyCoupon(selectedSub.couponCode!, selectedSub.id)}
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-xs font-mono font-bold border border-amber-300 dark:border-amber-800"
                  >
                    <span>{selectedSub.couponCode}</span>
                    {#if copiedCodeId === selectedSub.id}
                      <Check class="w-3 h-3 text-emerald-500" />
                    {:else}
                      <Copy class="w-3 h-3 text-slate-400" />
                    {/if}
                  </button>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Next Renewal & Payment Card Specs -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 mt-4 space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Next Renewal:</span>
              <span class="font-bold text-slate-900 dark:text-white">
                {formatDate(selectedSub.nextDate)} ({dueLabel(selectedSub.nextDate)})
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Billed To Card:</span>
              <span class="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <CreditCard class="w-3.5 h-3.5" />
                {pmMap.get(selectedSub.paymentId)?.nickname || 'Unassigned'}
              </span>
            </div>

            {#if selectedSub.notes}
              <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px]">
                <b>Notes:</b> {selectedSub.notes}
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onclick={() => advanceSubscriptionDate(selectedSub.id)}
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Check class="w-4 h-4" />
              <span>Mark Paid</span>
            </button>

            <button
              type="button"
              onclick={() => toggleSubscriptionPause(selectedSub.id)}
              class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={selectedSub.status === 'paused' ? 'Resume Subscription' : 'Pause Subscription'}
            >
              {#if selectedSub.status === 'paused'}
                <Play class="w-4 h-4" />
              {:else}
                <Pause class="w-4 h-4" />
              {/if}
            </button>

            <button
              type="button"
              onclick={() => onEditSub(selectedSub)}
              class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Subscription"
            >
              <Edit3 class="w-4 h-4" />
            </button>

            <button
              type="button"
              onclick={() => onRequestDeleteSub(selectedSub)}
              class="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Subscription"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {:else}
        <div class="py-16 text-center text-xs text-slate-400">
          No subscription selected. Click any plan on the left.
        </div>
      {/if}
    </div>
  </div>
</div>
