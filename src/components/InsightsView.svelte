<script lang="ts">
  import {
    subscriptions,
    paymentMethods,
    currency,
    totalMonthlySpend,
    totalAnnualSpend,
    categoryBreakdown,
    smartSuggestions
  } from '../lib/store';
  import {
    formatMoney,
    effectiveMonthlyPrice,
    CADENCE_LABELS
  } from '../lib/calculations';
  import {
    PieChart,
    TrendingUp,
    CreditCard,
    Sparkles,
    Calendar,
    ArrowDownRight,
    Zap,
    AlertCircle,
    Info,
    CheckCircle2
  } from 'lucide-svelte';

  const pmMap = new Map();
  $: {
    pmMap.clear();
    $paymentMethods.forEach(p => pmMap.set(p.id, p.nickname));
  }

  // Spend by payment method
  $: spendByPayment = $paymentMethods.map(pm => {
    const linked = $subscriptions.filter(s => s.paymentId === pm.id && s.status !== 'cancelled' && s.status !== 'paused');
    const amount = linked.reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);
    const percent = $totalMonthlySpend > 0 ? Math.round((amount / $totalMonthlySpend) * 100) : 0;
    return {
      pm,
      amount,
      percent,
      count: linked.length
    };
  }).filter(item => item.count > 0).sort((a, b) => b.amount - a.amount);

  // Spend by Cadence
  $: spendByCadence = ['monthly', 'yearly', 'quarterly', 'halfyearly', 'weekly', 'custom'].map(cadence => {
    const subs = $subscriptions.filter(s => s.cadence === cadence && s.status !== 'cancelled' && s.status !== 'paused');
    const amount = subs.reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);
    const percent = $totalMonthlySpend > 0 ? Math.round((amount / $totalMonthlySpend) * 100) : 0;
    return {
      cadence,
      label: CADENCE_LABELS[cadence as keyof typeof CADENCE_LABELS] || cadence,
      amount,
      percent,
      count: subs.length
    };
  }).filter(item => item.count > 0).sort((a, b) => b.amount - a.amount);

  // Annual billing potential savings estimation (annual plans usually save ~15%)
  $: monthlyOnlySpend = $subscriptions
    .filter(s => s.cadence === 'monthly' && s.status === 'active')
    .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);

  $: potentialAnnualDiscountSavings = Math.round(monthlyOnlySpend * 12 * 0.15);

  // Unused / Trial conversion protection savings
  $: trialFutureCost = $subscriptions
    .filter(s => s.status === 'trial')
    .reduce((sum, s) => sum + (s.regularPrice || 0) * 12, 0);
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      Spending Insights & Analytics
    </h1>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
      Visual breakdown of where your recurring budget flows and opportunities to optimize.
    </p>
  </div>

  <!-- Big Projection Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>Monthly Burn Rate</span>
        <TrendingUp class="w-4 h-4 text-indigo-500" />
      </div>
      <div class="mt-3 text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
        {formatMoney($totalMonthlySpend, $currency)}
      </div>
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Estimated net expense across all active subscriptions every 30 days.
      </p>
    </div>

    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>Annual Commitment</span>
        <Calendar class="w-4 h-4 text-slate-400" />
      </div>
      <div class="mt-3 text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
        {formatMoney($totalAnnualSpend, $currency)}
      </div>
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Total 12-month projected financial commitment if all plans renew normally.
      </p>
    </div>
  </div>

  <!-- Optimization & Savings Opportunities -->
  <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white shadow-card border border-indigo-500/30">
    <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
      <Zap class="w-4 h-4" />
      <span>Optimization & Savings Opportunities</span>
    </div>
    <h2 class="text-lg font-bold text-white">Save up to {formatMoney(potentialAnnualDiscountSavings + trialFutureCost, $currency)} annually</h2>
    <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
      Smart ways to cut costs without losing services: switch eligible monthly plans to annual discounts and review expiring free trials.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
      <div class="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <div class="text-xs font-semibold text-emerald-300">Annual Billing Switch</div>
        <div class="text-xl font-bold font-mono text-white mt-1">~{formatMoney(potentialAnnualDiscountSavings, $currency)}/yr</div>
        <p class="text-[11px] text-slate-300 mt-1">
          Estimated 15% discount if you convert eligible monthly subscriptions to annual upfront billing.
        </p>
      </div>

      <div class="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
        <div class="text-xs font-semibold text-amber-300">Free Trial Conversions</div>
        <div class="text-xl font-bold font-mono text-white mt-1">{formatMoney(trialFutureCost, $currency)}/yr</div>
        <p class="text-[11px] text-slate-300 mt-1">
          Amount you will be billed if current trial subscriptions convert to full regular pricing.
        </p>
      </div>
    </div>
  </div>

  <!-- Actionable Intelligence & Suggestions -->
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-indigo-500" />
          <span>Quick Opportunities & Actionable Alerts</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Proactive review items: trial conversion warnings, duplicate detection, and unassigned cards.
        </p>
      </div>
      <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
        {$smartSuggestions.length} found
      </span>
    </div>

    {#if $smartSuggestions.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each $smartSuggestions as item}
          <div class="p-4 rounded-xl border {item.severity === 'warning' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'} flex items-start gap-3">
            <div class="mt-0.5">
              {#if item.severity === 'warning'}
                <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              {:else}
                <Info class="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-center">
        <CheckCircle2 class="w-6 h-6 text-emerald-500 mx-auto mb-2" />
        <div class="text-xs font-bold text-slate-900 dark:text-white">You're fully optimized</div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">No immediate trial conversions, duplicates, or unassigned payment cards detected.</p>
      </div>
    {/if}
  </div>

  <!-- Category & Payment Distribution Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Spend by Category -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Spend by Category</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Monthly budget allocation</p>
        </div>
      </div>

      <div class="space-y-4">
        {#each $categoryBreakdown as cat}
          <div>
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.name} ({cat.count} plans)</span>
              </span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">
                {formatMoney(cat.amount, $currency)} <span class="text-slate-400 font-normal">({cat.percent}%)</span>
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                style="width: {cat.percent}%; background-color: {cat.color};"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Spend by Payment Method -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Spend by Payment Method</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Recurring burden per card/wallet</p>
        </div>
      </div>

      <div class="space-y-4">
        {#each spendByPayment as item}
          <div>
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CreditCard class="w-3.5 h-3.5 text-indigo-500" />
                <span>{item.pm.nickname} ({item.count} plans)</span>
              </span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">
                {formatMoney(item.amount, $currency)} <span class="text-slate-400 font-normal">({item.percent}%)</span>
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style="width: {item.percent}%;"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
