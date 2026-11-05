<script lang="ts">
  import {
    currency,
    defaultPayment,
    paymentMethods,
    subscriptions,
    theme,
    triggerCSVExport,
    triggerJSONBackup,
    loadDemoData,
    showToast
  } from '../lib/store';
  import { validateBackupJSON } from '../lib/storage';
  import { CURRENCY_SYMBOLS } from '../lib/calculations';
  import type { Currency } from '../lib/types';
  import {
    Settings,
    Download,
    Upload,
    RotateCcw,
    Trash2,
    Shield,
    CheckCircle2,
    Moon,
    Sun,
    Laptop,
    Globe,
    CreditCard
  } from 'lucide-svelte';

  export let onRequestClearData: () => void;

  const currencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD'];

  let fileInputRef: HTMLInputElement | null = null;
  let restoreFileError: string | null = null;
  let restoreSuccessMsg: string | null = null;

  function handleFileSelected(e: Event) {
    restoreFileError = null;
    restoreSuccessMsg = null;
    const target = e.target as HTMLInputElement;
    const file = target.files && target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const result = validateBackupJSON(content);
      if (!result.valid || !result.data) {
        restoreFileError = result.error || 'Failed to parse JSON backup file.';
        showToast(restoreFileError, 'error');
        return;
      }

      // Apply restored data
      subscriptions.set(result.data.subscriptions);
      paymentMethods.set(result.data.paymentMethods);
      if (result.data.currency) currency.set(result.data.currency);
      if (result.data.defaultPayment) defaultPayment.set(result.data.defaultPayment);

      restoreSuccessMsg = `Successfully restored ${result.data.subscriptions.length} subscriptions and ${result.data.paymentMethods.length} payment methods!`;
      showToast(restoreSuccessMsg, 'success');
      target.value = '';
    };

    reader.readAsText(file);
  }

  function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    theme.set(newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    }
  }
</script>

<div class="space-y-6 max-w-4xl">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      Settings & Workspace Data
    </h1>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
      Manage preferences, backup your offline records, and control data storage.
    </p>
  </div>

  <!-- Preferences Section -->
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-6">
    <h2 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
      Preferences
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <!-- Currency Preference -->
      <div>
        <label for="currency-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Workspace Currency
        </label>
        <div class="flex items-center gap-2">
          <Globe class="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="currency-select"
            bind:value={$currency}
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {#each currencies as c}
              <option value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
            {/each}
          </select>
        </div>
        <p class="text-[11px] text-slate-400 mt-1.5">
          Applies to all spending calculations and overview analytics.
        </p>
      </div>

      <!-- Default Payment Method -->
      <div>
        <label for="default-payment-select" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Default Payment Method
        </label>
        <div class="flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="default-payment-select"
            bind:value={$defaultPayment}
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">None selected</option>
            {#each $paymentMethods as pm}
              <option value={pm.id}>{pm.nickname} ({pm.brand})</option>
            {/each}
          </select>
        </div>
        <p class="text-[11px] text-slate-400 mt-1.5">
          Pre-selected when creating new subscriptions.
        </p>
      </div>

      <!-- Theme Switcher -->
      <div class="sm:col-span-2">
        <span class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Appearance Theme
        </span>
        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={() => handleThemeChange('light')}
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors {$theme === 'light' ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}"
          >
            <Sun class="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onclick={() => handleThemeChange('dark')}
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors {$theme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}"
          >
            <Moon class="w-4 h-4 text-indigo-500" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onclick={() => handleThemeChange('system')}
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors {$theme === 'system' ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}"
          >
            <Laptop class="w-4 h-4 text-slate-500" />
            <span>System Default</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backup & Export Section -->
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
    <h2 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
      Backup & Data Portability
    </h2>

    <p class="text-xs text-slate-500 dark:text-slate-400">
      Export your full workspace to JSON or CSV anytime. Your data belongs exclusively to you.
    </p>

    <div class="flex flex-wrap items-center gap-3 pt-2">
      <button
        type="button"
        onclick={triggerJSONBackup}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Download class="w-4 h-4" />
        <span>Download JSON Backup</span>
      </button>

      <button
        type="button"
        onclick={triggerCSVExport}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
      >
        <Download class="w-4 h-4" />
        <span>Export Subscriptions (CSV)</span>
      </button>

      <!-- Restore Trigger -->
      <button
        type="button"
        onclick={() => fileInputRef?.click()}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 text-xs font-semibold transition-colors"
      >
        <Upload class="w-4 h-4" />
        <span>Restore from JSON File</span>
      </button>

      <input
        type="file"
        accept=".json"
        bind:this={fileInputRef}
        onchange={handleFileSelected}
        class="hidden"
      />
    </div>

    {#if restoreFileError}
      <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
        <b>Restore failed:</b> {restoreFileError}
      </div>
    {/if}

    {#if restoreSuccessMsg}
      <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{restoreSuccessMsg}</span>
      </div>
    {/if}
  </div>

  <!-- Danger Zone & Reset -->
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-subtle space-y-4">
    <h2 class="text-base font-bold text-rose-600 dark:text-rose-400 pb-3 border-b border-rose-100 dark:border-rose-950">
      Workspace Reset & Danger Zone
    </h2>

    <p class="text-xs text-slate-500 dark:text-slate-400">
      Reload standard demo data or purge your browser's offline storage.
    </p>

    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onclick={loadDemoData}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
      >
        <RotateCcw class="w-4 h-4" />
        <span>Load Demo Data (8 Subscriptions)</span>
      </button>

      <button
        type="button"
        onclick={onRequestClearData}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Trash2 class="w-4 h-4" />
        <span>Purge All Workspace Data</span>
      </button>
    </div>
  </div>
</div>
