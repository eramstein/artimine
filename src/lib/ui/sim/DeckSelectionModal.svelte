<script lang="ts">
  import { TEST_DECK } from '@/data/base-deck';
  import type { Deck } from '@/lib/_model';
  import { UiView } from '@/lib/_model';
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { initBattle } from '@/lib/battle';

  // Get player's decks
  let playerDecks = $derived([TEST_DECK, ...gs.player.decks]);

  // Get the first card from a deck to display its image
  function getFirstCardImage(deck: Deck): string {
    if (deck.cards && deck.cards.length > 0) {
      return getCardImagePath(deck.cards[0].cardTemplateId);
    }
    // Fallback to card back if no cards
    return '/assets/images/card_back.jpg';
  }

  function handleDeckSelect(deck: Deck) {
    if (uiState.deckSelectionModal.foeKey) {
      initBattle(uiState.deckSelectionModal.foeKey, deck);
      uiState.currentView = UiView.Battle;
      closeModal();
    }
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
      <div class="modal-header">
        <h2>Select Your Deck</h2>
        <button class="close-button" onclick={closeModal}>×</button>
      </div>

      <div class="modal-body">
        {#if playerDecks.length === 0}
          <div class="empty-decks">
            <p>You don't have any decks yet!</p>
            <p>Create a deck in the collection to start playing.</p>
          </div>
        {:else}
          <div class="decks-grid">
            {#each playerDecks as deck (deck.key)}
              <div class="deck-card" onclick={() => handleDeckSelect(deck)}>
                <div class="deck-image">
                  <img src={getFirstCardImage(deck)} alt="Deck preview" />
                </div>
                <div class="deck-name">{deck.name}</div>
                <div class="deck-info">
                  <span class="card-count"
                    >{deck.cards.reduce((total, card) => total + card.count, 0)} cards</span
                  >
                  <span class="land-count">{deck.lands.length} lands</span>
                </div>
              </div>
            {/each}
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
    min-width: 500px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    position: relative;
  }

  .modal-header {
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    margin: 0;
    color: var(--color-golden);
    font-size: 1.5rem;
    font-weight: bold;
  }

  .close-button {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-body {
    padding: 2rem;
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
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: #888;
  }

  .card-count,
  .land-count {
    display: block;
  }
</style>
