<script lang="ts">
  import { ItemType } from '@/lib/_model/enums-sim';
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import { getItemImagePath } from '@/lib/_utils/asset-paths';
  import { openBooster } from '@/lib/sim/booster';
  import Booster from './Booster.svelte';

  const playerItems = $derived(gs.player.items);

  function handleItemClick(item: any) {
    if (item.type === ItemType.Booster) {
      const boosterPack = openBooster(item);
      uiState.boosterModal.cards = boosterPack;
      uiState.boosterModal.visible = true;
    }
  }
</script>

{#if playerItems.length === 0}
  <div class="empty-inventory">
    <div class="empty-icon">📦</div>
    <p>Your inventory is empty.</p>
    <p class="empty-hint">Visit shops to purchase items!</p>
  </div>
{:else}
  <div class="inventory-grid">
    {#each playerItems as item (item.instanceId)}
      <div class="inventory-item" onclick={() => handleItemClick(item)}>
        <div
          class="item-image"
          class:booster={item.type === ItemType.Booster}
          style="background-image: url({getItemImagePath(item.key)})"
        ></div>
        <div class="item-details">
          <h3 class="item-name">{item.name}</h3>
          {#if item.type === ItemType.Booster && item.variant}
            <div class="item-variant">Set: {item.variant}</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- Booster Modal -->
<Booster cards={uiState.boosterModal.cards || []} />

<style>
  .empty-inventory {
    text-align: center;
    padding: 60px 20px;
    color: #888;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
  }

  .empty-icon {
    font-size: 4em;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .empty-inventory p {
    margin: 10px 0;
    font-size: 1.1em;
  }

  .empty-hint {
    font-size: 0.9em;
    color: #666;
    font-style: italic;
  }

  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .inventory-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .inventory-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .item-image {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 200px;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .item-image.booster {
    aspect-ratio: 3/4;
    height: auto;
  }

  .item-details {
    padding: 15px;
  }

  .item-name {
    margin: 0 0 8px 0;
    font-size: 1.2em;
    color: white;
    font-weight: bold;
  }

  .item-variant {
    font-size: 0.8em;
    color: var(--color-golden);
    font-weight: bold;
  }
</style>
