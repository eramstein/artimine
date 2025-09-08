<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import TimeDisplay from './TimeDisplay.svelte';
</script>

<div class="menu-overlay">
  <div class="left-info">
    <TimeDisplay />
    <div class="separator"></div>
    <div class="activity-display">
      {gs.activity.activityType}
    </div>
  </div>
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
      class:active={uiState.currentView === UiView.Schedule}
      onclick={() => (uiState.currentView = UiView.Schedule)}
    >
      Schedule
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
    <button
      class="tab-button"
      class:active={uiState.currentView === UiView.Inventory}
      onclick={() => (uiState.currentView = UiView.Inventory)}
    >
      Inventory
    </button>
    <button
      class="tab-button"
      class:active={uiState.currentView === UiView.Player}
      onclick={() => (uiState.currentView = UiView.Player)}
    >
      Player
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

  .left-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-left: 30px;
  }

  .separator {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 8px;
  }

  .activity-display {
    display: flex;
    flex-direction: column;
    font-family: 'Arial', sans-serif;
    padding: 8px 0;
    font-size: 18px;
    font-weight: bold;
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
