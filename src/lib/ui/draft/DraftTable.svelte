<script lang="ts">
  import { cards } from '@/data';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { processDraftTurn } from '@/lib/battle/draft/draft-logic';
  import CardCompact from '../cards/CardCompact.svelte';
  import CardFull from '../cards/CardFull.svelte';

  let tournament = $derived(gs.activity.tournament);
  let draftState = $derived(tournament?.draftState);
  let playerBoosterIds = $derived(draftState ? draftState.activeBoosters[gs.player.key] : []);

  function handlePick(cardId: string) {
    if (tournament) {
      processDraftTurn(tournament, cardId);
      // Wait, isDraftTurn sync or async? Sync. The state updates immediately.
    }
  }

  function displayCardFull(event: MouseEvent, card: any) {
    event.preventDefault();
    uiState.cardFullOverlay.visible = true;
    uiState.cardFullOverlay.card = card;
  }
</script>

{#if tournament && draftState}
  <div class="draft-table-container">
    <div class="draft-header">
      <h2>Draft Pack {draftState.packNumber}</h2>
      <p class="subtitle">Pick a card to add to your draft pool! Passes to the {draftState.direction === 1 ? 'left' : 'right'}.</p>
    </div>

    <div class="cards-grid">
      {#each playerBoosterIds as cardId, index (index)}
        {@const card = cards[cardId]}
        {#if card}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="card-wrapper" onclick={() => handlePick(cardId)} oncontextmenu={(e) => displayCardFull(e, card)}>
            <div class="card-container">
              <CardCompact {card} />
            </div>
          </div>
        {/if}
      {/each}
      {#if playerBoosterIds.length === 0}
        <div class="waiting-message">Waiting for other players...</div>
      {/if}
    </div>
  </div>
{/if}

<!-- CardFull overlay -->
{#if uiState.cardFullOverlay.visible && uiState.cardFullOverlay.card}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="card-full-overlay" onclick={() => (uiState.cardFullOverlay.visible = false)}>
    <div class="card-full-container" onclick={(e) => e.stopPropagation()}>
      <CardFull card={uiState.cardFullOverlay.card} />
    </div>
  </div>
{/if}

<style>
  .draft-table-container {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: var(--bg-secondary, #2a2a2a);
    border-radius: 8px;
    color: white;
  }

  .draft-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .draft-header h2 {
    color: var(--color-golden, #bfa14a);
    margin: 0;
  }

  .subtitle {
    color: #aaa;
    margin-top: 5px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    justify-items: center;
    max-height: 70vh;
    overflow-y: auto;
    padding: 10px;
  }

  .card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .card-wrapper:hover {
    transform: translateY(-5px);
  }

  .card-container {
    width: 200px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .waiting-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    font-size: 1.2rem;
    color: #aaa;
    font-style: italic;
  }

  .card-full-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    min-height: 100vh;
  }

  .card-full-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
