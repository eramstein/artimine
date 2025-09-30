<script lang="ts">
  import { UiView } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { createNewDeck } from '@/lib/sim/decks';

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

  // Handle create new deck
  function handleCreateNewDeck(): void {
    const newDeck = createNewDeck('New Deck');
    uiState.currentView = UiView.DeckEditor;
    uiState.collection.editedDeckKey = newDeck.key;
  }

  // Handle load deck from clipboard (expects JSON Deck)
  async function handleLoadDeck(): Promise<void> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        alert('Clipboard API not available. Please paste a Deck JSON into a prompt-based import.');
        return;
      }

      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Clipboard is empty. Copy a Deck JSON first.');
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        alert('Clipboard does not contain valid JSON.');
        return;
      }

      // Minimal validation and normalization
      const name =
        typeof parsed?.name === 'string' && parsed.name.trim()
          ? parsed.name.trim()
          : 'Imported Deck';
      const cardsArray = Array.isArray(parsed?.cards) ? parsed.cards : [];
      const landsArray = Array.isArray(parsed?.lands) ? parsed.lands : [];

      const normalizedCards = cardsArray
        .filter((c: any) => c && typeof c.cardTemplateId === 'string' && Number.isFinite(c.count))
        .map((c: any) => ({
          cardTemplateId: c.cardTemplateId,
          count: Math.max(1, Math.floor(c.count)),
        }));

      const normalizedLands = landsArray.filter((l: any) => typeof l === 'string');

      const newDeck = {
        key: crypto.randomUUID(),
        name,
        cards: normalizedCards,
        lands: normalizedLands,
        record: {
          wins: 0,
          losses: 0,
          cardResults: {},
        },
      };

      gs.player.decks.push(newDeck);
      uiState.currentView = UiView.DeckEditor;
      uiState.collection.editedDeckKey = newDeck.key;
    } catch (error) {
      console.error('Failed to load deck from clipboard', error);
      alert('Failed to load deck from clipboard. See console for details.');
    }
  }
</script>

<div class="decks-container">
  <h2 class="decks-title">My Decks</h2>
  <div class="decks-grid">
    {#each gs.player.decks as deck}
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

    <!-- New Deck Button -->
    <div class="deck-box new-deck-box" onclick={handleCreateNewDeck}>
      <div class="deck-image new-deck-image">
        <div class="new-deck-icon">+</div>
      </div>
      <div class="deck-name">New Deck</div>
      <div class="deck-count">Create new</div>
    </div>

    <!-- Load Deck Button -->
    <div class="deck-box new-deck-box" onclick={handleLoadDeck}>
      <div class="deck-image new-deck-image">
        <div class="new-deck-icon">⎘</div>
      </div>
      <div class="deck-name">Load Deck</div>
      <div class="deck-count">Paste from clipboard</div>
    </div>
  </div>
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

  .new-deck-box {
    border-style: dashed;
    border-color: #666;
    background: #1f1f1f;
  }

  .new-deck-box:hover {
    border-color: #888;
    background: #252525;
  }

  .new-deck-image {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #333;
  }

  .new-deck-icon {
    font-size: 3rem;
    color: #888;
    font-weight: bold;
  }

  .new-deck-box:hover .new-deck-icon {
    color: #aaa;
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
