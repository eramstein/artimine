<script lang="ts">
  import { BASE_DECK, TEST_DECK, TEST_DECK_2 } from '@/data/base-deck';
  import type { Deck } from '@/lib/_model';
  import { UiView } from '@/lib/_model';
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { initOngoingBattle } from '@/lib/sim/ongoing-battle';

  // Get player's decks
  const testDecks = [TEST_DECK, TEST_DECK_2];
  let playerDecks = $derived([BASE_DECK, ...testDecks, ...gs.player.decks]);
  let foeDecks = $derived(
    uiState.deckSelectionModal.foeKey
      ? [...gs.characters[uiState.deckSelectionModal.foeKey].decks, ...testDecks]
      : testDecks
  );

  // Local selections
  let selectedPlayerDeck: Deck | null = $state(null);
  let selectedFoeDeck: Deck | null = $state(null);
  let showFoeSelection: boolean = $state(false);

  // Get the first card from a deck to display its image
  function getFirstCardImage(deck: Deck): string {
    if (deck.cards && deck.cards.length > 0) {
      return getCardImagePath(deck.cards[0].cardTemplateId);
    }
    // Fallback to card back if no cards
    return '/assets/images/card_back.jpg';
  }

  function startBattle() {
    if (!uiState.deckSelectionModal.foeKey) return;
    const foe = gs.characters[uiState.deckSelectionModal.foeKey];
    if (showFoeSelection) {
      if (!selectedPlayerDeck || !selectedFoeDeck) return;
      initOngoingBattle(foe, selectedPlayerDeck, selectedFoeDeck);
    } else {
      if (!selectedPlayerDeck) return;
      initOngoingBattle(foe, selectedPlayerDeck);
    }
    uiState.currentView = UiView.Battle;
    closeModal();
  }

  function handleDeckSelect(deck: Deck) {
    selectedPlayerDeck = deck;
    if (!showFoeSelection) {
      startBattle();
    } else if (selectedFoeDeck) {
      startBattle();
    }
  }

  function handleFoeDeckSelect(deck: Deck) {
    selectedFoeDeck = deck;
    if (selectedPlayerDeck) startBattle();
  }

  function closeModal() {
    uiState.deckSelectionModal.visible = false;
    uiState.deckSelectionModal.foeKey = null;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

{#if uiState.deckSelectionModal.visible}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-body">
        {#if playerDecks.length === 0}
          <div class="empty-decks">
            <p>You don't have any decks yet!</p>
            <p>Create a deck in the collection to start playing.</p>
          </div>
        {:else}
          <div>
            <div class="section-header">
              <h3>Select Your Deck</h3>
              {#if !showFoeSelection}
                <button class="request-btn" onclick={() => (showFoeSelection = true)}>
                  request playtesting
                </button>
              {/if}
            </div>
            <div class="decks-grid">
              {#each playerDecks as deck (deck.key)}
                <div
                  class="deck-card"
                  class:selected={selectedPlayerDeck && selectedPlayerDeck.key === deck.key}
                  onclick={() => handleDeckSelect(deck)}
                >
                  <div class="deck-image">
                    <img src={getFirstCardImage(deck)} alt="Deck preview" />
                  </div>
                  <div class="deck-name">{deck.name}</div>
                  <div class="deck-info">
                    {deck.cards.reduce((total, card) => total + card.count, 0)} cards
                  </div>
                  <div class="deck-record">
                    <span class="wl">{deck.record.wins}–{deck.record.losses}</span>
                    {#if deck.record.wins + deck.record.losses > 0}
                      <span class="winrate"
                        >{Math.round(
                          (deck.record.wins / (deck.record.wins + deck.record.losses)) * 100
                        )}% win rate</span
                      >
                    {/if}
                  </div>
                </div>
              {/each}
            </div>

            {#if showFoeSelection}
              <h3>Opponent Deck</h3>
              <div class="decks-grid">
                {#each foeDecks as deck (deck.key)}
                  <div
                    class="deck-card"
                    class:selected={selectedFoeDeck && selectedFoeDeck.key === deck.key}
                    onclick={() => handleFoeDeckSelect(deck)}
                  >
                    <div class="deck-image">
                      <img src={getFirstCardImage(deck)} alt="Deck preview" />
                    </div>
                    <div class="deck-name">{deck.name}</div>
                    <div class="deck-info">
                      {deck.cards.reduce((total, card) => total + card.count, 0)} cards
                    </div>
                    <div class="deck-record">
                      <span class="wl">{deck.record.wins}–{deck.record.losses}</span>
                      {#if deck.record.wins + deck.record.losses > 0}
                        <span class="winrate"
                          >{Math.round(
                            (deck.record.wins / (deck.record.wins + deck.record.losses)) * 100
                          )}% win rate</span
                        >
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
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
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: #2a2a2a;
    border: 2px solid var(--color-golden);
    border-radius: 16px;
    padding: 0;
    color: white;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8);
    min-width: 1000px;
    max-width: 90vw;
    max-height: 85vh;
    overflow: hidden;
    position: relative;
  }

  .modal-body {
    padding: 0.5rem 2rem 2rem 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .empty-decks {
    text-align: center;
    padding: 2rem;
    color: #ccc;
  }

  .empty-decks p {
    margin: 0.5rem 0;
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .deck-card {
    background: #333;
    border: 2px solid #444;
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .deck-card:hover {
    border-color: #666;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .deck-card.selected {
    border-color: var(--color-golden);
    box-shadow:
      0 0 0 2px rgba(212, 175, 55, 0.5),
      0 6px 12px rgba(0, 0, 0, 0.5);
  }

  .deck-image {
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
    background: #444;
  }

  .deck-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .deck-name {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #e0e0e0;
    word-wrap: break-word;
  }

  .deck-info {
    display: flex;
    justify-content: center;
    font-size: 0.9rem;
    color: #888;
  }

  .deck-record {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: #aaa;
  }

  .deck-record .wl {
    font-weight: bold;
    color: #e0e0e0;
  }

  .deck-record .winrate {
    color: #9aa27a;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .request-btn {
    background: var(--color-golden);
    color: #1b1b1b;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-weight: 600;
  }
</style>
