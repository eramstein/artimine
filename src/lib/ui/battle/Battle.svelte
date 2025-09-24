<script lang="ts">
  import { cards } from '@/data/loader';
  import { bs } from '@lib/_state';
  import { uiState } from '@lib/_state/state-ui.svelte';
  import { getTableImagePath } from '@lib/_utils/asset-paths';
  import { handleEndTurn } from '@lib/ui/_helpers/end-turn';
  import { fade, scale } from 'svelte/transition';
  import CardFull from '../cards/CardFull.svelte';
  import ModalHost from '../ModalHost.svelte';
  import Chat from '../sim/Chat.svelte';
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

  // Currently played spell (shown briefly when a spell is cast)
  let playedSpellCard = $derived(
    uiState.battle.playedSpellId ? cards[uiState.battle.playedSpellId] : null
  );
</script>

<div class="battle" style="background-image: url('{getTableImagePath()}');">
  <div class="turn-section">
    <button
      class="end-turn-btn"
      class:disabled={!bs.isPlayersTurn}
      onclick={handleEndTurn}
      disabled={!bs.isPlayersTurn}
      aria-label="End Turn"
    >
      <img src="/assets/images/pass_turn.png" alt="End Turn" />
    </button>
  </div>
  <div class="top-section">
    <Player player={bs.players[0]} />
    <Board />
    <Player player={bs.players[1]} />
  </div>
  <div class="bottom-section">
    <Hand player={bs.players[0]} />
    {#if !uiState.battle.displayChat}
      <Hand player={bs.players[1]} />
    {/if}
  </div>
</div>

<TargetPrompt />

<!-- Chat component positioned in bottom right -->
{#if uiState.battle.displayChat}
  <div class="battle-chat-container">
    <Chat />
  </div>
{/if}

<!-- Floating chat bubble toggle -->
<button
  class="chat-fab"
  onclick={() => (uiState.battle.displayChat = !uiState.battle.displayChat)}
  aria-label={uiState.battle.displayChat ? 'Hide Chat' : 'Show Chat'}
  title={uiState.battle.displayChat ? 'Hide Chat' : 'Show Chat'}
>
  💬
</button>

{#if gameWon && winningPlayer}
  <GameWonModal {winningPlayer} />
{/if}

<GraveyardModal />
<DeckModal />
<ModalHost />

<!-- Briefly show the played spell card -->
{#if playedSpellCard}
  <div
    class="played-spell-flash"
    aria-live="polite"
    in:fade={{ duration: 120 }}
    out:fade={{ duration: 150 }}
  >
    <div
      class="played-spell-card"
      onclick={(e) => e.stopPropagation()}
      in:scale={{ duration: 120, start: 0.9 }}
      out:scale={{ duration: 120, start: 1.0 }}
    >
      <CardFull card={playedSpellCard} />
    </div>
  </div>
{/if}

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
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
  }

  .end-turn-btn {
    background: transparent;
    border: none;
    border-radius: 50%;
    padding: 0px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  .end-turn-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .end-turn-btn:active {
    transform: translateY(0);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 1px 4px rgba(0, 0, 0, 0.2);
  }

  .end-turn-btn img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    pointer-events: none;
    display: block;
  }

  .end-turn-btn.disabled {
    cursor: not-allowed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .end-turn-btn.disabled img {
    filter: grayscale(60%);
    opacity: 0.6;
  }

  .end-turn-btn.disabled:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .chat-fab {
    position: fixed;
    top: 8%;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-golden);
    background: rgba(20, 20, 20, 0.9);
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 1001;
    transition:
      transform 0.15s ease,
      background 0.2s ease;
  }

  .chat-fab:hover {
    background: rgba(40, 40, 40, 0.95);
    transform: scale(1.06);
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

  .battle-chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 820px;
    height: 430px;
    z-index: 1000;
    pointer-events: auto;
  }

  /* Played spell flash */
  .played-spell-flash {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1002;
    pointer-events: none;
  }

  .played-spell-card {
    transform: scale(0.9);
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6));
  }
</style>
