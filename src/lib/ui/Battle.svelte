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
    background: linear-gradient(135deg, #ff4757 0%, #c44569 100%);
    color: white;
    border: none;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .end-turn-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .end-turn-btn:active {
    transform: translateY(0) scale(0.95);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .end-turn-btn.disabled {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .end-turn-btn.disabled:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .bottom-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
  }
</style>
