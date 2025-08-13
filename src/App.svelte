<script lang="ts">
  import Main from './lib/ui/Main.svelte';
  import CardBuilder from './lib/generator/ui/CardBuilder.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { handleKeybinds } from './lib/ui/_keybinds/keybinds';
  import { loadGameStateFromLocalStorage, bs, uiState } from './lib/_state';
  import { UiView } from './lib/_model';
  import { initBattle } from './lib/battle/init';

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
  <CardBuilder />
  <Main />
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
</style>
