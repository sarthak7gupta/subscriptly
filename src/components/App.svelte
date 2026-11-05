<script lang="ts">
  import {
    activeTab,
    subscriptions,
    deleteSubscription,
    deletePaymentMethod,
    clearWorkspaceData,
    showToast
  } from '../lib/store';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { daysUntil, formatMoney, effectivePrice } from '../lib/calculations';
  import type { Subscription, PaymentMethod } from '../lib/types';
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import OverviewView from './OverviewView.svelte';
  import SubscriptionsView from './SubscriptionsView.svelte';
  import CalendarView from './CalendarView.svelte';
  import PaymentsView from './PaymentsView.svelte';
  import OffersView from './OffersView.svelte';
  import InsightsView from './InsightsView.svelte';
  import SettingsView from './SettingsView.svelte';
  import SubscriptionModal from './SubscriptionModal.svelte';
  import PaymentModal from './PaymentModal.svelte';
  import DeleteConfirmModal from './DeleteConfirmModal.svelte';
  import Toast from './Toast.svelte';

  onMount(() => {
    // Proactive alert on load: warn user if any trial or renewal is ending soon
    const allSubs = get(subscriptions);
    const urgentTrial = allSubs.find(
      s => s.status === 'trial' && s.offerEnd && daysUntil(s.offerEnd) >= 0 && daysUntil(s.offerEnd) <= 7
    );

    if (urgentTrial && urgentTrial.offerEnd) {
      const days = daysUntil(urgentTrial.offerEnd);
      const timeStr = days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`;
      setTimeout(() => {
        showToast(
          `⚠️ ${urgentTrial.name} trial ends ${timeStr}. Cancel or renew to avoid surprises.`,
          'info'
        );
      }, 800);
    } else {
      const urgentRenewal = allSubs.find(
        s => s.status === 'active' && s.nextDate && daysUntil(s.nextDate) >= 0 && daysUntil(s.nextDate) <= 3
      );
      if (urgentRenewal && urgentRenewal.nextDate) {
        const days = daysUntil(urgentRenewal.nextDate);
        const timeStr = days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`;
        setTimeout(() => {
          showToast(
            `🔔 ${urgentRenewal.name} renews ${timeStr} (${formatMoney(effectivePrice(urgentRenewal), urgentRenewal.currency)}).`,
            'info'
          );
        }, 800);
      }
    }
  });

  // Modal States
  let showSubModal = false;
  let editingSub: Subscription | null = null;

  let showPaymentModal = false;
  let editingPayment: PaymentMethod | null = null;

  let showDeleteModal = false;
  let deleteModalTitle = '';
  let deleteModalMsg = '';
  let deleteModalAction: (() => void) | null = null;

  function handleOpenAddSub() {
    editingSub = null;
    showSubModal = true;
  }

  function handleEditSub(sub: Subscription) {
    editingSub = sub;
    showSubModal = true;
  }

  function handleRequestDeleteSub(sub: Subscription) {
    deleteModalTitle = `Remove ${sub.name}?`;
    deleteModalMsg = `Are you sure you want to delete "${sub.name}" from your active subscriptions list?`;
    deleteModalAction = () => {
      deleteSubscription(sub.id);
      showDeleteModal = false;
    };
    showDeleteModal = true;
  }

  function handleOpenAddPayment() {
    editingPayment = null;
    showPaymentModal = true;
  }

  function handleEditPayment(pm: PaymentMethod) {
    editingPayment = pm;
    showPaymentModal = true;
  }

  function handleRequestDeletePayment(pm: PaymentMethod) {
    deleteModalTitle = `Remove ${pm.nickname}?`;
    deleteModalMsg = `Are you sure you want to remove "${pm.nickname}"? Any subscriptions linked to this payment method will become unassigned.`;
    deleteModalAction = () => {
      deletePaymentMethod(pm.id);
      showDeleteModal = false;
    };
    showDeleteModal = true;
  }

  function handleRequestClearData() {
    deleteModalTitle = 'Purge All Workspace Data?';
    deleteModalMsg = 'This will delete all saved subscriptions, custom payment methods, and reset your workspace. Export a JSON backup first if you want to keep your data.';
    deleteModalAction = () => {
      clearWorkspaceData();
      showDeleteModal = false;
    };
    showDeleteModal = true;
  }
</script>

<div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
  <!-- Desktop / Responsive Sidebar -->
  <Sidebar onOpenAdd={handleOpenAddSub} />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <Header onOpenAdd={handleOpenAddSub} />

    <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
      {#if $activeTab === 'overview'}
        <OverviewView
          onOpenAdd={handleOpenAddSub}
          onEditSub={handleEditSub}
          onRequestDeleteSub={handleRequestDeleteSub}
        />
      {:else if $activeTab === 'subscriptions'}
        <SubscriptionsView
          onOpenAdd={handleOpenAddSub}
          onEditSub={handleEditSub}
          onRequestDeleteSub={handleRequestDeleteSub}
        />
      {:else if $activeTab === 'calendar'}
        <CalendarView
          onEditSub={handleEditSub}
        />
      {:else if $activeTab === 'payments'}
        <PaymentsView
          onOpenAddPayment={handleOpenAddPayment}
          onEditPayment={handleEditPayment}
          onRequestDeletePayment={handleRequestDeletePayment}
        />
      {:else if $activeTab === 'offers'}
        <OffersView
          onOpenAdd={handleOpenAddSub}
          onEditSub={handleEditSub}
        />
      {:else if $activeTab === 'insights'}
        <InsightsView />
      {:else if $activeTab === 'settings'}
        <SettingsView
          onRequestClearData={handleRequestClearData}
        />
      {/if}
    </main>
  </div>

  <!-- Global Modals -->
  <SubscriptionModal
    show={showSubModal}
    editingSub={editingSub}
    onClose={() => { showSubModal = false; editingSub = null; }}
  />

  <PaymentModal
    show={showPaymentModal}
    editingPayment={editingPayment}
    onClose={() => { showPaymentModal = false; editingPayment = null; }}
  />

  <DeleteConfirmModal
    show={showDeleteModal}
    title={deleteModalTitle}
    message={deleteModalMsg}
    onConfirm={() => { if (deleteModalAction) deleteModalAction(); }}
    onCancel={() => { showDeleteModal = false; deleteModalAction = null; }}
  />

  <!-- Toast Notification System -->
  <Toast />
</div>
