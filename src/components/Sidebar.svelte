<script lang="ts">
  import { activeTab, subscriptions, type NavTab } from '../lib/store';
  import {
    LayoutDashboard,
    CreditCard,
    Calendar,
    Wallet,
    Tag,
    PieChart,
    Settings,
    ShieldCheck,
    Plus
  } from 'lucide-svelte';

  export let onOpenAdd: () => void;

  const navItems: { id: NavTab; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: $subscriptions.length },
    { id: 'calendar', label: 'Renewal Calendar', icon: Calendar },
    { id: 'payments', label: 'Payment Methods', icon: Wallet },
    { id: 'offers', label: 'Deals & Coupons', icon: Tag, badge: 'SAVE' },
    { id: 'insights', label: 'Spending Insights', icon: PieChart },
    { id: 'settings', label: 'Settings & Data', icon: Settings }
  ];
</script>

<aside class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col h-screen shrink-0 sticky top-0 z-20">
  <!-- Brand Header -->
  <div class="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="/assets/icon.svg" alt="Subscriptly" class="w-9 h-9 rounded-xl shadow-md shrink-0" />
      <div>
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-slate-900 dark:text-white tracking-tight text-base">Subscript<span class="text-indigo-600 dark:text-indigo-400">ly</span></span>
          <span class="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">HQ</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Subscription Manager</p>
      </div>
    </div>
  </div>

  <!-- Primary Action -->
  <div class="p-3">
    <button
      type="button"
      onclick={onOpenAdd}
      class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
    >
      <Plus class="w-4 h-4" />
      <span>Add Subscription</span>
    </button>
  </div>

  <!-- Navigation Links -->
  <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
    <div class="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      Workspace
    </div>
    {#each navItems as item}
      <button
        type="button"
        onclick={() => activeTab.set(item.id)}
        class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors {$activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}"
      >
        <div class="flex items-center gap-2.5">
          <svelte:component this={item.icon} class="w-4 h-4 {$activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}" />
          <span>{item.label}</span>
        </div>
        {#if item.id === 'subscriptions'}
          <span class="text-xs px-2 py-0.5 rounded-full font-medium {$activeTab === item.id ? 'bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
            {$subscriptions.length}
          </span>
        {:else if item.badge}
          <span class="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/40">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </nav>

  <!-- Privacy & Status Guarantee Footer -->
  <div class="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
      <div class="flex items-center gap-2 mb-1">
        <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span class="text-xs font-semibold text-slate-900 dark:text-slate-200">100% Private</span>
      </div>
      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Offline-first by design. All data stays strictly in your browser. Zero banking credentials or logins needed.
      </p>
    </div>

    <div class="flex items-center justify-between text-xs text-slate-500 px-1">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Local Storage active</span>
      </div>
      <span class="font-mono text-[10px] text-slate-400">v2.0</span>
    </div>
  </div>
</aside>
