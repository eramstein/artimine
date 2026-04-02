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
  import ConfirmPopover from './ConfirmPopover.svelte';
  import DeckModal from './DeckModal.svelte';
  import DragPreview from './DragPreview.svelte';
  import GameWonModal from './GameWonModal.svelte';
  import GoldCost from './GoldCost.svelte';
  import GraveyardModal from './GraveyardModal.svelte';
  import Hand from './Hand.svelte';
  import Player from './Player.svelte';
  import Shop from './Shop.svelte';
  import SpellDimOverlay from './SpellDimOverlay.svelte';
  import SpellTargetArrows from './SpellTargetArrows.svelte';
  import TargetPrompt from './TargetPrompt.svelte';

  // Derived value to check if game is won
  let gameWon = $derived(bs.playerIdWon !== null);
  let winningPlayer = $derived(gameWon ? bs.players[bs.playerIdWon!] : null);

  // Currently played spell (shown briefly when a spell is cast)
  let playedSpellCard = $derived(
    uiState.battle.playedSpellId ? cards[uiState.battle.playedSpellId] : null
  );

  // ref to measure the floating card center for arrows
  let playedCardEl: HTMLElement | null = $state(null);
</script>

<div class="battle" style="background-image: url('{getTableImagePath()}');">
  <div class="top-section">
    <Player player={bs.players[0]} />
    <Board />
    <Player player={bs.players[1]} />
  </div>
  <div class="bottom-section">
    <div class="hands-container">
      <Hand player={bs.players[0]} />
      {#if !uiState.battle.displayChat}
        <Hand player={bs.players[1]} />
      {:else}
        <div class="hand-placeholder"></div>
      {/if}
    </div>

    <div class="turn-slider-bar">
      <button
        class="chip-btn end-turn-btn slider-button"
        class:is-p2={!bs.isPlayersTurn}
        class:disabled={!bs.isPlayersTurn}
        onclick={handleEndTurn}
        disabled={!bs.isPlayersTurn}
      >
        <span>End<br />Turn</span>
      </button>
    </div>
  </div>
  <ConfirmPopover />
</div>

<TargetPrompt />
<DragPreview />

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

<!-- Shop button and gold displays positioned in top center -->
<div class="shop-gold-container">
  <GoldCost value={bs.players[0]?.gold || 0} size="md" />
  <button
    class="shop-btn"
    aria-label="Shop"
    title="Shop"
    onclick={() => {
      uiState.modal.custom = {
        component: Shop,
        props: {},
        width: Math.min(window.innerWidth * 0.8, 1200),
        height: Math.min(window.innerHeight * 0.8, 800),
        overlayOpacity: 0,
      };
      uiState.modal.visible = true;
    }}
  >
    <img src="/assets/images/shop.png" alt="Shop" />
  </button>
  <GoldCost value={bs.players[1]?.gold || 0} size="md" />
</div>

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
      bind:this={playedCardEl}
    >
      <CardFull card={playedSpellCard} />
    </div>
  </div>
{/if}

{#if uiState.battle.playedSpellId}
  <SpellDimOverlay sourceEl={playedCardEl} />
  <SpellTargetArrows sourceEl={playedCardEl} />
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
    overflow: hidden;
  }

  .top-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .chip-btn {
    background: url('/assets/images/wood_chip_base.png') center/cover no-repeat;
    border: 1px solid rgba(0, 0, 0, 0.4);
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow:
      0 4px 0px #3a221f,
      0 8px 12px rgba(0, 0, 0, 0.5);
    position: relative;

    /* Text styling */
    color: #2a110a; /* Dark brown ink */
    font-family: inherit;
    font-weight: 800;
    line-height: 1.1;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
  }

  .chip-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow:
      inset 0 2px 5px rgba(255, 255, 255, 0.3),
      inset 0 -5px 8px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  /* Reverted shop button to use original image styling */
  .shop-btn {
    background: transparent;
    border: none;
    border-radius: 50%;
    padding: 0px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .shop-btn:hover {
    transform: translateY(-2px);
  }

  .shop-btn:active {
    transform: translateY(0);
  }

  .shop-btn img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    pointer-events: none;
    display: block;
  }

  .end-turn-btn {
    width: 72px;
    height: 72px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .slider-button {
    pointer-events: auto;
    position: absolute;
    left: 25%;
    transform: translateX(-50%);
    transition:
      left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
      filter 0.2s ease,
      box-shadow 0.2s ease;
    z-index: 10;
  }

  .slider-button.is-p2 {
    left: 75%;
  }

  .chip-btn:hover {
    filter: brightness(1.1);
    box-shadow:
      0 6px 0px #3a221f,
      0 10px 15px rgba(0, 0, 0, 0.4);
  }

  .chip-btn:active {
    transform: translateX(-50%) translateY(2px);
  }

  .chip-btn.disabled,
  .chip-btn:disabled {
    cursor: not-allowed;
    transform: translateY(0);
    filter: grayscale(80%) brightness(0.8);
    box-shadow:
      0 2px 0px #1a1a1a,
      0 4px 6px rgba(0, 0, 0, 0.4);
    color: #777;
    text-shadow: none;
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

  .shop-gold-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 1001;
  }

  .bottom-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 0;
  }

  .hands-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    padding: 0 2rem;
  }

  .hand-placeholder {
    width: 550px;
    height: 220px;
  }

  .turn-slider-bar {
    width: 100%;
    max-width: 1200px;
    height: 30px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    margin-top: 40px;
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
    top: 40%;
    right: 20px;
    transform: translateY(-40%);
    z-index: 1002;
    pointer-events: none;
  }

  .played-spell-card {
    transform: scale(0.9);
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6));
  }
</style>
