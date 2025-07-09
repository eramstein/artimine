<script lang="ts">
  import { bs } from '../_state';
  import Board from './Board.svelte';
  import Hand from './Hand.svelte';
  import Player from './Player.svelte';
</script>

<div class="battle">
  <div class="player-section">
    <Player player={bs.players[0]} />
    <Hand player={bs.players[0]} />
  </div>
  <Board />
  <div class="player-section">
    <Player player={bs.players[1]} />
    <Hand player={bs.players[1]} />
  </div>
</div>

<style>
  .battle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1rem;
    min-height: 100vh;
  }

  .player-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
</style>
