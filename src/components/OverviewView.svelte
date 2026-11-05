<script lang="ts">
  import type { Subscription } from '../lib/types';
  import UnifiedCockpitLayout from './layouts/UnifiedCockpitLayout.svelte';

  export let onOpenAdd: () => void;
  export let onEditSub: (sub: Subscription) => void;
  export let onRequestDeleteSub: (sub: Subscription) => void;
</script>

<UnifiedCockpitLayout {onOpenAdd} {onEditSub} {onRequestDeleteSub} />
