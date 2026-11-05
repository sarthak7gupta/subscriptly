<script lang="ts">
  import { toast } from '../lib/store';
  import { CheckCircle2, AlertCircle, Info, X } from 'lucide-svelte';
</script>

{#if $toast.show}
  <aside
    aria-label="Notification"
    class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-float border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 bg-slate-900 text-white border-slate-700/80"
  >
    {#if $toast.type === 'success'}
      <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
    {:else if $toast.type === 'error'}
      <AlertCircle class="w-5 h-5 text-rose-400 shrink-0" />
    {:else}
      <Info class="w-5 h-5 text-indigo-400 shrink-0" />
    {/if}
    <p class="text-sm font-medium pr-2">{$toast.message}</p>
    <button
      type="button"
      aria-label="Close notification"
      class="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      onclick={() => toast.update(t => ({ ...t, show: false }))}
    >
      <X class="w-4 h-4" />
    </button>
  </aside>
{/if}
