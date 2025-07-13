<script lang="ts">
  import type { Player } from '../_model/model-battle';

  let { winningPlayer }: { winningPlayer: Player } = $props();
</script>

<div class="game-won-overlay">
  <div class="game-won-modal">
    <div class="victory-text">
      <h1>Victory!</h1>
      <p>{winningPlayer.name} has won the game!</p>
    </div>
    <div class="winner-info">
      <div
        class="winner-avatar"
        style="background-image: url('/src/assets/images/characters/{winningPlayer.name
          .toLowerCase()
          .replace(/\s+/g, '_')}.png')"
      ></div>
      <div class="winner-details">
        <h2>{winningPlayer.name}</h2>
        <p>Final Life: {winningPlayer.life}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .game-won-overlay {
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
    animation: fadeIn 0.5s ease-out;
  }

  .game-won-modal {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border: 3px solid #f39c12;
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    color: white;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 10px 30px rgba(0, 0, 0, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
    animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 500px;
    width: 90%;
  }

  .victory-text h1 {
    font-size: 3rem;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .victory-text p {
    font-size: 1.5rem;
    margin: 0 0 2rem 0;
    color: #ecf0f1;
  }

  .winner-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .winner-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    border: 3px solid #f39c12;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .winner-details h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #f39c12;
  }

  .winner-details p {
    margin: 0;
    font-size: 1rem;
    color: #bdc3c7;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-50px) scale(0.9);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
</style>
