<script lang="ts">
  import { cards, lands } from '@/data/loader';
  import { isLandCard } from '@/lib/_model/type-lookup-battle';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { addCardToDeck } from '@/lib/sim/decks';
  import CardFull from '../cards/CardFull.svelte';
  import LandFull from '../cards/LandFull.svelte';
  import CollectionFilters from './CollectionFilters.svelte';

  const collection = $derived(gs.collection);

  // Filter state
  let filters = $state({
    cardType: undefined as string | undefined,
    colorCombination: undefined as string | undefined,
  });

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

    const deck = gs.decks.find((d) => d.key === editedKey);
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

    const deck = gs.decks.find((d) => d.key === editedKey);
    if (!deck) return;
    addCardToDeck(deck, cardTemplateId);
  }

  function getCardTemplate(cardTemplateId: string) {
    return cards[cardTemplateId] || lands[cardTemplateId];
  }

  function handleContextMenu(event: MouseEvent, cardTemplateId: string) {
    event.preventDefault();
    const cardTemplate = getCardTemplate(cardTemplateId);
    if (cardTemplate) {
      uiState.cardFullOverlay.visible = true;
      uiState.cardFullOverlay.card = cardTemplate;
    }
  }

  function handleFiltersChange(newFilters: {
    cardType: string | undefined;
    colorCombination: string | undefined;
  }) {
    filters = newFilters;
  }
</script>

<!-- Filters Section -->
<CollectionFilters {allCardTemplates} {filters} onFiltersChange={handleFiltersChange} />

<div class="collection-grid">
  {#each displayCards() as entry (entry.cardTemplateId)}
    <div
      class="card-tile"
      style={backgroundStyle(entry.cardTemplateId)}
      title={entry.cardTemplateId}
      onclick={() => handleTileClick(entry.cardTemplateId)}
      oncontextmenu={(e) => handleContextMenu(e, entry.cardTemplateId)}
    >
      <div class="count-badge">
        {entry.count}
      </div>
    </div>
  {/each}
  {#if displayCards().length === 0}
    <div class="empty">
      {remainingCards.length === 0
        ? 'No cards in collection.'
        : 'No cards match the current filters.'}
    </div>
  {/if}
</div>

<!-- CardFull/LandFull overlay -->
{#if uiState.cardFullOverlay.visible && uiState.cardFullOverlay.card}
  <div class="card-full-overlay" onclick={() => (uiState.cardFullOverlay.visible = false)}>
    <div class="card-full-container" onclick={(e) => e.stopPropagation()}>
      {#if isLandCard(uiState.cardFullOverlay.card)}
        <LandFull land={uiState.cardFullOverlay.card} />
      {:else}
        <CardFull card={uiState.cardFullOverlay.card} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 10px;
    width: calc(100% - 30px);
    padding: 0 15px;
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

  .count-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
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
