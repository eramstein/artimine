<script lang="ts">
  import { TargetType } from '@lib/_model/enums';
  import { bs } from '@lib/_state';
  import { uiState } from '@lib/_state/state-ui.svelte';
  import { targetCard } from '@lib/ui/_helpers/targetting';
  import Card from './Card.svelte';

  // Get the player from the battle state using the playerId from UI state
  let player = $derived(
    uiState.battle.deckModal.playerId !== null
      ? bs.players[uiState.battle.deckModal.playerId]
      : null
  );

  // Get all cards in the deck, sorted by mana cost then by name
  let deckCards = $derived(
    player?.deck
      ? [...player.deck].sort((a, b) => {
          // First sort by mana cost
          if (a.cost !== b.cost) {
            return a.cost - b.cost;
          }
          // Then sort by name
          return a.name.localeCompare(b.name);
        })
      : []
  );

  // Auto-open modal when targeting deck cards
  $effect(() => {
    if (uiState.battle.targetBeingSelected?.type === TargetType.DeckCard) {
      // Find the current player (assuming we're targeting our own deck)
      const currentPlayer = bs.isPlayersTurn ? bs.players[0] : bs.players[1];
      if (currentPlayer) {
        uiState.battle.deckModal.visible = true;
        uiState.battle.deckModal.playerId = currentPlayer.id;
      }
    }
  });

  // Auto-close modal when target selection is complete
  $effect(() => {
    if (!uiState.battle.targetBeingSelected) {
      uiState.battle.deckModal.visible = false;
      uiState.battle.deckModal.playerId = null;
    }
  });

  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      uiState.battle.deckModal.visible = false;
      uiState.battle.deckModal.playerId = null;
    }
  }

  function handleCloseClick() {
    uiState.battle.deckModal.visible = false;
    uiState.battle.deckModal.playerId = null;
  }
</script>

{#if uiState.battle.deckModal.visible && player}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <h2>{player.name}'s Deck</h2>
          <span class="card-count">({deckCards.length} cards)</span>
        </div>
        <button class="close-button" onclick={handleCloseClick}>×</button>
      </div>

      <div class="modal-body">
        {#if deckCards.length === 0}
          <div class="empty-deck">
            <p>The deck is empty.</p>
          </div>
        {:else}
          <div class="cards-grid">
            {#each deckCards as card}
              <div
                class="card-wrapper"
                onclick={() => {
                  targetCard(card);
                  // Close the modal after selecting a card
                  uiState.battle.deckModal.visible = false;
                  uiState.battle.deckModal.playerId = null;
                }}
              >
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
    max-width: 98vw;
    max-height: 95vh;
    min-width: 620px;
    width: 90vw;
    display: flex;
    flex-direction: column;
    border: 2px solid #bfa14a;
    overflow: hidden;
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
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .empty-deck {
    text-align: center;
    color: #999;
    font-size: 1.2rem;
    padding: 2rem;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    justify-items: center;
    justify-content: center;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 45px;
    width: 100%;
    box-sizing: border-box;
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
      gap: 0.75rem;
      max-height: 60vh;
      padding: 0.75rem;
    }

    .modal-header h2 {
      font-size: 1.2rem;
    }
  }
</style>
