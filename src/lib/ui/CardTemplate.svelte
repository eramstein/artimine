<script lang="ts">
  import type { CardTemplate } from '../_model/model-battle';
  import { CARD_WIDTH, CARD_HEIGHT } from '../_config/ui-config';

  let { card, playerMana }: { card: CardTemplate; playerMana?: number } = $props();

  // Create the background image path using the card id
  let cardImagePath = $derived(`/src/assets/images/cards/${card.id}.png`);

  // Determine border color based on mana availability
  function getBorderColor() {
    if (playerMana === undefined) return '#bfa14a'; // Default golden color
    return playerMana >= card.cost ? '#2ecc71' : '#e74c3c'; // Green if affordable, red if not
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
    <span class="name-text">{card.name}</span>
  </div>

  <!-- Stats display in bottom-left corner -->
  <div class="stats">
    <div class="power">
      {card.power}
    </div>
    <div class="health">
      {card.health}
    </div>
  </div>
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
    gap: 8px;
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
