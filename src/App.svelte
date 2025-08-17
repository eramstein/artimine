<script lang="ts">
  import Main from './lib/ui/Main.svelte';
  import CardBuilder from './tools/generator/card-builder-ui/CardBuilder.svelte';
  import Navigation from './lib/ui/Navigation.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { handleKeybinds } from './lib/ui/_keybinds/keybinds';
  import { loadGameStateFromLocalStorage, bs, uiState } from './lib/_state';
  import { UiView } from './lib/_model';
  import { initBattle } from './lib/battle/init';
  import Analytics from './tools/analytics/Analytics.svelte';

  let isLoading = $state(true);

  onMount(async () => {
    window.addEventListener('keydown', handleKeybinds);

    try {
      // Load saved game state if it exists
      await loadGameStateFromLocalStorage();

      // if a battle is in progress, display it
      if (bs.turn > 0) {
        uiState.currentView = UiView.Battle;
      } else {
        // for now we only have battle, so init one
        await initBattle();
        uiState.currentView = UiView.Battle;
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
    } finally {
      isLoading = false;
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeybinds);
  });
</script>

{#if isLoading}
  <div class="loading-screen">
    <div class="loading-spinner"></div>
    <p>Loading game data...</p>
  </div>
{:else}
  {#key uiState.currentView}
    {#if uiState.currentView === UiView.Battle}
      <Main />
    {:else if uiState.currentView === UiView.CardBuilder}
      <CardBuilder />
    {:else if uiState.currentView === UiView.Analytics}
      <Analytics />
    {/if}
  {/key}

  {#if uiState.navigationVisible}
    <Navigation />
  {/if}

  <!-- Navigation hint -->
  <div class="nav-hint">
    Press <kbd>ESC</kbd> to switch views
  </div>
{/if}

<style>
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #1a1a1a;
    color: white;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #333;
    border-top: 3px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .nav-hint {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .nav-hint kbd {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 11px;
  }
</style>
