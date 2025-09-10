<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import CharacterInteraction from './CharacterInteraction.svelte';
  import Collection from './Collection.svelte';
  import DeckEditor from './DeckEditor.svelte';
  import DeckSelectionModal from './DeckSelectionModal.svelte';
  import Decks from './Decks.svelte';
  import Inventory from './Inventory.svelte';
  import Menu from './Menu.svelte';
  import Place from './Place.svelte';
  import Player from './Player.svelte';
  import Schedule from './Schedule.svelte';
  import Trade from './Trade.svelte';
</script>

<div class="sim-container">
  {#if uiState.currentView !== UiView.DeckEditor}
    <Menu />
  {/if}

  <div class="current-view">
    {#if uiState.currentView === UiView.CurrentPlace}
      <Place place={gs.places[gs.player.place]} />
    {:else if uiState.currentView === UiView.Collection}
      <Collection />
    {:else if uiState.currentView === UiView.Decks}
      <Decks />
    {:else if uiState.currentView === UiView.Inventory}
      <Inventory />
    {:else if uiState.currentView === UiView.Schedule}
      <Schedule />
    {:else if uiState.currentView === UiView.Player}
      <Player />
    {:else if uiState.currentView === UiView.DeckEditor}
      <DeckEditor />
    {:else if uiState.currentView === UiView.Chat}
      <CharacterInteraction />
    {:else if uiState.currentView === UiView.Trade}
      <Trade />
    {/if}
  </div>

  <!-- Deck Selection Modal -->
  <DeckSelectionModal />
</div>

<style>
  .sim-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    color: white;
    display: flex;
    flex-direction: column;
  }

  .current-view {
    flex: 1 1 auto;
    position: relative;
    width: 100%;
    z-index: 1;
    min-height: 0;
    overflow: hidden;
  }
</style>
