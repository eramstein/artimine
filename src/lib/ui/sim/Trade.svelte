<script lang="ts">
  import { cards, lands } from '@/data/loader';
  import { CardRarity } from '@/lib/_model/enums-battle';
  import type { CardTuple } from '@/lib/_model/model-game';
  import { UiView } from '@/lib/_model/model-ui';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { getAvailableCardsFromCollection } from '@/lib/sim/collection';
  import { proposeTrade } from '@/lib/sim/trade';
  import CharacterPortrait from './characters/CharacterPortrait.svelte';
  import Chat from './Chat.svelte';

  // Get character from game state using the tradingWith key, default to first character
  const character = $derived(() => {
    if (uiState.tradingWith && gs.characters[uiState.tradingWith]) {
      return gs.characters[uiState.tradingWith];
    }
    // Default to first character if none selected
    const characterKeys = Object.keys(gs.characters);
    return characterKeys.length > 0 ? gs.characters[characterKeys[0]] : null;
  });

  // Trade form state
  let tradeForm = $state({
    playerSelectedCards: {} as Record<string, number>,
    characterSelectedCards: {} as Record<string, number>,
  });

  // Filter state
  let rarityFilter = $state<CardRarity | 'all'>('all');

  // Get player collection (only cards not in decks)
  const playerCollection = $derived(() => getAvailableCardsFromCollection(gs.player));

  // Get character collection (only cards not in decks)
  const characterCollection = $derived(() => {
    const char = character();
    return char ? getAvailableCardsFromCollection(char) : [];
  });

  // Apply rarity filter to collections
  const filteredPlayerCollection = $derived(() => {
    if (rarityFilter === 'all') return playerCollection();
    return playerCollection().filter((entry) => {
      const cardTemplate = getCardTemplate(entry.cardTemplateId);
      return cardTemplate?.rarity === rarityFilter;
    });
  });

  const filteredCharacterCollection = $derived(() => {
    if (rarityFilter === 'all') return characterCollection();
    return characterCollection().filter((entry) => {
      const cardTemplate = getCardTemplate(entry.cardTemplateId);
      return cardTemplate?.rarity === rarityFilter;
    });
  });

  // Helper function to get card template
  function getCardTemplate(cardTemplateId: string) {
    return cards[cardTemplateId] || lands[cardTemplateId];
  }

  // Helper function to get background style for card tiles
  function backgroundStyle(cardTemplateId: string): string {
    const url = getCardImagePath(cardTemplateId);
    return `background-image: url('${url}');`;
  }

  // Helper function to get border color based on card rarity
  function getRarityBorderColor(cardTemplateId: string): string {
    const cardTemplate = getCardTemplate(cardTemplateId);
    if (!cardTemplate) return '#bfa14a'; // Default golden color

    switch (cardTemplate.rarity) {
      case CardRarity.Common:
        return '#606060'; // Gray
      case CardRarity.Uncommon:
        return '#ffffff'; // White
      case CardRarity.Rare:
        return '#4a9eff'; // Blue
      case CardRarity.Legendary:
        return '#ff8c00'; // Orange
      default:
        return '#bfa14a'; // Default golden color
    }
  }

  // Helper function to get rarity display name
  function getRarityDisplayName(rarity: CardRarity | 'all'): string {
    switch (rarity) {
      case 'all':
        return 'All';
      case CardRarity.Common:
        return 'Common';
      case CardRarity.Uncommon:
        return 'Uncommon';
      case CardRarity.Rare:
        return 'Rare';
      case CardRarity.Legendary:
        return 'Legendary';
      default:
        return 'All';
    }
  }

  // Helper function to get rarity color for filter buttons
  function getRarityColor(rarity: CardRarity | 'all'): string {
    switch (rarity) {
      case 'all':
        return '#bfa14a';
      case CardRarity.Common:
        return '#606060';
      case CardRarity.Uncommon:
        return '#ffffff';
      case CardRarity.Rare:
        return '#4a9eff';
      case CardRarity.Legendary:
        return '#ff8c00';
      default:
        return '#bfa14a';
    }
  }

  // Handle card selection for player collection
  function handlePlayerCardClick(cardTemplateId: string, availableCount: number) {
    const currentSelected = tradeForm.playerSelectedCards[cardTemplateId] || 0;
    if (availableCount > 0) {
      tradeForm.playerSelectedCards[cardTemplateId] = currentSelected + 1;
    } else {
      delete tradeForm.playerSelectedCards[cardTemplateId];
    }
  }

  // Handle card selection for character collection
  function handleCharacterCardClick(cardTemplateId: string, availableCount: number) {
    const currentSelected = tradeForm.characterSelectedCards[cardTemplateId] || 0;
    if (availableCount > 0) {
      tradeForm.characterSelectedCards[cardTemplateId] = currentSelected + 1;
    } else {
      delete tradeForm.characterSelectedCards[cardTemplateId];
    }
  }

  // Handle unselecting cards from the trade proposal section
  function handleUnselectPlayerCard(cardTemplateId: string) {
    const currentSelected = tradeForm.playerSelectedCards[cardTemplateId] || 0;
    if (currentSelected > 1) {
      tradeForm.playerSelectedCards[cardTemplateId] = currentSelected - 1;
    } else {
      delete tradeForm.playerSelectedCards[cardTemplateId];
    }
  }

  function handleUnselectCharacterCard(cardTemplateId: string) {
    const currentSelected = tradeForm.characterSelectedCards[cardTemplateId] || 0;
    if (currentSelected > 1) {
      tradeForm.characterSelectedCards[cardTemplateId] = currentSelected - 1;
    } else {
      delete tradeForm.characterSelectedCards[cardTemplateId];
    }
  }

  // Clear all selections
  function clearSelections() {
    tradeForm.playerSelectedCards = {};
    tradeForm.characterSelectedCards = {};
  }

  // Execute the trade
  function executeTrade() {
    const currentCharacter = character();
    if (!currentCharacter) return;

    const playerOffers: CardTuple[] = Object.entries(tradeForm.playerSelectedCards).map(
      ([cardTemplateId, count]) => ({
        cardTemplateId,
        count,
      })
    );

    const characterWants: CardTuple[] = Object.entries(tradeForm.characterSelectedCards).map(
      ([cardTemplateId, count]) => ({
        cardTemplateId,
        count,
      })
    );

    if (playerOffers.length === 0 || characterWants.length === 0) {
      return;
    }

    const accepted = proposeTrade(currentCharacter, playerOffers, characterWants);

    if (accepted) {
      clearSelections();
      // Show success message or handle trade completion
      console.log('Trade accepted!');
    } else {
      console.log('Trade rejected!');
    }
  }

  // Check if trade can be executed
  const canExecuteTrade = $derived(() => {
    return (
      Object.keys(tradeForm.playerSelectedCards).length > 0 &&
      Object.keys(tradeForm.characterSelectedCards).length > 0
    );
  });

  // Get selected cards as arrays for display
  const playerSelectedCardsArray = $derived(() => {
    return Object.entries(tradeForm.playerSelectedCards).map(([cardTemplateId, count]) => ({
      cardTemplateId,
      count,
      template: getCardTemplate(cardTemplateId),
    }));
  });

  const characterSelectedCardsArray = $derived(() => {
    return Object.entries(tradeForm.characterSelectedCards).map(([cardTemplateId, count]) => ({
      cardTemplateId,
      count,
      template: getCardTemplate(cardTemplateId),
    }));
  });
</script>

{#if character()}
  <div class="trade-container">
    <div class="trade-header">
      <div class="player-name">
        <h2>{gs.player.name}</h2>
      </div>
      <div class="trade-actions">
        <button class="trade-button" onclick={executeTrade} disabled={!canExecuteTrade()}>
          Propose Trade
        </button>
        <button
          class="trade-button trade-button--secondary"
          onclick={() => (uiState.currentView = UiView.Chat)}
        >
          Close
        </button>
      </div>
      <div class="character-name">
        <h2>{character()!.name}</h2>
      </div>
    </div>

    <!-- Rarity Filter -->
    <div class="rarity-filter">
      {#each ['all', CardRarity.Common, CardRarity.Uncommon, CardRarity.Rare, CardRarity.Legendary] as const as rarity}
        <button
          class="rarity-filter-button"
          class:active={rarityFilter === rarity}
          class:rarity-all={rarity === 'all'}
          class:rarity-common={rarity === CardRarity.Common}
          class:rarity-uncommon={rarity === CardRarity.Uncommon}
          class:rarity-rare={rarity === CardRarity.Rare}
          class:rarity-legendary={rarity === CardRarity.Legendary}
          onclick={() => (rarityFilter = rarity)}
          style={`border-color: ${getRarityColor(rarity)}; color: ${getRarityColor(rarity)};`}
        >
          {getRarityDisplayName(rarity)}
        </button>
      {/each}
    </div>

    <!-- Selected Cards Section -->
    {#if playerSelectedCardsArray().length > 0 || characterSelectedCardsArray().length > 0}
      <div class="selected-cards-section">
        <div class="selected-cards-content">
          <!-- Player's Offer -->
          <div class="offer-panel">
            <div class="selected-cards-grid">
              {#each playerSelectedCardsArray() as selectedCard (selectedCard.cardTemplateId)}
                <div
                  class="selected-card-item"
                  onclick={() => handleUnselectPlayerCard(selectedCard.cardTemplateId)}
                >
                  <div
                    class="selected-card-tile"
                    style={`${backgroundStyle(selectedCard.cardTemplateId)}; border-color: ${getRarityBorderColor(selectedCard.cardTemplateId)};`}
                  ></div>
                  <div class="selected-card-info">
                    <span class="card-name"
                      >{selectedCard.template?.name || selectedCard.cardTemplateId}</span
                    >
                    <span class="card-count">×{selectedCard.count}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Trade Arrow -->
          <div class="trade-arrow">
            <div class="arrow">↔</div>
          </div>

          <!-- Character's Offer -->
          <div class="offer-panel">
            <div class="selected-cards-grid">
              {#each characterSelectedCardsArray() as selectedCard (selectedCard.cardTemplateId)}
                <div
                  class="selected-card-item"
                  onclick={() => handleUnselectCharacterCard(selectedCard.cardTemplateId)}
                >
                  <div
                    class="selected-card-tile"
                    style={`${backgroundStyle(selectedCard.cardTemplateId)}; border-color: ${getRarityBorderColor(selectedCard.cardTemplateId)};`}
                  ></div>
                  <div class="selected-card-info">
                    <span class="card-name"
                      >{selectedCard.template?.name || selectedCard.cardTemplateId}</span
                    >
                    <span class="card-count">×{selectedCard.count}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="trade-content">
      <!-- Player Collection (Left Side) -->
      <div class="collection-panel">
        <div class="collection-grid">
          {#each filteredPlayerCollection() as entry (entry.cardTemplateId)}
            {@const cardTemplate = getCardTemplate(entry.cardTemplateId)}
            {@const selectedCount = tradeForm.playerSelectedCards[entry.cardTemplateId] || 0}
            {@const availableCount = entry.count - selectedCount}

            <div class="card-tile-container">
              <div class="count-squares">
                {#each Array(entry.count) as _, index}
                  <div
                    class="count-square"
                    class:selected={index < selectedCount}
                    class:available={index >= selectedCount}
                  ></div>
                {/each}
              </div>
              <div
                class="card-tile"
                class:selected={selectedCount > 0}
                class:disabled={availableCount <= 0}
                style={`${backgroundStyle(entry.cardTemplateId)}; border-color: ${getRarityBorderColor(entry.cardTemplateId)};`}
                title={cardTemplate?.name || entry.cardTemplateId}
                onclick={() => handlePlayerCardClick(entry.cardTemplateId, availableCount)}
              ></div>
            </div>
          {/each}
          {#if filteredPlayerCollection().length === 0}
            <div class="empty">No cards in your collection.</div>
          {/if}
        </div>
      </div>

      <!-- Character Collection (Right Side) -->
      <div class="collection-panel">
        <div class="collection-grid">
          {#each filteredCharacterCollection() as entry (entry.cardTemplateId)}
            {@const cardTemplate = getCardTemplate(entry.cardTemplateId)}
            {@const selectedCount = tradeForm.characterSelectedCards[entry.cardTemplateId] || 0}
            {@const availableCount = entry.count - selectedCount}

            <div class="card-tile-container">
              <div class="count-squares">
                {#each Array(entry.count) as _, index}
                  <div
                    class="count-square"
                    class:selected={index < selectedCount}
                    class:available={index >= selectedCount}
                  ></div>
                {/each}
              </div>
              <div
                class="card-tile"
                class:selected={selectedCount > 0}
                class:disabled={availableCount <= 0}
                style={`${backgroundStyle(entry.cardTemplateId)}; border-color: ${getRarityBorderColor(entry.cardTemplateId)};`}
                title={cardTemplate?.name || entry.cardTemplateId}
                onclick={() => handleCharacterCardClick(entry.cardTemplateId, availableCount)}
              ></div>
            </div>
          {/each}
          {#if filteredCharacterCollection().length === 0}
            <div class="empty">No cards in {character()!.name}'s collection.</div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Character Portrait and Chat Section -->
    <div class="character-interaction-section">
      <div class="character-portrait-container">
        <CharacterPortrait character={character()!} />
      </div>
      <div class="chat-container">
        <Chat />
      </div>
    </div>
  </div>
{:else}
  <div class="trade-container">
    <div class="no-character">
      <h2>No Character Selected</h2>
      <p>Please select a character to trade with.</p>
    </div>
  </div>
{/if}

<style>
  .trade-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1a1a;
    color: #bfa14a;
  }

  .trade-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 2px solid #bfa14a;
    background: #2a2a2a;
    gap: 20px;
  }

  .player-name {
    justify-self: start;
  }

  .character-name {
    justify-self: end;
  }

  .player-name h2,
  .character-name h2 {
    margin: 0;
    color: #bfa14a;
    font-size: 1.5rem;
  }

  .trade-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .rarity-filter {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: #2a2a2a;
    border-bottom: 1px solid #bfa14a;
  }

  .rarity-filter-button {
    padding: 6px 12px;
    border: 2px solid;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .rarity-filter-button:hover {
    background: rgba(191, 161, 74, 0.1);
  }

  .rarity-filter-button.active {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    font-weight: bold;
  }

  .trade-button {
    padding: 8px 16px;
    border: 2px solid #bfa14a;
    border-radius: 6px;
    background: #bfa14a;
    color: #1a1a1a;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .trade-button:hover:not(:disabled) {
    background: #d4b85a;
  }

  .trade-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .trade-button--secondary {
    background: transparent;
    color: #bfa14a;
    border-color: #bfa14a;
    opacity: 0.7;
  }

  .trade-button--secondary:hover {
    opacity: 1;
    background: rgba(191, 161, 74, 0.1);
  }

  .trade-content {
    display: flex;
    flex: 1;
    gap: 20px;
    padding: 20px;
    overflow: hidden;
  }

  .collection-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #2a2a2a;
    overflow: hidden;
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
    padding: 15px;
    overflow-y: auto;
    flex: 1;
    align-content: start;
  }

  .card-tile-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .card-tile {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .card-tile:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .card-tile.selected {
    border-color: #bfa14a;
    box-shadow: 0 0 10px rgba(191, 161, 74, 0.5);
  }

  .card-tile.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .count-squares {
    display: flex;
    justify-content: center;
    gap: 2px;
    flex-wrap: wrap;
  }

  .count-square {
    width: 6px;
    height: 6px;
    border-radius: 1px;
    border: 1px solid #bfa14a;
  }

  .count-square.available {
    background: #bfa14a;
  }

  .count-square.selected {
    background: #ff6b6b;
    border-color: #ff6b6b;
  }

  .empty {
    grid-column: 1 / -1;
    text-align: center;
    color: #aaa;
    padding: 40px 0;
    font-style: italic;
  }

  .no-character {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: #bfa14a;
  }

  .no-character h2 {
    margin: 0 0 10px 0;
    font-size: 1.5rem;
  }

  .no-character p {
    margin: 0;
    color: #aaa;
    font-style: italic;
  }

  .selected-cards-section {
    background: #2a2a2a;
    border-radius: 8px;
    margin: 20px;
    overflow: hidden;
  }

  .selected-cards-content {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 20px;
  }

  .offer-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .selected-cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .selected-card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 70px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selected-card-item:hover {
    transform: scale(1.05);
  }

  .selected-card-tile {
    width: 60px;
    height: 60px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    border: 2px solid #bfa14a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    position: relative;
  }

  .selected-card-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .card-name {
    font-size: 12px;
    color: #bfa14a;
    text-align: center;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-count {
    font-size: 10px;
    color: #ff6b6b;
    font-weight: bold;
  }

  .trade-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
  }

  .arrow {
    font-size: 2rem;
    color: #bfa14a;
    font-weight: bold;
  }

  /* Character Interaction Section */
  .character-interaction-section {
    display: flex;
    gap: 20px;
    padding: 20px;
    border-top: 2px solid #333;
    background: rgba(0, 0, 0, 0.3);
    margin-top: 20px;
  }

  .character-portrait-container {
    flex-shrink: 0;
    width: 300px;
    height: 300px;
  }

  .chat-container {
    flex: 1;
    min-height: 200px;
    max-height: 300px;
    overflow: hidden;
  }
</style>
