<script lang="ts">
  import type { Player } from '../_model/model-battle';
  import Card from './Card.svelte';
  import { targetCard } from './_helpers/abilities';

  let {
    player,
    isVisible,
    onClose,
  }: {
    player: Player;
    isVisible: boolean;
    onClose: () => void;
  } = $props();

  // Get all cards in the graveyard
  let graveyardCards = $derived(player.graveyard || []);

  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleCloseClick() {
    onClose();
  }
</script>

{#if isVisible}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <h2>{player.name}'s Graveyard</h2>
          <span class="card-count">({graveyardCards.length} cards)</span>
        </div>
        <button class="close-button" onclick={handleCloseClick}>×</button>
      </div>

      <div class="modal-body">
        {#if graveyardCards.length === 0}
          <div class="empty-graveyard">
            <p>The graveyard is empty.</p>
          </div>
        {:else}
          <div class="cards-grid">
            {#each graveyardCards as card}
              <div class="card-wrapper" onclick={() => targetCard(card)}>
                <Card {card} displayKeywords={true} inHand={false} />
              </div>
            {/each}
          </div>
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
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    max-width: 95vw;
    max-height: 95vh;
    min-width: 800px;
    width: 90vw;
    display: flex;
    flex-direction: column;
    border: 2px solid #bfa14a;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #bfa14a;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px 10px 0 0;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-header h2 {
    color: white;
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .card-count {
    color: #bfa14a;
    font-size: 0.9rem;
    font-weight: normal;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-body {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .empty-graveyard {
    text-align: center;
    color: #999;
    font-size: 1.2rem;
    padding: 2rem;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    justify-items: center;
    max-height: 70vh;
    overflow-y: auto;
    padding: 0.75rem;
    padding-right: 1rem;
    padding-bottom: 1rem;
  }

  .card-wrapper {
    display: flex;
    justify-content: center;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .modal-backdrop {
      padding: 1rem;
    }

    .modal-content {
      max-width: 95vw;
      max-height: 95vh;
      min-width: unset;
      width: 95vw;
    }

    .cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
      max-height: 60vh;
    }

    .modal-header h2 {
      font-size: 1.2rem;
    }
  }
</style>
