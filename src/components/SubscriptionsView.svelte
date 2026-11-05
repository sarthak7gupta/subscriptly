<script lang="ts">
  import {
    subscriptions,
    paymentMethods,
    currency,
    searchQuery,
    filterCategory,
    filterStatus,
    advanceSubscriptionDate,
    toggleSubscriptionPause,
    triggerCSVExport
  } from '../lib/store';
  import {
    formatMoney,
    formatDate,
    dueLabel,
    effectivePrice,
    effectiveMonthlyPrice,
    CADENCE_LABELS,
    daysUntil
  } from '../lib/calculations';
  import { CATEGORIES, type Subscription, type Category, type SubscriptionStatus } from '../lib/types';
  import {
    Search,
    Filter,
    ArrowUpDown,
    Table as TableIcon,
    LayoutGrid,
    Check,
    Pause,
    Play,
    Edit3,
    Trash2,
    Plus,
    Download,
    CreditCard,
    AlertCircle
  } from 'lucide-svelte';

  export let onOpenAdd: () => void;
  export let onEditSub: (sub: Subscription) => void;
  export let onRequestDeleteSub: (sub: Subscription) => void;

  let viewMode: 'table' | 'cards' = 'table';
  let sortBy: 'date' | 'price' | 'regular' | 'name' = 'date';
  let selectedPaymentId = '';

  const pmMap = new Map();
  $: {
    pmMap.clear();
    $paymentMethods.forEach(p => pmMap.set(p.id, p.nickname));
  }

  $: filtered = $subscriptions.filter(s => {
    const q = $searchQuery.toLowerCase().trim();
    if (q) {
      const pmName = pmMap.get(s.paymentId) || '';
      const text = `${s.name} ${s.category} ${s.notes || ''} ${pmName}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if ($filterCategory && s.category !== $filterCategory) return false;
    if ($filterStatus && s.status !== $filterStatus) return false;
    if (selectedPaymentId && s.paymentId !== selectedPaymentId) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return (a.nextDate || '9999').localeCompare(b.nextDate || '9999');
    }
    if (sortBy === 'price') {
      return effectiveMonthlyPrice(b) - effectiveMonthlyPrice(a);
    }
    if (sortBy === 'regular') {
      return (b.regularPrice || 0) - (a.regularPrice || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  $: filteredMonthlyTotal = filtered
    .filter(s => s.status !== 'cancelled' && s.status !== 'paused')
    .reduce((sum, s) => sum + effectiveMonthlyPrice(s), 0);
</script>

<div class="space-y-5">
  <!-- Page Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Subscriptions
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Manage your complete recurring billing inventory. No surprise renewals.
      </p>
    </div>
    <div class="flex items-center gap-2.5">
      <button
        type="button"
        onclick={triggerCSVExport}
        class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Export CSV</span>
      </button>
      <button
        type="button"
        onclick={onOpenAdd}
        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Subscription</span>
      </button>
    </div>
  </div>

  <!-- Filter & Control Toolbar -->
  <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by name, notes, or payment..."
          bind:value={$searchQuery}
          class="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium pl-10 pr-4 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Category Filter -->
        <select
          bind:value={$filterCategory}
          class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 focus:outline-none focus:border-indigo-500 cursor-pointer"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {#each CATEGORIES as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>

        <!-- Payment Method Filter -->
        <select
          bind:value={selectedPaymentId}
          class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 focus:outline-none focus:border-indigo-500 cursor-pointer"
          aria-label="Filter by payment method"
        >
          <option value="">All Payment Methods</option>
          {#each $paymentMethods as pm}
            <option value={pm.id}>{pm.nickname}</option>
          {/each}
        </select>

        <!-- Sort Selector -->
        <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200/70 dark:border-slate-700/70">
          <ArrowUpDown class="w-3.5 h-3.5 text-slate-400" />
          <select
            bind:value={sortBy}
            class="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            aria-label="Sort subscriptions"
          >
            <option value="date">Due Date</option>
            <option value="price">Monthly Cost</option>
            <option value="regular">Regular Price</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onclick={() => viewMode = 'table'}
            class="p-1.5 rounded-lg text-xs {viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-600'}"
            title="Table View"
            aria-label="Table view"
          >
            <TableIcon class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onclick={() => viewMode = 'cards'}
            class="p-1.5 rounded-lg text-xs {viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-600'}"
            title="Grid Cards View"
            aria-label="Grid view"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
      {#each [
        { id: '', label: 'All Plans', count: $subscriptions.length },
        { id: 'active', label: 'Active', count: $subscriptions.filter(s => s.status === 'active').length },
        { id: 'trial', label: 'Free Trials', count: $subscriptions.filter(s => s.status === 'trial').length },
        { id: 'paused', label: 'Paused', count: $subscriptions.filter(s => s.status === 'paused').length },
        { id: 'cancelled', label: 'Cancelled', count: $subscriptions.filter(s => s.status === 'cancelled').length }
      ] as tab}
        <button
          type="button"
          onclick={() => $filterStatus = tab.id}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {$filterStatus === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
        >
          {tab.label} ({tab.count})
        </button>
      {/each}
    </div>
  </div>

  <!-- Summary Bar -->
  <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
    <div>
      Showing <b class="text-slate-900 dark:text-white">{filtered.length}</b> subscriptions
    </div>
    <div>
      Filtered monthly commitment: <b class="font-mono text-slate-900 dark:text-white">{formatMoney(filteredMonthlyTotal, $currency)}</b>
    </div>
  </div>

  <!-- Table View -->
  {#if viewMode === 'table'}
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-subtle overflow-hidden">
      {#if filtered.length === 0}
        <div class="py-16 text-center">
          <AlertCircle class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">No subscriptions found</h3>
          <p class="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th class="py-3 px-4">Service</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Cost / Cadence</th>
                <th class="py-3 px-4">Payment Method</th>
                <th class="py-3 px-4">Next Renewal</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/70">
              {#each filtered as sub}
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <!-- Service Name + Initial -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                        style="background-color: {sub.color || '#6366f1'}"
                      >
                        {sub.initials || sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{sub.name}</span>
                          {#if sub.offerType !== 'none'}
                            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              DEAL
                            </span>
                          {/if}
                        </div>
                        {#if sub.notes}
                          <div class="text-[10px] text-slate-400 truncate max-w-xs">{sub.notes}</div>
                        {/if}
                      </div>
                    </div>
                  </td>

                  <!-- Category -->
                  <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                      {sub.category}
                    </span>
                  </td>

                  <!-- Cost / Cadence -->
                  <td class="py-3.5 px-4">
                    <div class="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {formatMoney(effectivePrice(sub), sub.currency)}
                      <span class="text-[11px] font-normal text-slate-400">/{CADENCE_LABELS[sub.cadence].toLowerCase()}</span>
                    </div>
                    {#if sub.regularPrice > effectivePrice(sub)}
                      <div class="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Regular: {formatMoney(sub.regularPrice, sub.currency)}
                      </div>
                    {/if}
                  </td>

                  <!-- Payment Method -->
                  <td class="py-3.5 px-4">
                    {#if sub.paymentId && pmMap.has(sub.paymentId)}
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200/50 dark:border-indigo-800/50">
                        <CreditCard class="w-3 h-3" />
                        <span>{pmMap.get(sub.paymentId)}</span>
                      </span>
                    {:else}
                      <span class="text-[11px] text-slate-400 italic">Unassigned</span>
                    {/if}
                  </td>

                  <!-- Next Renewal -->
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(sub.nextDate)}
                    </div>
                    <div class="text-[10px] {daysUntil(sub.nextDate) <= 3 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}">
                      {dueLabel(sub.nextDate)}
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4">
                    {#if sub.status === 'active'}
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        ACTIVE
                      </span>
                    {:else if sub.status === 'trial'}
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        FREE TRIAL
                      </span>
                    {:else if sub.status === 'paused'}
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        PAUSED
                      </span>
                    {:else}
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        CANCELLED
                      </span>
                    {/if}
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right">
                    <div class="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onclick={() => advanceSubscriptionDate(sub.id)}
                        class="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Mark as paid (advance renewal date)"
                      >
                        <Check class="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onclick={() => toggleSubscriptionPause(sub.id)}
                        class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={sub.status === 'paused' ? 'Resume subscription' : 'Pause subscription'}
                      >
                        {#if sub.status === 'paused'}
                          <Play class="w-3.5 h-3.5" />
                        {:else}
                          <Pause class="w-3.5 h-3.5" />
                        {/if}
                      </button>
                      <button
                        type="button"
                        onclick={() => onEditSub(sub)}
                        class="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit subscription"
                      >
                        <Edit3 class="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onclick={() => onRequestDeleteSub(sub)}
                        class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete subscription"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Grid Cards View -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filtered as sub}
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <div>
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                  style="background-color: {sub.color || '#6366f1'}"
                >
                  {sub.initials || sub.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white leading-tight">{sub.name}</h3>
                  <span class="text-[10px] text-slate-400">{sub.category}</span>
                </div>
              </div>
              <div>
                {#if sub.status === 'active'}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    ACTIVE
                  </span>
                {:else if sub.status === 'trial'}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    TRIAL
                  </span>
                {:else if sub.status === 'paused'}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    PAUSED
                  </span>
                {:else}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    CANCELLED
                  </span>
                {/if}
              </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Current Cost:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">
                  {formatMoney(effectivePrice(sub), sub.currency)} <span class="font-normal text-[10px] text-slate-400">/{CADENCE_LABELS[sub.cadence].toLowerCase()}</span>
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Next Renewal:</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(sub.nextDate)} ({dueLabel(sub.nextDate)})
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Paid Via:</span>
                <span class="font-medium text-slate-700 dark:text-slate-300">
                  {pmMap.get(sub.paymentId) || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onclick={() => advanceSubscriptionDate(sub.id)}
              class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Mark Paid</span>
            </button>
            <div class="flex items-center gap-1">
              <button
                type="button"
                onclick={() => onEditSub(sub)}
                class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onclick={() => onRequestDeleteSub(sub)}
                class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
