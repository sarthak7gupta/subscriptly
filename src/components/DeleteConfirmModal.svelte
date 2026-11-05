<script lang="ts">
  import { X, AlertTriangle } from 'lucide-svelte';

  export let show: boolean = false;
  export let title: string = 'Confirm Action';
  export let message: string = 'Are you sure you want to proceed? This cannot be undone.';
  export let confirmLabel: string = 'Delete';
  export let onConfirm: () => void;
  export let onCancel: () => void;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
    <div
      class="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-float overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{message}</p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onclick={onCancel}
          class="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={onConfirm}
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}
