<script lang="ts">
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import Shop from './Shop.svelte';

  const currentPlace = $derived(
    uiState.shopModal.placeKey
      ? gs.places.find((p) => p.key === uiState.shopModal.placeKey) || null
      : null
  );

  function closeModal() {
    uiState.shopModal.visible = false;
    uiState.shopModal.placeKey = null;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

{#if uiState.shopModal.visible && currentPlace}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Shop</h2>
        <button class="close-button" onclick={closeModal}>×</button>
      </div>

      <div class="modal-body">
        {#if currentPlace}
          <Shop place={currentPlace} />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: rgba(20, 20, 20, 0.95);
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.8),
      0 10px 20px rgba(0, 0, 0, 0.6);
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
  }

  .modal-header h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.5em;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    line-height: 1;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  .modal-body {
    padding: 0;
    overflow-y: auto;
    max-height: calc(90vh - 80px);
  }
</style>
