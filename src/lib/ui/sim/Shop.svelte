<script lang="ts">
  import type { ItemDefinition, Place } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import { getItemImagePath } from '@/lib/_utils/asset-paths';

  interface Props {
    place: Place;
  }

  let { place }: Props = $props();

  const shopInventory = $derived(place.shopInventory || []);
  const playerCash = $derived(gs.player.cash);

  function handlePurchase(item: ItemDefinition) {
    if (playerCash >= item.price) {
      // TODO: Implement purchase logic
      console.log(`Purchasing ${item.name} for ${item.price} cash`);
      // This would typically:
      // 1. Deduct cash from player
      // 2. Add item to player's inventory
      // 3. Update UI state
    } else {
      console.log(`Not enough cash to buy ${item.name}`);
    }
  }
</script>

<div class="shop-container">
  <div class="shop-header">
    <h2 class="shop-title">{place.name} Shop</h2>
    <div class="player-cash">
      Cash: ${playerCash}
    </div>
  </div>

  {#if shopInventory.length === 0}
    <div class="empty-shop">
      <p>This shop has no items for sale.</p>
    </div>
  {:else}
    <div class="shop-inventory">
      {#each shopInventory as item (item.key)}
        <div class="shop-item" class:affordable={playerCash >= item.price}>
          <div class="item-image">
            <img src={getItemImagePath(item.key)} alt={item.name} />
          </div>
          <div class="item-info">
            <h3 class="item-name">{item.name}</h3>
            <p class="item-type">{item.type}</p>
            <div class="item-price">${item.price}</div>
          </div>
          <button
            class="purchase-button"
            class:disabled={playerCash < item.price}
            onclick={() => handlePurchase(item)}
            disabled={playerCash < item.price}
          >
            {playerCash >= item.price ? 'Buy' : 'Too Expensive'}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .shop-container {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
    color: white;
    max-width: 600px;
  }

  .shop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--color-golden);
    padding-bottom: 10px;
  }

  .shop-title {
    margin: 0;
    color: var(--color-golden);
    font-size: 1.5em;
  }

  .player-cash {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--color-green);
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

  .shop-item {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.3s ease;
  }

  .shop-item.affordable {
    border-color: var(--color-green);
  }

  .shop-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .item-image {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    border-radius: 4px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-info {
    flex-grow: 1;
    margin-bottom: 10px;
  }

  .item-name {
    margin: 0 0 5px 0;
    font-size: 1.1em;
    color: white;
  }

  .item-type {
    margin: 0 0 8px 0;
    font-size: 0.9em;
    color: #ccc;
    text-transform: capitalize;
  }

  .item-price {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--color-golden);
  }

  .purchase-button {
    background: var(--color-green);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 0.9em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }

  .purchase-button:hover:not(.disabled) {
    background: #27ae60;
    transform: translateY(-1px);
  }

  .purchase-button.disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
