<script lang="ts">
  import type { Card } from '../_model/model-battle';
  import { CARD_WIDTH, CARD_HEIGHT } from '../_config/ui-config';
  import { CardColor, CardType } from '../_model/enums';
  import { isPayable } from '../battle/cost';
  import Keywords from './Keywords.svelte';

  let { card, displayKeywords = true }: { card: Card; displayKeywords?: boolean } = $props();

  // Create the background image path using the card id
  let cardImagePath = $derived(`/src/assets/images/cards/${card.id}.png`);

  // Check if card is a unit card (works with Card type)
  function isUnitCard(
    card: Card
  ): card is Card & { power: number; maxHealth: number; keywords?: any } {
    return card.type === CardType.Unit;
  }

  // Determine border color based on whether the card is payable
  function getBorderColor() {
    return isPayable(card) ? 'var(--color-golden)' : '#666'; // Gold if affordable, gray if not
  }

  // Get color style for each color using CSS variables
  function getColorStyle(color: CardColor) {
    const colorMap = {
      [CardColor.Red]: 'var(--color-red)',
      [CardColor.Blue]: 'var(--color-blue)',
      [CardColor.Green]: 'var(--color-green)',
      [CardColor.Black]: 'var(--color-black)',
    };
    return colorMap[color] || 'var(--color-golden)';
  }

  // Drag event handlers
  function handleDragStart(event: DragEvent) {
    if (!isUnitCard(card) || !isPayable(card)) {
      event.preventDefault();
      return;
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(card));
    }
  }

  function handleDrag(event: DragEvent) {
    // Add visual feedback during drag
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }
</script>

<div
  class="card"
  style="--card-width: {CARD_WIDTH}px; --card-height: {CARD_HEIGHT +
    40}px; border-color: {getBorderColor()};"
  draggable={isUnitCard(card) && isPayable(card)}
  ondragstart={handleDragStart}
  ondrag={handleDrag}
>
  <!-- Card name bar with integrated cost -->
  <div class="name">
    <div class="cost">
      {card.cost}
    </div>
    <span class="name-text">{card.name}</span>
  </div>

  <!-- Content area with card image background -->
  <div class="content" style="background-image: url('{cardImagePath}');">
    <!-- Color indicators at the top -->
    <div class="colors">
      {#each card.colors as colorInfo}
        <div
          class="color-indicator"
          style="background-color: {getColorStyle(colorInfo.color)};"
          title="{colorInfo.color} ({colorInfo.count})"
        >
          {#if colorInfo.count > 1}
            <span class="color-count">{colorInfo.count}</span>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Bottom row: stats on left, keywords on right -->
    <div class="bottom-row">
      <!-- Stats display - only for Unit cards -->
      {#if isUnitCard(card)}
        <div class="stats">
          <div class="power">
            {card.power}
          </div>
          <div class="health">
            {card.maxHealth}
          </div>
        </div>
      {/if}

      <!-- Keywords display - only for Unit cards with keywords -->
      {#if isUnitCard(card) && card.keywords && displayKeywords}
        <div class="keywords-container">
          <Keywords keywords={card.keywords} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid #bfa14a;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    --left-margin: 12px;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .content {
    flex: 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px var(--left-margin);
    overflow: hidden;
    border-radius: 0 0 10px 10px;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }

  .card:active {
    transform: scale(0.95);
  }

  .name {
    background: #000;
    color: white;
    padding: 8px 12px;
    font-weight: bold;
    height: 24px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    border-radius: 10px 10px 0 0;
  }

  .cost {
    background: radial-gradient(ellipse at 60% 40%, #444 60%, #222 100%);
    color: white;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    padding: 2px 4px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 1px 2px #000;
    flex-shrink: 0;
    top: 8px;
    left: var(--left-margin);
  }

  .colors {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .color-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: #000;
    color: white;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    font-size: 0.6rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .name-text {
    flex: 1;
    padding-left: 8px;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .power,
  .health {
    background: #000;
    color: white;
    padding: 2px 4px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px #000;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .power {
    background: #000;
  }

  .health {
    background: #8b0000;
  }

  .keywords-container {
    /* Keywords will be positioned by the Keywords component */
  }
</style>
