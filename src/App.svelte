<script lang="ts">
  import Main from './lib/ui/Main.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { handleKeybinds } from './lib/ui/_keybinds/keybinds';
  import { loadGameStateFromLocalStorage, bs, uiState } from './lib/_state';
  import { UiView } from './lib/_model';
  import { initBattle } from './lib/battle/init';
  import { generateCard } from './lib/generator/card-designer';

  generateCard();

  onMount(() => {
    window.addEventListener('keydown', handleKeybinds);
    // Load saved game state if it exists
    loadGameStateFromLocalStorage();
    // if a battle is in progress, display it
    if (bs.turn > 0) {
      uiState.currentView = UiView.Battle;
    } else {
      // for now we only have battle, so init one
      initBattle();
      uiState.currentView = UiView.Battle;
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeybinds);
  });
</script>

<Main />
