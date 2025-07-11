<script lang="ts">
  import type { Player } from '../_model';

  let { player }: { player: Player } = $props();

  // Number of cards to show in the stack (max 3 for visual effect)
  let stackSize = $derived(Math.min(player.deck.length, 3));

  // Show tooltip on hover
  let isHovered = $state(false);
</script>

<div
  class="deck-container"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <div class="deck-stack">
    {#each Array(stackSize) as _, index}
      <div
        class="card-back"
        style="z-index: {stackSize - index}; transform: translateY({index * 3}px);"
      >
        <img src="/src/assets/images/card_back.png" alt="Card Back" class="card-image" />
      </div>
    {/each}
  </div>

  {#if isHovered}
    <div class="tooltip">
      {player.deck.length} cards in deck
    </div>
  {/if}
</div>

<style>
  .deck-container {
    position: relative;
    display: inline-block;
  }

  .deck-stack {
    position: relative;
    width: 120px;
    height: 180px;
  }

  .card-back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.1),
      0 8px 16px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
  }

  .card-back:hover {
    transform: translateY(-8px) !important;
    box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.3),
      0 16px 32px rgba(0, 0, 0, 0.2),
      0 32px 64px rgba(0, 0, 0, 0.1);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .tooltip {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgba(0, 0, 0, 0.8);
  }
</style>
