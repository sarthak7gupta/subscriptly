<script lang="ts">
  import {
    activeTab,
    searchQuery,
    currency,
    theme,
    triggerCSVExport,
    type NavTab
  } from '../lib/store';
  import { CURRENCY_SYMBOLS } from '../lib/calculations';
  import type { Currency } from '../lib/types';
  import {
    Search,
    Download,
    Plus,
    Sun,
    Moon,
    Laptop,
    Globe
  } from 'lucide-svelte';

  export let onOpenAdd: () => void;

  const tabTitles: Record<NavTab, string> = {
    overview: 'Overview',
    subscriptions: 'Subscriptions',
    calendar: 'Renewal Calendar',
    payments: 'Payment Methods',
    offers: 'Deals & Coupons',
    insights: 'Spending Insights',
    settings: 'Settings & Data'
  };

  const currencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'];

  function toggleTheme() {
    theme.update(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  }

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery.set(target.value);
    if ($activeTab !== 'subscriptions') {
      activeTab.set('subscriptions');
    }
  }
</script>

<header class="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm">
    <span class="text-slate-400 font-medium">Workspace</span>
    <span class="text-slate-300 dark:text-slate-700">/</span>
    <span class="text-slate-900 dark:text-white font-semibold">{tabTitles[$activeTab]}</span>
  </div>

  <!-- Search & Quick Actions -->
  <div class="flex items-center gap-3">
    <!-- Quick Search -->
    <div class="relative w-64 md:w-80">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Quick search subscriptions..."
        value={$searchQuery}
        oninput={handleSearchInput}
        class="w-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs font-medium pl-9 pr-12 py-2 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
      />
      <kbd class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400">
        /
      </kbd>
    </div>

    <!-- Currency Picker Quick Pill -->
    <div class="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200/50 dark:border-slate-700/50">
      <Globe class="w-3.5 h-3.5 text-slate-400 mr-1.5" />
      <select
        value={$currency}
        onchange={(e) => currency.set((e.target as HTMLSelectElement).value as Currency)}
        class="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
        aria-label="Currency"
      >
        {#each currencies as c}
          <option value={c} class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {c} ({CURRENCY_SYMBOLS[c]})
          </option>
        {/each}
      </select>
    </div>

    <!-- Theme Toggle -->
    <button
      type="button"
      onclick={toggleTheme}
      class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      title="Toggle Dark / Light theme"
      aria-label="Toggle theme"
    >
      {#if $theme === 'dark'}
        <Sun class="w-4 h-4 text-amber-400" />
      {:else}
        <Moon class="w-4 h-4 text-slate-600" />
      {/if}
    </button>

    <!-- Quick CSV Export -->
    <button
      type="button"
      onclick={triggerCSVExport}
      class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      title="Export Subscriptions as CSV"
      aria-label="Export CSV"
    >
      <Download class="w-4 h-4" />
    </button>

    <!-- Add Subscription Button -->
    <button
      type="button"
      onclick={onOpenAdd}
      class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>New Plan</span>
    </button>
  </div>
</header>
