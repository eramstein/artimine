<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { onDestroy } from 'svelte';
  import { uiState } from '../../_state/state-ui.svelte';

  let popEl = $state<HTMLElement | null>(null);

  function position() {
    const anchor = uiState.confirmPopover.anchorEl;
    if (!anchor || !popEl) return;
    computePosition(anchor, popEl as HTMLElement, {
      placement: 'top',
      middleware: [offset(10), flip(), shift({ padding: 8 })],
      strategy: 'fixed',
    }).then(({ x, y }) => {
      if (!popEl) return;
      popEl.style.left = `${x}px`;
      popEl.style.top = `${y}px`;
    });
  }

  $effect(() => {
    if (uiState.confirmPopover.visible) {
      queueMicrotask(position);
    }
  });

  function confirm() {
    uiState.confirmPopover.onConfirm?.();
    uiState.confirmPopover.visible = false;
  }
  function cancel() {
    uiState.confirmPopover.onCancel?.();
    uiState.confirmPopover.visible = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!uiState.confirmPopover.visible) return;
    if (e.key === 'Escape') {
      uiState.confirmPopover.visible = false;
    }
  }

  function onGlobalPointerDown(e: MouseEvent) {
    if (!uiState.confirmPopover.visible) return;
    const target = e.target as Node | null;
    const anchor = uiState.confirmPopover.anchorEl;
    if (!target) return;
    // If click is inside the popover or the anchor element, ignore
    if ((popEl && popEl.contains(target)) || (anchor && anchor.contains(target as Node))) {
      return;
    }
    // Otherwise cancel/close
    cancel();
  }

  window.addEventListener('keydown', onKeydown);
  window.addEventListener('mousedown', onGlobalPointerDown, true);
  onDestroy(() => {
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('mousedown', onGlobalPointerDown, true);
  });
</script>

{#if uiState.confirmPopover.visible}
  <div class="confirm-popover" bind:this={popEl}>
    <div class="title">{uiState.confirmPopover.title}</div>
    <div class="body">{@html uiState.confirmPopover.body}</div>
    <div class="actions">
      <button class="cancel" onclick={cancel}>Cancel</button>
      <button class="confirm" onclick={confirm}>Cast</button>
    </div>
  </div>
{/if}

<style>
  .confirm-popover {
    position: fixed;
    background: rgba(15, 15, 18, 0.98);
    color: #fff;
    border: 1px solid var(--color-golden);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    padding: 12px;
    width: 280px;
    z-index: 2000;
    pointer-events: auto;
  }
  .title {
    font-weight: 700;
    color: var(--color-golden);
    margin-bottom: 8px;
  }
  .body {
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .confirm,
  .cancel {
    padding: 6px 10px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
  }
  .confirm {
    background: var(--color-golden);
    color: #23272e;
  }
  .cancel {
    background: #444;
    color: #fff;
  }
</style>
