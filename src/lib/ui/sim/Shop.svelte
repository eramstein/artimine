<script lang="ts">
  import type { ItemDefinition, Place } from '@/lib/_model';
  import { ItemType } from '@/lib/_model/enums-sim';
  import { gs } from '@/lib/_state/main.svelte';
  import { getItemImagePath } from '@/lib/_utils/asset-paths';
  import { buyItem } from '@/lib/sim/item';

  interface Props {
    place: Place;
  }

  let { place }: Props = $props();

  const shopInventory = $derived(place.shopInventory || []);
  const playerCash = $derived(gs.player.cash);

  let purchasedItems = $state(new Set<string>());
  let flyingElements = $state<Array<{ id: string; itemKey: string; x: number; y: number }>>([]);

  function handlePurchase(item: ItemDefinition, event: MouseEvent) {
    if (playerCash >= item.price) {
      buyItem(item);
      // Add animation effect
      purchasedItems.add(item.key);
      setTimeout(() => {
        purchasedItems.delete(item.key);
      }, 1000);

      // Add flying +1 element
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const flyingId = crypto.randomUUID();
      flyingElements.push({
        id: flyingId,
        itemKey: item.key,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      setTimeout(() => {
        flyingElements = flyingElements.filter((el) => el.id !== flyingId);
      }, 2000);
    }
  }
</script>

<div class="shop-container">
  {#if shopInventory.length === 0}
    <div class="empty-shop">
      <p>This shop has no items for sale.</p>
    </div>
  {:else}
    <div class="shop-inventory">
      {#each shopInventory as item (item.key)}
        <div class="shop-item-container">
          <div
            class="shop-item"
            class:affordable={playerCash >= item.price}
            class:disabled={playerCash < item.price}
            class:booster={item.type === ItemType.Booster}
            class:purchased={purchasedItems.has(item.key)}
            onclick={(event) => handlePurchase(item, event)}
            style="background-image: url({getItemImagePath(item.key)})"
          >
            {#if purchasedItems.has(item.key)}
              <div class="purchase-overlay">
                <div class="purchase-checkmark">✓</div>
              </div>
            {/if}
          </div>
          <div class="item-info">
            <h3 class="item-name">{item.name}</h3>
            <div class="item-price">${item.price}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Flying +1 elements -->
{#each flyingElements as element (element.id)}
  <div class="flying-plus-one" style="left: {element.x}px; top: {element.y}px;">+1</div>
{/each}

<style>
  .shop-container {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
    color: white;
    max-width: 600px;
  }

  .empty-shop {
    text-align: center;
    padding: 40px;
    color: #888;
  }

  .shop-inventory {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .shop-item-container {
    display: flex;
    flex-direction: column;
  }

  .shop-item {
    background: rgba(255, 255, 255, 0.1);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 2px solid transparent;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    height: 200px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .shop-item.booster {
    aspect-ratio: 3/4;
    height: auto;
  }

  .shop-item.affordable {
    border-color: var(--color-green);
  }

  .shop-item.affordable:hover {
    box-shadow:
      0 8px 16px rgba(0, 255, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .shop-item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .shop-item.disabled:hover {
    box-shadow:
      0 8px 16px rgba(255, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .shop-item.purchased {
    animation: purchaseSuccess 1s ease-out;
  }

  @keyframes purchaseSuccess {
    0% {
      transform: scale(1);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.1);
      filter: brightness(1.3);
    }
    100% {
      transform: scale(1);
      filter: brightness(1);
    }
  }

  .purchase-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 255, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    animation: overlayFade 1s ease-out;
  }

  @keyframes overlayFade {
    0% {
      opacity: 0;
      background: rgba(0, 255, 0, 0);
    }
    30% {
      opacity: 1;
      background: rgba(0, 255, 0, 0.3);
    }
    100% {
      opacity: 0;
      background: rgba(0, 255, 0, 0);
    }
  }

  .purchase-checkmark {
    font-size: 3em;
    color: #00ff00;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    animation: checkmarkPop 1s ease-out;
  }

  @keyframes checkmarkPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  .flying-plus-one {
    position: fixed;
    pointer-events: none;
    z-index: 2000;
    font-size: 1.5em;
    font-weight: bold;
    color: #00ff00;
    text-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
    animation: flyUp 2s ease-out forwards;
    transform: translate(-50%, -50%);
  }

  @keyframes flyUp {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -80px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -120px) scale(0.8);
    }
  }

  .item-info {
    padding: 10px 0;
    text-align: center;
  }

  .item-name {
    margin: 0 0 5px 0;
    font-size: 1.1em;
    color: white;
  }

  .item-price {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--color-golden);
  }
</style>
