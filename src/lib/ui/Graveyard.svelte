<script lang="ts">
  import type { Player } from '../_model';
  import Card from './Card.svelte';

  let { player }: { player: Player } = $props();

  // Show tooltip on hover
  let isHovered = $state(false);

  // Get the top card from graveyard (last card in the array)
  let topCard = $derived(
    player.graveyard.length > 0 ? player.graveyard[player.graveyard.length - 1] : null
  );
</script>

<div
  class="graveyard-container"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  {#if topCard}
    <!-- Show the top card from graveyard -->
    <div class="graveyard-card">
      <Card card={topCard} />
    </div>
  {:else}
    <!-- Show empty dotted placeholder -->
    <div class="empty-graveyard">
      <div class="dotted-border">
        <div class="placeholder-text">Graveyard</div>
      </div>
    </div>
  {/if}

  {#if isHovered}
    <div class="tooltip">
      {player.graveyard.length} cards in graveyard
    </div>
  {/if}
</div>

<style>
  .graveyard-container {
    position: relative;
    display: inline-block;
  }

  .graveyard-card {
    width: 120px;
    height: 180px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .graveyard-card:hover {
    opacity: 1;
  }

  .empty-graveyard {
    width: 120px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dotted-border {
    width: 100%;
    height: 100%;
    border: 2px dashed #666;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease;
  }

  .dotted-border:hover {
    border-color: #999;
    background-color: rgba(0, 0, 0, 0.2);
  }

  .placeholder-text {
    color: #666;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
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
