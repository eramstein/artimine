import { ActivityType, TournamentStatus, TournamentType } from '../_model/enums-sim';
import type { Tournament } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { generateUniqueId, getRandomFromArray } from '../_utils/random';
import { saveActivityLog } from '../llm/memories-db';

export function getTournament(
  players: string[],
  tournamentType: TournamentType,
  rounds?: number
): Tournament {
  return {
    players: players,
    tournamentType: tournamentType,
    status: TournamentStatus.Planned,
    rankings: {},
    wonAgainst: {},
    pairings: {},
    remainingMatches: {},
    tiebreakers: {},
    rounds: rounds,
    playedRounds: 0,
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
    tournament.wonAgainst[player].push(opponent);
  } else {
    tournament.rankings[opponent] += 1;
    tournament.wonAgainst[opponent].push(player);
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
    const loser = [player1, player2].find((p) => p !== winner)!;
    tournament.rankings[winner] += 1;
    tournament.wonAgainst[winner].push(loser);
  }
  updateRemainingMatches(tournament);
  updateTiebreakers(tournament);
  tournament.playedRounds += 1;

  const winner = checkWinner(tournament);

  if (winner) {
    tournament.winner = winner;
    tournament.status = TournamentStatus.Finished;
    recordTournament(tournament);
    return;
  }

  // next round
  tournament.pairings = getPairings(tournament);
  tournament.status = TournamentStatus.PairingsPublished;
}

export function initTournament(tournament: Tournament) {
  tournament.status = TournamentStatus.PairingsPublished;
  tournament.rankings = {};
  tournament.wonAgainst = {};
  tournament.tiebreakers = {};
  for (const player of tournament.players) {
    tournament.rankings[player] = 0;
    tournament.wonAgainst[player] = [];
    tournament.tiebreakers[player] = 0;
    tournament.remainingMatches[player] =
      tournament.tournamentType === TournamentType.RoundRobin
        ? tournament.players.filter((p) => p !== player)
        : [];
  }
  tournament.pairings = getPairings(tournament);
}

function getPairings(tournament: Tournament): Record<string, string> {
  const pairings: Record<string, string> = {};
  const sortedPlayers = getPlayersSortedByRankings(tournament);
  const pairedPlayers: Record<string, boolean> = {};
  // we pick an opponent for each player starting from top of the rankings
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    if (pairedPlayers[player]) {
      continue;
    }
    pairedPlayers[player] = true;
    // for round robin tournaments, every one plays every one
    if (tournament.tournamentType === TournamentType.RoundRobin) {
      const pool = tournament.remainingMatches[player].filter((p) => !pairedPlayers[p]);
      if (pool.length === 0) {
        continue;
      }
      const opponent = getRandomFromArray(pool);
      pairings[player] = opponent;
      pairings[opponent] = player;
      pairedPlayers[opponent] = true;
    }
    // for swiss tournaments, players are paired against the closest ranking
    if (tournament.tournamentType === TournamentType.Swiss) {
      const pool = sortedPlayers.filter((p) => !pairedPlayers[p]);
      if (pool.length === 0) {
        continue;
      }
      const opponent = pool[0];
      pairings[player] = opponent;
      pairings[opponent] = player;
      pairedPlayers[opponent] = true;
    }
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
  if (
    tournament.tournamentType === TournamentType.RoundRobin &&
    tournament.remainingMatches[gs.player.key].length !== 0
  ) {
    return undefined;
  }
  if (
    tournament.tournamentType === TournamentType.Swiss &&
    tournament.playedRounds < (tournament.rounds || 1)
  ) {
    return undefined;
  }
  const sortedPlayers = getPlayersSortedByRankings(tournament);
  return sortedPlayers[0];
}

function getPlayersSortedByRankings(tournament: Tournament): string[] {
  return Object.keys(tournament.rankings).sort((a, b) => {
    // Primary sort: by points (rankings)
    const pointsDiff = tournament.rankings[b] - tournament.rankings[a];
    if (pointsDiff !== 0) {
      return pointsDiff;
    }

    // Secondary sort: by tiebreakers
    const tiebreakerDiff = (tournament.tiebreakers[b] || 0) - (tournament.tiebreakers[a] || 0);
    if (tiebreakerDiff !== 0) {
      return tiebreakerDiff;
    }

    return a.localeCompare(b);
  });
}

// tiebreakers are sum of rankings of the players you won against
function updateTiebreakers(tournament: Tournament) {
  for (const player of tournament.players) {
    tournament.tiebreakers[player] = tournament.wonAgainst[player].reduce(
      (acc, p) => acc + tournament.rankings[p],
      0
    );
  }
}

function recordTournament(tournament: Tournament) {
  if (!tournament.winner) {
    return;
  }
  const winnerName =
    tournament.winner === gs.player.key ? gs.player.name : gs.characters[tournament.winner]?.name;

  // Ensure participants array contains only serializable strings
  const participants = tournament.players.map((player) => String(player));
  saveActivityLog({
    id: generateUniqueId(),
    day: gs.time.day,
    participants: participants,
    location: gs.places[gs.player.place].name,
    activityType: ActivityType.Tournament,
    summary: `${winnerName} won the tournament!`,
  });
}
