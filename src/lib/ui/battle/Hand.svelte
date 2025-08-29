<script lang="ts">
  import { CARD_WIDTH } from '@lib/_config/ui-config';
  import type { Player } from '@lib/_model';
  import { getCardBackImagePath } from '@lib/_utils/asset-paths';
  import Card from './Card.svelte';

  let { player }: { player: Player } = $props();

  // Track previous hand size to detect new cards
  let enableAnimations = $state(false);
  let previousHandSize = $state(0);
  let newCardIds = $state<string[]>([]);

  // Effect to detect new cards when hand changes
  $effect(() => {
    if (enableAnimations && player.hand.length > previousHandSize) {
      // New card was added - find the newest card
      // For simplicity, assume the last card is new
      const newCard = player.hand[player.hand.length - 1];
      newCardIds = [...newCardIds, newCard.instanceId];
      // Remove the highlight after animation
      setTimeout(() => {
        newCardIds = newCardIds.filter((id) => id !== newCard.instanceId);
      }, 750);
    }
    enableAnimations = true;
    previousHandSize = player.hand.length;
  });

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
    <div
      class="card-wrapper"
      class:new-card={newCardIds.includes(card.instanceId)}
      style="margin-left: {index === 0 ? 0 : -calculateOverlap()}px;"
    >
      {#if player.isPlayer}
        <Card {card} />
      {:else}
        <div class="gray-card" style="background-image: url('{getCardBackImagePath()}');"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .hand {
    display: flex;
    gap: 0;
    padding: 0 8rem;
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
  }

  /* Only apply hover effects and transitions to player hands */
  .hand.player-hand .card-wrapper {
    transition: margin-left 0.2s ease;
  }

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

  /* New card highlight animation */
  .hand.player-hand .card-wrapper.new-card {
    animation: newCardHighlight 0.75s ease-in;
    z-index: 20;
    position: relative;
  }

  @keyframes newCardHighlight {
    0% {
      transform: scale(1.5) translateY(-40px);
      box-shadow: 0 0 30px rgba(191, 161, 74, 0.9);
    }
    100% {
      transform: scale(1) translateY(0);
      box-shadow: none;
    }
  }

  /* Ensure cards don't shrink too much */
  .hand :global(.card) {
    flex-shrink: 0;
  }

  .gray-card {
    width: var(--card-width, 200px);
    height: var(--card-height, 240px);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    border: 2px solid #444;
    flex-shrink: 0;
  }
</style>
