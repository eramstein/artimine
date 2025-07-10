<script lang="ts">
  import { bs } from '../_state';
  import Board from './Board.svelte';
  import Hand from './Hand.svelte';
  import Player from './Player.svelte';
</script>

<div class="battle">
  <div class="top-section">
    <Player player={bs.players[0]} />
    <Board />
    <Player player={bs.players[1]} />
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

  .bottom-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
  }
</style>
