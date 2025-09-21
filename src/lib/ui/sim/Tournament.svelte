<script lang="ts">
  import { CHARACTERS } from '@/data/characters/main';
  import { CHARACTER_PLAYER } from '@/data/characters/player';
  import { TournamentStatus, TournamentType } from '@/lib/_model/enums-sim';
  import type { Tournament } from '@/lib/_model/model-game';
  import { startGame } from '@/lib/_state/state-ui.svelte';
  import { initTournament } from '@/lib/sim/tournament';

  interface Props {
    tournament: Tournament;
  }

  let { tournament }: Props = $props();

  // Get character name by key
  function getCharacterName(key: string): string {
    if (key === CHARACTER_PLAYER.key) {
      return CHARACTER_PLAYER.name;
    }
    return CHARACTERS[key]?.name || key;
  }

  // Get sorted players by ranking
  const sortedPlayers = $derived(
    tournament.players
      .map((player) => ({
        key: player,
        name: getCharacterName(player),
        points: tournament.rankings[player] || 0,
        tiebreakers: tournament.tiebreakers[player] || 0,
      }))
      .sort((a, b) => {
        // Primary sort: by points
        const pointsDiff = b.points - a.points;
        if (pointsDiff !== 0) {
          return pointsDiff;
        }

        // Secondary sort: by tiebreakers
        const tiebreakerDiff = b.tiebreakers - a.tiebreakers;
        if (tiebreakerDiff !== 0) {
          return tiebreakerDiff;
        }

        // Tertiary sort: by name
        return a.name.localeCompare(b.name);
      })
  );

  // Get current pairings (deduplicated)
  const currentPairings = $derived(() => {
    const seen = new Set<string>();
    const pairs: Array<{
      player1: { key: string; name: string };
      player2: { key: string; name: string };
    }> = [];

    for (const [player1, player2] of Object.entries(tournament.pairings)) {
      // Create a consistent key for the pair (alphabetically sorted)
      const pairKey = [player1, player2].sort().join('-');

      if (!seen.has(pairKey)) {
        seen.add(pairKey);
        pairs.push({
          player1: {
            key: player1,
            name: getCharacterName(player1),
          },
          player2: {
            key: player2,
            name: getCharacterName(player2),
          },
        });
      }
    }

    return pairs;
  });

  // Get status display text
  function getStatusText(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.Planned:
        return 'Planned';
      case TournamentStatus.PairingsPublished:
        return 'Pairings Published';
      case TournamentStatus.RoundOngoing:
        return 'Round Ongoing';
      case TournamentStatus.Finished:
        return 'Finished';
      default:
        return status;
    }
  }

  // Get tournament type display text
  function getTypeText(type: TournamentType): string {
    switch (type) {
      case TournamentType.RoundRobin:
        return 'Round Robin';
      case TournamentType.Swiss:
        return 'Swiss Tournament';
      default:
        return type;
    }
  }

  // Handle starting the tournament
  function handleStartTournament() {
    initTournament(tournament);
  }

  // Get player's opponent from current pairings
  const playerOpponent = $derived(() => {
    const playerKey = CHARACTER_PLAYER.key;
    const opponentKey = tournament.pairings[playerKey];
    return opponentKey ? CHARACTERS[opponentKey] : null;
  });

  // Handle starting a game with opponent
  async function handleStartGame() {
    const opponent = playerOpponent();
    if (opponent) {
      await startGame(opponent);
    }
  }
</script>

<div class="tournament-container">
  <div class="tournament-header">
    <div class="header-top">
      <h2>Tournament</h2>
      {#if !tournament.winner && playerOpponent() && tournament.status !== TournamentStatus.Planned}
        <button class="start-game-button" onclick={handleStartGame}>
          <span class="button-text">Play vs {playerOpponent()?.name}</span>
        </button>
      {/if}
    </div>
    <div class="tournament-info">
      <div class="info-item">
        <span class="label">Type:</span>
        <span class="value">{getTypeText(tournament.tournamentType)}</span>
      </div>
      <div class="info-item">
        <span class="label">Status:</span>
        <span class="value status-{tournament.status.toLowerCase()}"
          >{getStatusText(tournament.status)}</span
        >
      </div>
      <div class="info-item">
        <span class="label">Players:</span>
        <span class="value">{tournament.players.length}</span>
      </div>
      {#if tournament.tournamentType === TournamentType.Swiss && tournament.rounds}
        <div class="info-item">
          <span class="label">Round:</span>
          <span class="value">{tournament.playedRounds + 1} of {tournament.rounds}</span>
        </div>
      {/if}
    </div>
  </div>

  {#if tournament.status === TournamentStatus.Finished && tournament.winner}
    <div class="winner-section">
      <div class="winner-crown">👑</div>
      <h2 class="winner-title">Tournament Winner</h2>
      <div class="winner-name">{getCharacterName(tournament.winner)}</div>
      <div class="winner-points">{tournament.rankings[tournament.winner]} points</div>
    </div>
  {/if}

  {#if tournament.status === TournamentStatus.Planned}
    <div class="tournament-actions">
      <button class="start-tournament-button" onclick={handleStartTournament}>
        <span class="button-icon">🚀</span>
        <span class="button-text">Start Tournament</span>
      </button>
    </div>
  {/if}

  {#if tournament.status !== TournamentStatus.Planned}
    <div class="tournament-content">
      <!-- Rankings Section -->
      <div class="section">
        <h3>{tournament.winner ? 'Final' : 'Current'} Rankings</h3>
        <div class="rankings">
          {#each sortedPlayers as player, index}
            <div class="ranking-item" class:first={index === 0}>
              <div class="rank">#{index + 1}</div>
              <div class="player-name">{player.name}</div>
              <div class="points-container">
                <div class="points">{player.points} pts</div>
                <div class="tiebreakers">({player.tiebreakers})</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Current Round Pairings -->
      {#if !tournament.winner && currentPairings().length > 0}
        <div class="section">
          <h3>Current Round</h3>
          <div class="pairings">
            {#each currentPairings() as pairing}
              <div class="pairing">
                <div class="player">{pairing.player1.name}</div>
                <div class="vs">vs</div>
                <div class="player">{pairing.player2.name}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tournament-container {
    background: var(--bg-secondary, #2a2a2a);
    border-radius: 8px;
    padding: 1.5rem;
    color: var(--text-primary, #ffffff);
    max-width: 600px;
    margin: 0 auto;
  }

  .tournament-header {
    border-bottom: 1px solid var(--border-color, #444);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .tournament-header h2 {
    margin: 0;
    color: var(--accent-color, #4a9eff);
    font-size: 1.5rem;
  }

  .start-game-button {
    background: var(--color-golden, #ffd700);
    border: 1px solid var(--color-golden, #ffd700);
    border-radius: 6px;
    padding: 8px 12px;
    color: #000;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .start-game-button:hover {
    opacity: 0.8;
  }

  .tournament-info {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.875rem;
    color: var(--text-secondary, #aaa);
    font-weight: 500;
  }

  .value {
    font-size: 1rem;
    font-weight: 600;
  }

  .status-planned {
    color: var(--warning-color, #ffa500);
  }

  .status-pairingspublished {
    color: var(--info-color, #4a9eff);
  }

  .status-roundongoing {
    color: var(--success-color, #4caf50);
  }

  .status-finished {
    color: var(--text-secondary, #aaa);
  }

  .winner-section {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    border: 2px solid #ffd700;
    border-radius: 12px;
    padding: 2rem;
    margin: 1.5rem 0;
    text-align: center;
    color: #000;
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
    animation: winnerGlow 2s ease-in-out infinite alternate;
  }

  @keyframes winnerGlow {
    from {
      box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
    }
    to {
      box-shadow: 0 12px 32px rgba(255, 215, 0, 0.5);
    }
  }

  .winner-crown {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .winner-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #000;
  }

  .winner-name {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #000;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .winner-points {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .tournament-actions {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }

  .start-tournament-button {
    background: linear-gradient(135deg, #4caf50, #45a049);
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    box-shadow:
      0 4px 12px rgba(76, 175, 80, 0.3),
      0 2px 6px rgba(76, 175, 80, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .start-tournament-button:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(76, 175, 80, 0.4),
      0 3px 8px rgba(76, 175, 80, 0.3);
  }

  .start-tournament-button:active {
    transform: translateY(0);
    box-shadow:
      0 2px 8px rgba(76, 175, 80, 0.3),
      0 1px 4px rgba(76, 175, 80, 0.2);
  }

  .button-icon {
    font-size: 18px;
  }

  .button-text {
    font-weight: 600;
  }

  .tournament-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section h3 {
    margin: 0 0 1rem 0;
    color: var(--accent-color, #4a9eff);
    font-size: 1.25rem;
    border-bottom: 1px solid var(--border-color, #444);
    padding-bottom: 0.5rem;
  }

  .rankings {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--bg-tertiary, #333);
    border-radius: 6px;
    border-left: 4px solid var(--border-color, #444);
  }

  .ranking-item.first {
    border-left-color: var(--accent-color, #4a9eff);
    background: var(--bg-accent, rgba(74, 158, 255, 0.1));
  }

  .rank {
    font-weight: bold;
    color: var(--accent-color, #4a9eff);
    min-width: 2rem;
  }

  .player-name {
    flex: 1;
    font-weight: 500;
  }

  .points-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .points {
    color: var(--text-secondary, #aaa);
    font-weight: 600;
  }

  .tiebreakers {
    color: var(--text-muted, #666);
    font-size: 0.75rem;
    font-weight: 400;
    opacity: 0.7;
  }

  .pairings {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pairing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg-tertiary, #333);
    border-radius: 6px;
    border: 1px solid var(--border-color, #444);
  }

  .pairing .player {
    font-weight: 500;
    flex: 1;
    text-align: center;
  }

  .vs {
    color: var(--text-secondary, #aaa);
    font-weight: bold;
    margin: 0 1rem;
  }

  @media (max-width: 768px) {
    .tournament-container {
      padding: 1rem;
    }

    .header-top {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .start-game-button {
      align-self: center;
    }

    .tournament-info {
      flex-direction: column;
      gap: 1rem;
    }

    .pairing {
      flex-direction: column;
      gap: 0.5rem;
    }

    .vs {
      margin: 0;
    }
  }
</style>
