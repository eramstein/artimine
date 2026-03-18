<script lang="ts">
  import { cards, lands } from '@/data/loader';
  import { gs } from '@/lib/_state/main.svelte';
  import { uiState } from '@/lib/_state/state-ui.svelte';
  import { getCardImagePath } from '@/lib/_utils/asset-paths';
  import { acceptCardGifts } from '@/lib/sim/gift';

  let characterKey = $derived(uiState.activeGiftCharacterKey);
  let character = $derived(characterKey ? gs.characters[characterKey] : null);
  let giftingCards = $derived(character?.gifting?.cards || []);

  function handleClaim() {
    if (!character) return;
    acceptCardGifts(character);
    handleClose();
  }

  function handleClose() {
    uiState.activeGiftCharacterKey = null;
  }
</script>

{#if character}
  <div class="event-view">
    <div class="event-header">
      <h2>Gift from {character.name}</h2>
      <button class="close-header-button" onclick={handleClose} title="Close"> &times; </button>
    </div>

    <div class="event-content">
      <div class="description">
        {character.name} has something special for you. They want to give you these cards to help you
        on your journey!
      </div>

      <div class="cards-container">
        {#each giftingCards as cardId}
          {@const card = cards[cardId] || lands[cardId]}
          <div class="card-item">
            <img src={getCardImagePath(cardId)} alt={card?.name || cardId} class="card-image" />
            <div class="card-name">{card?.name || 'Unknown Card'}</div>
          </div>
        {/each}
      </div>

      <button class="claim-button" onclick={handleClaim}> Claim Gifts </button>
    </div>
  </div>
{/if}

<style>
  .event-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(15, 15, 20, 0.95);
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    overflow-y: auto;
  }

  .event-header {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .event-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .close-header-button {
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.75rem;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
    line-height: 1;
    margin: -8px;
  }

  .close-header-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
  }

  .event-content {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #cbd5e1;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    margin-top: 8px;
  }

  .card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    padding: 10px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }

  .card-item:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .card-image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .card-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: #f8fafc;
    text-align: center;
    line-height: 1.2;
    height: 2.4em;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .claim-button {
    background: #4f46e5;
    border: none;
    border-radius: 12px;
    padding: 16px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: auto;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .claim-button:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }

  .claim-button:active {
    transform: translateY(0);
  }
</style>
