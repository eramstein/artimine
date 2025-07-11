<script lang="ts">
  import type { CardTemplate } from '../_model/model-battle';
  import { CARD_WIDTH, CARD_HEIGHT } from '../_config/ui-config';
  import { CardColor } from '../_model/enums';
  import { isUnitCard } from '../_model/model-battle';

  let { card, playerMana }: { card: CardTemplate; playerMana?: number } = $props();

  // Create the background image path using the card id
  let cardImagePath = $derived(`/src/assets/images/cards/${card.id}.png`);

  // Determine border color based on mana availability
  function getBorderColor() {
    if (playerMana === undefined) return '#bfa14a'; // Default golden color
    return playerMana >= card.cost ? '#005825' : '#e74c3c'; // Green if affordable, red if not
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
</script>

<div
  class="card"
  style="--card-width: {CARD_WIDTH}px; --card-height: {CARD_HEIGHT +
    40}px; border-color: {getBorderColor()};"
>
  <!-- Background image container -->
  <div class="card-image" style="background-image: url('{cardImagePath}');"></div>

  <!-- Card name bar with integrated cost -->
  <div class="name">
    <div class="cost">
      {card.cost}
    </div>
    <!-- Color indicators -->
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
    <span class="name-text">{card.name}</span>
  </div>

  <!-- Stats display in bottom-left corner - only for Unit cards -->
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
</div>

<style>
  .card {
    position: relative;
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid #bfa14a;
    overflow: hidden;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .card-image {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }

  .name {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: #000;
    color: white;
    padding: 8px 12px;
    font-weight: bold;
    height: 24px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
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
  }

  .colors {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
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
    text-align: left;
  }

  .stats {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
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
</style>
