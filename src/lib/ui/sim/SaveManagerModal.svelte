<script lang="ts">
  import { uiState } from '@/lib/_state';
  import SaveManager from './SaveManager.svelte';

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      uiState.saveManagerModal.visible = false;
    }
  }
</script>

{#if uiState.saveManagerModal.visible}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>Save / Load Game</h2>
        <button class="close" onclick={() => (uiState.saveManagerModal.visible = false)}
          >Close</button
        >
      </div>
      <div class="modal-body">
        <SaveManager />
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
  }
  .modal-content {
    background: rgba(20, 20, 20, 0.95);
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.8),
      0 10px 20px rgba(0, 0, 0, 0.6);
    max-width: 640px;
    width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    color: #fff;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
  }
  .modal-header h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.2em;
    font-weight: 600;
  }
  .close {
    padding: 6px 12px;
    background: #444;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
  }
  .close:hover {
    background: #666;
  }
  .modal-body {
    padding: 12px 16px;
    overflow-y: auto;
    max-height: calc(90vh - 64px);
  }
</style>
