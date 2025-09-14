<script lang="ts">
  import { bs } from '@lib/_state';
  import { uiState } from '@lib/_state/state-ui.svelte';
  import { getTableImagePath } from '@lib/_utils/asset-paths';
  import { nextTurn } from '@lib/battle/turn';
  import CardFull from '../cards/CardFull.svelte';
  import Board from './Board.svelte';
  import DeckModal from './DeckModal.svelte';
  import GameWonModal from './GameWonModal.svelte';
  import GraveyardModal from './GraveyardModal.svelte';
  import Hand from './Hand.svelte';
  import Player from './Player.svelte';
  import TargetPrompt from './TargetPrompt.svelte';

  // Derived value to check if game is won
  let gameWon = $derived(bs.playerIdWon !== null);
  let winningPlayer = $derived(gameWon ? bs.players[bs.playerIdWon!] : null);
</script>

<div class="battle" style="background-image: url('{getTableImagePath()}');">
  <div class="top-section">
    <Player player={bs.players[0]} />
    <Board />
    <Player player={bs.players[1]} />
  </div>
  <div class="turn-section">
    <button
      class="end-turn-btn"
      class:disabled={!bs.isPlayersTurn}
      onclick={nextTurn}
      disabled={!bs.isPlayersTurn}
      aria-label="End Turn"
    >
      <img src="/assets/images/pass_turn.png" alt="End Turn" />
    </button>
  </div>
  <div class="bottom-section">
    <Hand player={bs.players[0]} />
    <Hand player={bs.players[1]} />
  </div>
</div>

<TargetPrompt />

{#if gameWon && winningPlayer}
  <GameWonModal {winningPlayer} />
{/if}

<GraveyardModal />
<DeckModal />

<!-- CardFull overlay -->
{#if uiState.cardFullOverlay.visible && uiState.cardFullOverlay.card}
  <div class="card-full-overlay" onclick={() => (uiState.cardFullOverlay.visible = false)}>
    <div class="card-full-container" onclick={(e) => e.stopPropagation()}>
      <CardFull card={uiState.cardFullOverlay.card} />
      <button class="close-button" onclick={() => (uiState.cardFullOverlay.visible = false)}
        >×</button
      >
    </div>
  </div>
{/if}

<style>
  .battle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
  }

  .top-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .turn-section {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .end-turn-btn {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .end-turn-btn img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    pointer-events: none;
    display: block;
  }

  /* No hover/active visual effects; image only */

  .end-turn-btn.disabled {
    cursor: not-allowed;
  }

  .end-turn-btn.disabled img {
    filter: grayscale(60%);
    opacity: 0.85;
  }

  .end-turn-btn.disabled:hover {
    transform: none;
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .bottom-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
  }

  .card-full-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    min-height: 100vh;
    min-width: 100vw;
  }

  .card-full-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button {
    position: absolute;
    top: -20px;
    right: -20px;
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
</style>
