<script lang="ts">
  import type { Player } from '../_model/model-battle';
  import Deck from './Deck.svelte';
  import Graveyard from './Graveyard.svelte';

  let { player }: { player: Player } = $props();

  // Convert player name to filename format (lowercase with underscores)
  let characterImageName = $derived(player.name.toLowerCase().replace(/\s+/g, '_'));

  // Create the image path
  let characterImagePath = $derived(`/src/assets/images/characters/${characterImageName}.png`);

  // Get available colors for the player
  let availableColors = $derived(
    Object.entries(player.colors || {}).filter(([_, count]) => count > 0)
  );
</script>

<div class="player-container">
  <div class="player">
    <div class="mana-display">
      <div class="mana-value">{player.mana}</div>
      <div class="max-mana">{player.maxMana}</div>
    </div>

    <div class="player-info" style="background-image: url('{characterImagePath}')">
      <div class="life-display">
        <span class="life-value">{player.life}</span>
      </div>
    </div>
  </div>

  {#if availableColors.length > 0}
    <div class="color-display">
      {#each availableColors as [color, count]}
        <div class="color-item" data-color={color}>
          <div class="color-symbol">
            <span class="color-count">{count}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="deck-section">
    <Deck {player} />
    <Graveyard {player} />
  </div>
</div>

<style>
  .player-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.5rem;
  }

  .player {
    padding: 0.5rem;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 200px;
    height: 200px;
    position: relative;
  }

  .mana-display {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: radial-gradient(ellipse at 60% 40%, #444 60%, #222 100%);
    color: white;
    border: 4px solid #bfa14a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    padding: 0;
    border-radius: 50%;
    font-weight: bold;
    z-index: 3;
    width: 3.2rem;
    height: 3.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .player-info {
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 6px;
    aspect-ratio: 1;
    min-height: 200px;
  }

  .player-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    z-index: 1;
  }

  .life-display {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: #8b0000;
    color: white;
    padding: 0.5rem;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.1rem;
    z-index: 2;
    min-width: 2rem;
    text-align: center;
  }

  .mana-value {
    font-size: 2rem;
    color: white;
    line-height: 1;
    font-weight: 900;
    text-shadow:
      0 2px 6px #000,
      0 0 2px #fff;
    margin-bottom: 0.1rem;
  }

  .max-mana {
    color: #2da8e8;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    margin-top: 0;
    text-shadow: 0 1px 2px #000;
  }

  .life-value {
    color: white;
  }

  .color-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    width: 200px;
  }

  .color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .color-symbol {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 2px solid #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .color-item[data-color='red'] .color-symbol {
    background-color: var(--color-red);
  }

  .color-item[data-color='blue'] .color-symbol {
    background-color: var(--color-blue);
  }

  .color-item[data-color='green'] .color-symbol {
    background-color: var(--color-green);
  }

  .color-item[data-color='black'] .color-symbol {
    background-color: var(--color-black);
  }

  .color-count {
    font-size: 0.75rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  .deck-section {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
</style>
