<script lang="ts">
  import { CardRarity } from '@/lib/_model/enums-battle';
  import { ItemType } from '@/lib/_model/enums-sim';
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import { openCardPack } from '@/lib/sim/booster';
  import type { CardTemplate } from '@lib/_model/model-battle';
  import CardCompact from '../cards/CardCompact.svelte';

  let { cards }: { cards: CardTemplate[] } = $props();
  let isAnimating = $state(true);

  // Check if player has another booster in inventory
  let hasAnotherBooster = $derived(gs.player.items.some((item) => item.type === ItemType.Booster));

  // Get border color based on card rarity
  function getRarityBorderColor(rarity: CardRarity): string {
    switch (rarity) {
      case CardRarity.Common:
        return '#666666'; // Dark gray
      case CardRarity.Uncommon:
        return '#C0C0C0'; // Silver
      case CardRarity.Rare:
        return '#4A90E2'; // Blueish
      case CardRarity.Legendary:
        return '#FFD700'; // Gold
      default:
        return '#666666';
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      uiState.boosterModal.visible = false;
      uiState.boosterModal.cards = null;
    }
  }

  function handleBackToInventory() {
    uiState.boosterModal.visible = false;
    uiState.boosterModal.cards = null;
  }

  function handleOpenNext() {
    const nextBooster = gs.player.items.find((item) => item.type === ItemType.Booster);
    if (nextBooster) {
      const boosterPack = openCardPack(nextBooster);
      uiState.boosterModal.cards = boosterPack;

      // Reset animation by temporarily disabling and re-enabling
      isAnimating = false;
      setTimeout(() => {
        isAnimating = true;
      }, 10);
    }
  }
</script>

{#if uiState.boosterModal.visible && cards}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="cards-grid">
        {#each cards as card, index (index)}
          <div
            class="card-wrapper"
            class:animating={isAnimating}
            style="animation-delay: {index * 0.1}s;"
          >
            <div class="card-container">
              <div class="card-flip-container" style="animation-delay: {index * 0.1}s;">
                <div class="card-back" style="animation-delay: {index * 0.1}s;">
                  <img src="/assets/images/card_back.jpg" alt="Card Back" />
                </div>
                <div class="card-front" style="animation-delay: {index * 0.1}s;">
                  <CardCompact {card} />
                </div>
              </div>
              <div class="rarity-label" style="color: {getRarityBorderColor(card.rarity)};">
                {card.rarity.toUpperCase()}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="buttons-container">
        <button class="action-button back-button" onclick={handleBackToInventory}>
          Back to Inventory
        </button>
        {#if hasAnotherBooster}
          <button class="action-button next-button" onclick={handleOpenNext}> Open Next </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 95vw;
    max-height: 95vh;
    animation: slideIn 0.25s ease-out;
    padding-top: 20px;
    overflow: hidden;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    justify-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    max-height: calc(95vh - 120px); /* Reserve space for buttons */
    padding: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(191, 161, 74, 0.5) transparent;
  }

  .cards-grid::-webkit-scrollbar {
    width: 8px;
  }

  .cards-grid::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .cards-grid::-webkit-scrollbar-thumb {
    background: rgba(191, 161, 74, 0.5);
    border-radius: 4px;
  }

  .cards-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(191, 161, 74, 0.7);
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    contain: layout;
  }

  .card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card-flip-container {
    position: relative;
    width: 200px;
    height: 280px;
    perspective: 1000px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .rarity-label {
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .card-back,
  .card-front {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 280px;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-back {
    z-index: 2;
  }

  .card-front {
    transform: rotateY(180deg);
    z-index: 1;
  }

  .card-back img {
    width: 200px;
    height: 280px;
    object-fit: cover;
    border-radius: 8px;
  }

  .card-wrapper.animating .card-flip-container {
    animation: cardFlip 0.3s ease-out both;
  }

  .card-wrapper.animating .card-back {
    animation: cardBackFlip 0.3s ease-out both;
  }

  .card-wrapper.animating .card-front {
    animation: cardFrontFlip 0.3s ease-out both;
  }

  @keyframes cardFlip {
    0% {
      transform: translateY(10px) scale(0.8);
    }
    50% {
      transform: translateY(-2px) scale(1.02);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }

  @keyframes cardBackFlip {
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(90deg);
    }
    100% {
      transform: rotateY(180deg);
    }
  }

  @keyframes cardFrontFlip {
    0% {
      transform: rotateY(180deg);
    }
    50% {
      transform: rotateY(90deg);
    }
    100% {
      transform: rotateY(0deg);
    }
  }

  .buttons-container {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-shrink: 0;
    animation: buttonsSlideIn 0.3s ease-out 0.6s both;
  }

  @keyframes buttonsSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .action-button {
    padding: 12px 24px;
    border: 2px solid var(--color-golden, #bfa14a);
    border-radius: 8px;
    background: rgba(191, 161, 74, 0.1);
    color: var(--color-golden, #bfa14a);
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button:hover {
    background: rgba(191, 161, 74, 0.2);
    transform: translateY(-1px);
  }

  .back-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .next-button {
    background: rgba(191, 161, 74, 0.2);
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
      max-height: calc(95vh - 100px);
    }
  }

  @media (max-width: 800px) {
    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
      max-height: calc(95vh - 100px);
    }
  }

  @media (max-width: 600px) {
    .cards-grid {
      grid-template-columns: 1fr;
      max-height: calc(95vh - 100px);
    }
  }

  @media (max-width: 600px) {
    .modal-backdrop {
      padding: 10px;
    }
  }
</style>
