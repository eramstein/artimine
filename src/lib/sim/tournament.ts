import { TournamentStatus, TournamentType } from '../_model/enums-sim';
import type { Tournament } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { getRandomFromArray } from '../_utils/random';

export function getTournament(players: string[], tournamentType: TournamentType): Tournament {
  return {
    players: players,
    tournamentType: tournamentType,
    status: TournamentStatus.Planned,
    rankings: {},
    pairings: {},
    remainingMatches: {},
  };
}

export function recordTournamentResult(win: boolean) {
  const tournament = gs.activity.tournament;
  if (!tournament) {
    return;
  }
  const player = gs.player.key;
  const opponent = tournament.pairings[player];

  // update player score
  if (win) {
    tournament.rankings[player] += 1;
  } else {
    tournament.rankings[opponent] += 1;
  }

  // simulate other matches
  const alreadyPlayed = { [player]: true, [opponent]: true };
  for (const pairing of Object.entries(tournament.pairings)) {
    const [player1, player2] = pairing;
    if (alreadyPlayed[player1] || alreadyPlayed[player2]) {
      continue;
    }
    alreadyPlayed[player1] = true;
    alreadyPlayed[player2] = true;
    const winner = getRandomFromArray([player1, player2]);
    tournament.rankings[winner] += 1;
  }
  updateRemainingMatches(tournament);

  const winner = checkWinner(tournament);
  console.log('winner', winner);

  if (winner) {
    tournament.winner = winner;
    tournament.status = TournamentStatus.Finished;
    return;
  }

  // next round
  tournament.pairings = getPairings(tournament);
  tournament.status = TournamentStatus.PairingsPublished;
}

export function initTournament(tournament: Tournament) {
  tournament.status = TournamentStatus.PairingsPublished;
  tournament.rankings = {};
  for (const player of tournament.players) {
    tournament.rankings[player] = 0;
    tournament.remainingMatches[player] =
      tournament.tournamentType === TournamentType.Mini
        ? tournament.players.filter((p) => p !== player)
        : [];
  }
  tournament.pairings = getPairings(tournament);
}

function getPairings(tournament: Tournament): Record<string, string> {
  const pairings: Record<string, string> = {};
  const sortedPlayers = Object.keys(tournament.rankings).sort(
    (a, b) => tournament.rankings[b] - tournament.rankings[a]
  );
  const pairedPlayers: Record<string, boolean> = {};
  // we pick an opponent for each player starting from top of the rankings
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    if (pairedPlayers[player]) {
      continue;
    }
    pairedPlayers[player] = true;
    if (tournament.tournamentType === TournamentType.Mini) {
      const pool = tournament.remainingMatches[player].filter((p) => !pairedPlayers[p]);
      if (pool.length === 0) {
        continue;
      }
      const opponent = getRandomFromArray(pool);
      pairings[player] = opponent;
      pairings[opponent] = player;
      pairedPlayers[opponent] = true;
    }
    // TODO: Swiss tournament
  }
  updateRemainingMatches(tournament);
  return pairings;
}

function updateRemainingMatches(tournament: Tournament) {
  if (!tournament.remainingMatches) {
    return;
  }
  for (const pairing of Object.entries(tournament.pairings)) {
    const [player1, player2] = pairing;
    tournament.remainingMatches[player1] = tournament.remainingMatches[player1].filter(
      (p) => p !== player2
    );
    tournament.remainingMatches[player2] = tournament.remainingMatches[player2].filter(
      (p) => p !== player1
    );
  }
}

function checkWinner(tournament: Tournament): string | undefined {
  if (tournament.tournamentType === TournamentType.Mini) {
    if (tournament.remainingMatches[gs.player.key].length !== 0) {
      return undefined;
    }
    const sortedPlayers = Object.keys(tournament.rankings).sort(
      (a, b) => tournament.rankings[b] - tournament.rankings[a]
    );
    // TODO: handle draws
    return sortedPlayers[0];
  }
  // TODO: Swiss tournament
  return undefined;
}
