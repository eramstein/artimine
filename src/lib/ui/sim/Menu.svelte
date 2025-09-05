<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import TimeDisplay from './TimeDisplay.svelte';
</script>

<div class="menu-overlay">
  <TimeDisplay />
  <div class="controls">
    <button
      class="tab-button"
      class:active={uiState.currentView === UiView.CurrentPlace}
      onclick={() => (uiState.currentView = UiView.CurrentPlace)}
    >
      Place
    </button>
    <button
      class="tab-button"
      class:active={uiState.currentView === UiView.Collection}
      onclick={() => (uiState.currentView = UiView.Collection)}
    >
      Collection
    </button>
    <button
      class="tab-button"
      class:active={uiState.currentView === UiView.Decks}
      onclick={() => (uiState.currentView = UiView.Decks)}
    >
      Decks
    </button>
  </div>
</div>

<style>
  .menu-overlay {
    position: relative;
    width: 100%;
    height: 60px;
    min-height: 60px;
    background: rgba(0, 0, 0, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 5;
  }

  .controls {
    display: flex;
    gap: 0;
    padding: 0 16px;
  }

  .tab-button {
    background: rgba(0, 0, 0, 0.7);
    color: rgba(255, 255, 255, 0.7);
    border: none;
    padding: 12px 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .tab-button:hover {
    background: rgba(0, 0, 0, 0.85);
    color: rgba(255, 255, 255, 0.9);
  }

  .tab-button.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
</style>
