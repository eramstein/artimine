<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';

  // Get the first card from a deck to display its image
  function getFirstCardImage(deck: any): string {
    if (deck.cards && deck.cards.length > 0) {
      return getCardImagePath(deck.cards[0].cardTemplateId);
    }
    // Fallback to card back if no cards
    return '/assets/images/card_back.jpg';
  }

  // Handle edit deck - navigate to deck editor
  function handleEditDeck(deck: any): void {
    uiState.currentView = UiView.DeckEditor;
    uiState.collection.editedDeckKey = deck.key;
  }
</script>

<div class="decks-container">
  <h2 class="decks-title">My Decks</h2>

  {#if gs.decks.length === 0}
    <div class="no-decks">
      <p>No decks created yet.</p>
      <p>Create your first deck to get started!</p>
    </div>
  {:else}
    <div class="decks-grid">
      {#each gs.decks as deck}
        <div class="deck-box" onclick={() => handleEditDeck(deck)}>
          <div class="deck-image">
            <img src={getFirstCardImage(deck)} alt="Deck preview" />
          </div>
          <div class="deck-name">{deck.name}</div>
          <div class="deck-count">
            {deck.cards.reduce((total, card) => total + card.count, 0)} cards
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .decks-container {
    padding: 2rem;
    background: #1a1a1a;
    color: white;
    min-height: 100%;
  }

  .decks-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 2rem;
    text-align: center;
    color: #e0e0e0;
  }

  .no-decks {
    text-align: center;
    padding: 4rem 2rem;
    color: #888;
  }

  .no-decks p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .deck-box {
    background: #2a2a2a;
    border: 2px solid #444;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .deck-box:hover {
    border-color: #666;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .deck-box:active {
    transform: translateY(0);
  }

  .deck-image {
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
    background: #333;
  }

  .deck-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .deck-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #e0e0e0;
    word-wrap: break-word;
  }

  .deck-count {
    font-size: 0.9rem;
    color: #888;
  }

  @media (max-width: 768px) {
    .decks-container {
      padding: 1rem;
    }

    .decks-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .decks-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }
</style>
