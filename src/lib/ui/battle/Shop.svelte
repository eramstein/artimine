<script lang="ts">
  import { bs } from '@/lib/_state';
  import type { Card } from '@lib/_model/model-battle';
  import { getHumanPlayer } from '@lib/battle/player';
  import { buyShopCard } from '@lib/battle/shop';
  import CardComponent from './Card.svelte';
  import GoldCost from './GoldCost.svelte';

  const player = $derived(getHumanPlayer());

  // Sort shop cards by cost and create Card instances for display
  const sortedShopCards = $derived(
    [...bs.shop.cards]
      .sort((a, b) => a.cost - b.cost)
      .map((shopCard, index) => ({
        shopCard,
        card: {
          ...shopCard.template,
          instanceId: `shop-${shopCard.template.id}-${index}`,
          ownerPlayerId: player.id,
        } as Card,
      }))
  );

  function handleCardClick(shopCard: { cost: number; template: any }) {
    buyShopCard(player, shopCard);
  }
</script>

<div class="shop">
  <div class="shop-content">
    <!-- Merchant Section -->
    <div class="section merchant-section">
      <div class="cards-grid">
        {#each sortedShopCards as { shopCard, card }}
          <div
            class="shop-card-wrapper"
            class:too-expensive={player.gold < shopCard.cost}
            onclick={() => handleCardClick(shopCard)}
          >
            <CardComponent {card} inHand={false} />
            <GoldCost value={shopCard.cost} class="card-cost" size="md" />
          </div>
        {/each}
      </div>
    </div>

    <!-- Monk Section -->
    <div class="section monk-section">
      <h2 class="section-title">Monk</h2>
      <div class="placeholder">Coming soon...</div>
    </div>

    <!-- Witch Section -->
    <div class="section witch-section">
      <h2 class="section-title">Witch</h2>
      <div class="placeholder">Coming soon...</div>
    </div>
  </div>
</div>

<style>
  .shop {
    padding: 0rem 2rem;
    color: white;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .shop-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-top: 1rem;
  }

  .section {
    padding: 1.5rem;
  }

  .section-title {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: var(--color-golden);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .shop-card-wrapper {
    position: relative;
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }

  .shop-card-wrapper.too-expensive {
    filter: grayscale(1) brightness(0.6);
    opacity: 0.8;
  }

  .shop-card-wrapper:hover {
    transform: translateY(-4px);
  }

  :global(.card-cost) {
    position: absolute;
    bottom: -3.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
  }

  .placeholder {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    padding: 2rem;
  }
</style>
