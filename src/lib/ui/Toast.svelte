<script lang="ts">
  import { fly } from 'svelte/transition';
  import { uiState } from '../_state/state-ui.svelte';

  let toastElement: HTMLElement;

  $: toast = uiState.toast;

  function getToastStyles(type: string) {
    const baseStyles =
      'padding: 12px 16px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4); border: 2px solid; max-width: 320px; margin: 0 auto; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;';

    const typeStyles = {
      info: 'background-color: #2a2a2a; border-color: #3498db; color: #e0e0e0;',
      success: 'background-color: #2a2a2a; border-color: #27ae60; color: #e0e0e0;',
      warning: 'background-color: #2a2a2a; border-color: #bfa14a; color: #e0e0e0;',
      error: 'background-color: #2a2a2a; border-color: #e74c3c; color: #e0e0e0;',
    };

    return baseStyles + ' ' + (typeStyles[type as keyof typeof typeStyles] || typeStyles.info);
  }

  function getIcon(type: string) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  function handleMouseOver(e: MouseEvent) {
    (e.target as HTMLElement).style.color = '#e0e0e0';
    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  }

  function handleMouseOut(e: MouseEvent) {
    (e.target as HTMLElement).style.color = '#888';
    (e.target as HTMLElement).style.backgroundColor = 'transparent';
  }
</script>

{#if toast.visible}
  <div
    bind:this={toastElement}
    style="
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
    "
    transition:fly={{ y: -50, duration: 300 }}
  >
    <div style={getToastStyles(toast.type)}>
      <span style="font-size: 18px;">{getIcon(toast.type)}</span>
      <span style="flex: 1;">{toast.message}</span>
    </div>
  </div>
{/if}
