<script lang="ts">
  import { cards, lands } from '@/data';
  import { config } from '@/lib/_config';
  import { TournamentFormat } from '@/lib/_model/enums-sim';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { addCardToDeck, addLandToDeck } from '@/lib/sim/decks';
  import { startTournamentPairings } from '@/lib/sim/tournament';
  import CardCompact from '../cards/CardCompact.svelte';
  import DeckList from '../sim/decks/DeckList.svelte';

  let tournament = $derived(gs.activity.tournament);
  let draftState = $derived(tournament?.draftState);
  let draftedCardIds = $derived(draftState ? draftState.draftedCards[gs.player.key] || [] : []);

  // Initialize or fetch the player's draft deck
  let draftDeckKey = TournamentFormat.Draft;
  let draftDeck = $derived(gs.player.decks.find((d) => d.key === draftDeckKey));
  let totalCardsInDeck = $derived(draftDeck?.cards.reduce((sum, c) => sum + c.count, 0) || 0);
  let canFinish = $derived(totalCardsInDeck >= config.draftDeckMinCards);

  // Ensure the deck exists
  $effect(() => {
    if (tournament && !draftDeck) {
      gs.player.decks.push({
        key: draftDeckKey,
        name: 'Draft Deck',
        cards: [],
        lands: ['mountain', 'forest', 'island', 'city'],
        record: { wins: 0, losses: 0, cardResults: {} },
      });
      uiState.collection.editedDeckKey = draftDeckKey;
    } else if (draftDeck && uiState.collection.editedDeckKey !== draftDeckKey) {
      uiState.collection.editedDeckKey = draftDeckKey;
    }
  });

  // Calculate remaining drafted cards to show in the "collection" pane
  let remainingCards = $derived.by(() => {
    if (!draftDeck) return [];

    // Count occurrences in drafted pool
    const counts: Record<string, number> = {};
    for (const id of draftedCardIds) {
      counts[id] = (counts[id] || 0) + 1;
    }

    // specific lands are infinite in draft
    const basicLandsIds = ['mountain', 'forest', 'island', 'city'];

    const result = [];
    for (const [id, total] of Object.entries(counts)) {
      const usedInDeck = draftDeck.cards.find((c) => c.cardTemplateId === id)?.count || 0;
      const remaining = Math.max(0, total - usedInDeck);
      if (remaining > 0) {
        result.push({ id, count: remaining });
      }
    }

    // Add infinite basic lands
    for (const landId of basicLandsIds) {
      result.push({ id: landId, count: 99 });
    }

    return result;
  });

  function handleAddCard(cardId: string) {
    if (!draftDeck) return;
    const template = cards[cardId] || lands[cardId];
    if (template && template.type === 'land') {
      addLandToDeck(draftDeck, cardId);
    } else {
      addCardToDeck(draftDeck, cardId);
    }
  }

  function finishDeckBuilding() {
    if (tournament) {
      startTournamentPairings(tournament);
      // clear edited deck
      uiState.collection.editedDeckKey = null;
    }
  }
</script>

<div class="draft-deck-editor">
  <div class="header">
    <h2>Build your Draft Deck</h2>
    <p>Include at least {config.draftDeckMinCards} cards total to start matches ({totalCardsInDeck}/{config.draftDeckMinCards}).</p>
    <button class="finish-button" onclick={finishDeckBuilding} disabled={!canFinish}>
      Finish & Start Matches
    </button>
  </div>
  <div class="content">
    <div class="pool-panel">
      <h3>Drafted Cards & Basic Lands</h3>
      <div class="cards-grid">
        {#each remainingCards as { id, count } (id)}
          {@const template = cards[id] || lands[id]}
          {#if template}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="card-stack" onclick={() => handleAddCard(id)}>
              <div class="count-squares">
                {#each Array(count > 10 ? 1 : count) as _}
                  <div class="count-square"></div>
                {/each}
                {#if count > 10}
                  <span class="infinite">∞</span>
                {/if}
              </div>
              <CardCompact card={template} />
            </div>
          {/if}
        {/each}
      </div>
    </div>
    <div class="deck-panel">
      {#if draftDeck}
        <DeckList deck={draftDeck} />
      {/if}
    </div>
  </div>
</div>

<style>
  .draft-deck-editor {
    display: flex;
    flex-direction: column;
    height: 70vh;
    color: white;
    width: 100%;
    box-sizing: border-box;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .header h2 {
    margin: 0;
    color: var(--color-golden, #bfa14a);
  }
  .header p {
    color: #aaa;
    margin: 0 20px;
  }
  .finish-button {
    padding: 10px 20px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .finish-button:hover:not(:disabled) {
    background: #45a049;
  }
  .finish-button:disabled {
    background: #444;
    color: #888;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .content {
    display: flex;
    gap: 20px;
    flex: 1;
    overflow: hidden;
  }
  .pool-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    background: #2a2a2a;
    border-radius: 8px;
    padding: 15px;
    overflow-y: auto;
  }
  .pool-panel h3 {
    margin-top: 0;
    color: #e0e0e0;
    text-align: center;
  }
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    justify-items: center;
    overflow-x: hidden;
    padding-right: 10px;
  }
  .card-stack {
    cursor: pointer;
    transition: transform 0.2s;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-stack:hover {
    transform: translateY(-5px);
  }
  .deck-panel {
    flex: 1;
    min-width: 300px;
    background: #2a2a2a;
    border-radius: 8px;
    overflow-y: auto;
  }
  .count-squares {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    margin-bottom: 5px;
    height: 10px;
  }
  .count-square {
    width: 6px;
    height: 6px;
    background: var(--color-golden, #bfa14a);
    border-radius: 1px;
  }
  .infinite {
    font-size: 1rem;
    color: var(--color-golden, #bfa14a);
    line-height: 1;
  }

  @media (max-width: 800px) {
    .content {
      flex-direction: column;
    }
  }
</style>
