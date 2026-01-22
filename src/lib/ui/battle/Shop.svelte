<script lang="ts">
  import { bs } from '@/lib/_state';
  import type { Card } from '@lib/_model/model-battle';
  import { uiState } from '@lib/_state/state-ui.svelte';
  import { getHumanPlayer } from '@lib/battle/player';
  import { buyShopCard } from '@lib/battle/shop';
  import CardComponent from './Card.svelte';

  function handleClose() {
    uiState.modal.visible = false;
  }

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
  <button class="close-button" onclick={handleClose}>×</button>
  
  <div class="shop-content">
    <!-- Merchant Section -->
    <div class="section merchant-section">
      <h2 class="section-title">Merchant</h2>
      <div class="cards-grid">
        {#each sortedShopCards as { shopCard, card }}
          <div class="shop-card-wrapper" onclick={() => handleCardClick(shopCard)}>
            <CardComponent {card} inHand={false} />
            <div class="card-cost">
              <div class="cost-value">{shopCard.cost}</div>
            </div>
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
    padding: 2rem;
    color: white;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #333;
    color: white;
    border: 2px solid var(--color-golden);
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 1001;
  }

  .close-button:hover {
    background: #555;
    transform: scale(1.1);
  }

  .shop-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-top: 1rem;
  }

  .section {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 1.5rem;
    border: 2px solid rgba(191, 161, 74, 0.3);
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
  }

  .shop-card-wrapper:hover {
    transform: translateY(-4px);
  }

  .card-cost {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: url('/assets/images/gold-contour.png') center/contain no-repeat;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
  }

  .cost-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.8),
      0 0 1px rgba(255, 255, 255, 0.5);
  }

  .placeholder {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    padding: 2rem;
  }
</style>
