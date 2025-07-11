<script lang="ts">
  import { bs } from '../_state';
  import Board from './Board.svelte';
  import Hand from './Hand.svelte';
  import Player from './Player.svelte';
  import { nextTurn } from '../battle/turn';
</script>

<div class="battle">
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
    >
      End Turn
    </button>
  </div>
  <div class="bottom-section">
    <Hand player={bs.players[0]} />
    <Hand player={bs.players[1]} />
  </div>
</div>

<style>
  .battle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-image: url('/src/assets/images/table.png');
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
    background: linear-gradient(135deg, #e74c3c 0%, #a93226 100%);
    color: white;
    border: 3px solid rgba(255, 255, 255, 0.3);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.4),
      0 4px 10px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .end-turn-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  .end-turn-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow:
      0 12px 35px rgba(0, 0, 0, 0.5),
      0 6px 15px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .end-turn-btn:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 -1px 2px rgba(255, 255, 255, 0.1);
  }

  .end-turn-btn.disabled {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    cursor: not-allowed;
    opacity: 0.6;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(0, 0, 0, 0.1);
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
</style>
