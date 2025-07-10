<script lang="ts">
  import type { Player } from '../_model/model-battle';
  import CardTemplate from './CardTemplate.svelte';
  import { CARD_WIDTH } from '../_config/ui-config';

  let { player }: { player: Player } = $props();

  // Calculate overlap based on number of cards
  function calculateOverlap() {
    const cardWidth = CARD_WIDTH; // Use shared constant
    const availableWidth = 550 - 32; // 550px - padding (16px * 2)
    const numCards = player.hand.length;

    if (numCards <= 1) return 0;

    // Calculate how much overlap is needed
    const totalCardWidth = numCards * cardWidth;
    const overlapNeeded = totalCardWidth - availableWidth;
    return Math.max(0, overlapNeeded / (numCards - 1));
  }
</script>

<div class="hand" class:player-hand={player.isPlayer}>
  {#each player.hand as card, index (card.instanceId)}
    <div class="card-wrapper" style="margin-left: {index === 0 ? 0 : -calculateOverlap()}px;">
      {#if player.isPlayer}
        <CardTemplate {card} playerMana={player.mana} />
      {:else}
        <div class="gray-card"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .hand {
    display: flex;
    gap: 0;
    padding: 0 1rem;
    overflow: visible;
    min-height: 220px;
    align-items: center;
    justify-content: center;
    width: 550px;
  }

  .hand::-webkit-scrollbar {
    height: 8px;
  }

  .hand::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .hand::-webkit-scrollbar-thumb {
    background: #bfa14a;
    border-radius: 4px;
  }

  .hand::-webkit-scrollbar-thumb:hover {
    background: #d4b85a;
  }

  .card-wrapper {
    flex-shrink: 0;
    transition: margin-left 0.2s ease;
  }

  /* Only apply hover effects to player hands */
  .hand.player-hand .card-wrapper:hover {
    margin-left: -10px !important;
    margin-top: -10px !important;
    z-index: 10;
    transform: scale(1.05);
  }

  /* When a card is hovered, only shift the immediately adjacent card to the right */
  .hand.player-hand .card-wrapper:hover + .card-wrapper {
    margin-left: -5px !important;
  }

  /* Ensure cards don't shrink too much */
  .hand :global(.card) {
    flex-shrink: 0;
  }

  .gray-card {
    width: var(--card-width, 200px);
    height: var(--card-height, 240px);
    background-image: url('/src/assets/images/card_back.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    border: 2px solid #444;
    flex-shrink: 0;
  }
</style>
