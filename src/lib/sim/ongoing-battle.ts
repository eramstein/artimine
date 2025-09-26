import { TournamentStatus } from '../_model/enums-sim';
import type { Deck, Npc } from '../_model/model-game';
import { gs } from '../_state/main.svelte';
import { uiState } from '../_state/state-ui.svelte';
import { initBattle } from '../battle/init';
import { recordActionInChat } from '../llm/action';
import { initPlayerChat } from '../llm/chat';
import { pickNpcDeck, updateDeckRecord } from './decks';
import { recordTournamentResult } from './tournament';

export async function initDeckSelection(foe: Npc) {
  uiState.deckSelectionModal.foeKey = foe.key;
  uiState.deckSelectionModal.visible = true;
}

export async function initOngoingBattle(foe: Npc, deck: Deck) {
  const foeDeck = pickNpcDeck(foe.key);
  gs.ongoingBattle = {
    opponentKey: foe.key,
    deckNames: {
      player: deck.key,
      opponent: foeDeck.key,
    },
  };
  if (gs.activity.tournament) {
    gs.activity.tournament.status = TournamentStatus.RoundOngoing;
  }
  initBattle(foe.key, deck, foeDeck);
  await initPlayerChat([foe]);
  recordActionInChat(`${foe.name} and ${gs.player.name} have started a game of Hordes cards.`);
}

export function recordBattleResult(
  won: boolean,
  playerPlayedCards: string[],
  opponentPlayedCards: string[]
) {
  if (!gs.ongoingBattle) {
    return;
  }
  const playerDeck = gs.player.decks.find(
    (deck) => deck.key === gs.ongoingBattle!.deckNames.player
  );
  const opponentDeck = gs.characters[gs.ongoingBattle.opponentKey].decks.find(
    (deck) => deck.key === gs.ongoingBattle!.deckNames.opponent
  );
  if (playerDeck) {
    updateDeckRecord(playerDeck, won, playerPlayedCards);
  }
  if (opponentDeck) {
    updateDeckRecord(opponentDeck, !won, opponentPlayedCards);
  }
  if (gs.activity.tournament) {
    recordTournamentResult(won);
  }
  gs.ongoingBattle = null;
}
