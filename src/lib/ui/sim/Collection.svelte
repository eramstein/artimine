<script lang="ts">
  import { cards, lands } from '@/data/loader';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import {
    addCardToDeck,
    addLandToDeck,
    removeCardFromDeck,
    removeLandFromDeck,
  } from '@/lib/sim/decks';
  import CardCompact from '../cards/CardCompact.svelte';
  import CardFull from '../cards/CardFull.svelte';
  import CollectionFilters from './CollectionFilters.svelte';

  const collection = $derived(gs.player.collection);

  // Filter state
  let filters = $state({
    cardType: undefined as string | undefined,
    colorCombination: undefined as string | undefined,
    manaCost: undefined as string | undefined,
  });

  // View toggle state
  let showFullCardView = $state(true);

  // Dropdown menu state
  let showDropdown = $state(false);

  // Get all card templates for filtering
  let allCardTemplates = $derived(() => {
    const templates = new Map();
    collection.forEach((entry) => {
      const template = cards[entry.cardTemplateId] || lands[entry.cardTemplateId];
      if (template) {
        templates.set(entry.cardTemplateId, template);
      }
    });
    return templates;
  });

  // Get available filter options

  const remainingCards = $derived.by(() => {
    const editedKey = uiState.collection.editedDeckKey;
    if (!editedKey) {
      return collection.map((entry) => ({
        cardTemplateId: entry.cardTemplateId,
        count: entry.count,
        totalInCollection: entry.count,
        usedInDeck: 0,
      }));
    }

    const deck = gs.player.decks.find((d) => d.key === editedKey);
    if (!deck) {
      return collection.map((entry) => ({
        cardTemplateId: entry.cardTemplateId,
        count: entry.count,
        totalInCollection: entry.count,
        usedInDeck: 0,
      }));
    }

    return collection.map((entry) => {
      const deckCard = deck.cards.find((card) => card.cardTemplateId === entry.cardTemplateId);
      const usedInDeck = deckCard ? deckCard.count : 0;
      const remaining = Math.max(0, entry.count - usedInDeck);

      return {
        cardTemplateId: entry.cardTemplateId,
        count: remaining,
        totalInCollection: entry.count,
        usedInDeck: usedInDeck,
      };
    });
  });

  // Apply filters to remaining cards
  const displayCards = $derived(() => {
    let filtered = remainingCards;
    const templates = allCardTemplates();

    if (filters.cardType) {
      filtered = filtered.filter((entry) => {
        const template = templates.get(entry.cardTemplateId);
        return template && template.type === filters.cardType;
      });
    }

    if (filters.colorCombination !== undefined) {
      filtered = filtered.filter((entry) => {
        const template = templates.get(entry.cardTemplateId);
        if (!template) return false;

        if (filters.colorCombination === '') {
          // Colorless filter
          return !template.colors || template.colors.length === 0;
        } else {
          // Colored filter
          const cardColors =
            template.colors
              ?.map((c: any) => c.color)
              .sort()
              .join('-') || '';
          return cardColors === filters.colorCombination;
        }
      });
    }

    if (filters.manaCost !== undefined) {
      filtered = filtered.filter((entry) => {
        const template = templates.get(entry.cardTemplateId);
        if (!template || template.cost === undefined) return false;

        if (filters.manaCost === '+') {
          // Filter for cards with cost 10 or higher
          return template.cost >= 10;
        } else {
          // Filter for specific mana cost
          const targetCost = parseInt(filters.manaCost!);
          return template.cost === targetCost;
        }
      });
    }

    // Sort by mana cost ascending
    filtered = filtered.sort((a, b) => {
      const templateA = templates.get(a.cardTemplateId);
      const templateB = templates.get(b.cardTemplateId);

      const costA = templateA?.cost ?? 0;
      const costB = templateB?.cost ?? 0;

      return costA - costB;
    });

    return filtered;
  });

  function backgroundStyle(cardTemplateId: string): string {
    const url = getCardImagePath(cardTemplateId);
    return `background-image: url('${url}');`;
  }

  function handleTileClick(cardTemplateId: string) {
    const editedKey = uiState.collection.editedDeckKey;
    if (!editedKey) return;

    // Find the card in remainingCards to check if we have any available
    const remainingCard = remainingCards.find((card) => card.cardTemplateId === cardTemplateId);
    if (!remainingCard || remainingCard.count <= 0) return;

    const deck = gs.player.decks.find((d) => d.key === editedKey);
    if (!deck) return;
    const template = getCardTemplate(cardTemplateId);
    if (template && template.type === 'land') {
      addLandToDeck(deck, cardTemplateId);
    } else {
      addCardToDeck(deck, cardTemplateId);
    }
  }

  function getCardTemplate(cardTemplateId: string) {
    return cards[cardTemplateId] || lands[cardTemplateId];
  }

  function removeFromDeck(event: MouseEvent, cardTemplateId: string) {
    event.preventDefault();
    // If we're in deck edition mode, remove the card from the deck
    const editedKey = uiState.collection.editedDeckKey;
    if (editedKey) {
      const deck = gs.player.decks.find((d) => d.key === editedKey);
      if (deck) {
        const template = getCardTemplate(cardTemplateId);
        if (template && template.type === 'land') {
          removeLandFromDeck(deck, cardTemplateId);
        } else {
          removeCardFromDeck(deck, cardTemplateId);
        }
      }
      return;
    }
  }

  function displayCardFull(event: MouseEvent, cardTemplateId: string) {
    const cardTemplate = getCardTemplate(cardTemplateId);
    if (cardTemplate) {
      uiState.cardFullOverlay.visible = true;
      uiState.cardFullOverlay.card = cardTemplate;
    }
  }

  function handleFiltersChange(newFilters: {
    cardType: string | undefined;
    colorCombination: string | undefined;
    manaCost: string | undefined;
  }) {
    filters = newFilters;
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  function toggleView() {
    showFullCardView = !showFullCardView;
    closeDropdown();
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.settings-button-container')) {
      closeDropdown();
    }
  }

  // Add click outside listener when dropdown is open
  $effect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<!-- Filters Section with Settings -->
<div class="filters-container">
  <div class="settings-button-container">
    <button class="settings-button" onclick={toggleDropdown} title="Settings">
      <div class="dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- Dropdown Menu -->
    {#if showDropdown}
      <div class="dropdown-menu" onclick={(e) => e.stopPropagation()}>
        <button class="dropdown-item" onclick={toggleView}>
          {showFullCardView ? 'Show as Grid' : 'Show Full Cards'}
        </button>
      </div>
    {/if}
  </div>

  <CollectionFilters {allCardTemplates} {filters} onFiltersChange={handleFiltersChange} />
</div>

<div class="collection-grid" class:full-card-view={showFullCardView}>
  {#each displayCards() as entry (entry.cardTemplateId)}
    {@const cardTemplate = getCardTemplate(entry.cardTemplateId)}
    {#if showFullCardView}
      <!-- CardCompact view -->
      <div
        class="card-compact-wrapper"
        onclick={() => handleTileClick(entry.cardTemplateId)}
        oncontextmenu={(e: MouseEvent) => removeFromDeck(e, entry.cardTemplateId)}
      >
        <div class="count-squares">
          {#each Array(entry.totalInCollection) as _, index}
            <div class="count-square" class:used={index >= entry.count}></div>
          {/each}
        </div>
        {#if cardTemplate}
          <CardCompact card={cardTemplate} />
        {/if}
      </div>
    {:else}
      <!-- Image tile view -->
      <div class="card-tile-container">
        <div class="count-squares">
          {#each Array(entry.totalInCollection) as _, index}
            <div class="count-square" class:used={index >= entry.count}></div>
          {/each}
        </div>
        <div
          class="card-tile"
          style={backgroundStyle(entry.cardTemplateId)}
          title={entry.cardTemplateId}
          onclick={() => handleTileClick(entry.cardTemplateId)}
          oncontextmenu={(e: MouseEvent) => {
            e.preventDefault();
            displayCardFull(e, entry.cardTemplateId);
          }}
        ></div>
      </div>
    {/if}
  {/each}
  {#if displayCards().length === 0}
    <div class="empty">
      {remainingCards.length === 0
        ? 'No cards in collection.'
        : 'No cards match the current filters.'}
    </div>
  {/if}
</div>

<!-- CardFull overlay -->
{#if uiState.cardFullOverlay.visible && uiState.cardFullOverlay.card}
  <div class="card-full-overlay" onclick={() => (uiState.cardFullOverlay.visible = false)}>
    <div class="card-full-container" onclick={(e) => e.stopPropagation()}>
      <CardFull card={uiState.cardFullOverlay.card} />
    </div>
  </div>
{/if}

<style>
  .filters-container {
    display: flex;
    gap: 10px;
    margin: 15px;
    margin-bottom: 15px;
  }

  .settings-button-container {
    position: relative;
  }

  .settings-button {
    width: 32px;
    height: 32px;
    border: 2px solid #bfa14a;
    background: #2a2a2a;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .settings-button:hover {
    background: #3a3a3a;
  }

  .dots {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dots span {
    width: 3px;
    height: 3px;
    background: #bfa14a;
    border-radius: 50%;
  }

  .dropdown-menu {
    position: absolute;
    top: 35px;
    left: 0;
    background: #2a2a2a;
    border: 2px solid #bfa14a;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    min-width: 150px;
    margin-top: 4px;
  }

  .dropdown-item {
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    color: #bfa14a;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
  }

  .dropdown-item:hover {
    background: #3a3a3a;
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 10px;
    width: calc(100% - 30px);
    padding: 0 15px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .collection-grid.full-card-view {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .card-tile-container {
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
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  .card-compact-wrapper {
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    background: #bfa14a;
    border-radius: 1px;
    border: 1px solid transparent;
  }

  .count-square.used {
    background: transparent;
    border: 1px solid #bfa14a;
  }

  .empty {
    grid-column: 1 / -1;
    text-align: center;
    color: #aaa;
    padding: 20px 0;
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
