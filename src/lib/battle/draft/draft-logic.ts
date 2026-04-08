import { cards, lands } from '@/data';
import { CardColor, CardSet } from '../../_model/enums-battle';
import { TournamentStatus } from '../../_model/enums-sim';
import type { DraftState, Tournament } from '../../_model/model-game';
import { gs } from '../../_state/main.svelte';
import { getRandomFromArray } from '../../_utils/random';
import { generateBooster } from '../../sim/booster';

export function startDraft(tournament: Tournament) {
  // Clear any previous player draft deck
  const existingPlayerIndex = gs.player.decks.findIndex((d) => d.key === tournament.format);
  if (existingPlayerIndex !== -1) {
    gs.player.decks.splice(existingPlayerIndex, 1);
  }

  const botsColors: Record<string, CardColor[]> = {};
  const colors = [CardColor.Red, CardColor.Blue, CardColor.Green, CardColor.Black];

  for (const playerKey of tournament.players) {
    if (playerKey !== gs.player.key) {
      // Pick 2 distinct random colors for AI
      const randomColors = [...colors].sort(() => 0.5 - Math.random()).slice(0, 2);
      botsColors[playerKey] = randomColors;
    }
  }

  const draftState: DraftState = {
    packNumber: 0,
    direction: 1, // Start by passing left
    activeBoosters: {},
    draftedCards: {},
    botsColors,
  };

  // Initialize empty drafted arrays
  for (const playerKey of tournament.players) {
    draftState.draftedCards[playerKey] = [];
    draftState.activeBoosters[playerKey] = [];
  }

  tournament.draftState = draftState;
  tournament.status = TournamentStatus.Drafting;

  openDraftPacks(draftState, tournament);
}

export function openDraftPacks(draftState: DraftState, tournament: Tournament) {
  draftState.packNumber++;
  // Alternating direction:
  // Pack 1: left (1), Pack 2: right (-1), Pack 3: left (1)
  draftState.direction = draftState.packNumber === 2 ? -1 : 1;

  for (const playerKey of tournament.players) {
    // Generate booster from Alpha set by default
    const booster = generateBooster(CardSet.Alpha);
    draftState.activeBoosters[playerKey] = booster.map((c) => c.id);
  }
}

export function processDraftTurn(tournament: Tournament, playerPickId: string) {
  const draftState = tournament.draftState;
  if (!draftState) return;

  // 1. Player pick
  const playerKey = gs.player.key;
  const playerBooster = draftState.activeBoosters[playerKey];
  const pickIndex = playerBooster.indexOf(playerPickId);
  if (pickIndex !== -1) {
    playerBooster.splice(pickIndex, 1);
    draftState.draftedCards[playerKey].push(playerPickId);
  }

  // 2. AI picks
  for (const botKey of tournament.players) {
    if (botKey === playerKey) continue;

    const botBooster = draftState.activeBoosters[botKey];
    if (botBooster.length === 0) continue;

    const preferredColors = draftState.botsColors[botKey];
    // Find cards matching colors
    const matchingCards = botBooster.filter((id: string) => {
      const card = cards[id];
      return (
        card && card.colors?.some((c: { color: CardColor }) => preferredColors.includes(c.color))
      );
    });

    let pickedId = '';
    if (matchingCards.length > 0) {
      pickedId = getRandomFromArray(matchingCards);
    } else {
      pickedId = getRandomFromArray(botBooster);
    }

    const botPickIndex = botBooster.indexOf(pickedId);
    botBooster.splice(botPickIndex, 1);
    draftState.draftedCards[botKey].push(pickedId);
  }

  // 3. Rotate Boosters
  const playersCount = tournament.players.length;
  // If boosters are empty, we don't need to rotate, we open new ones or finish
  if (draftState.activeBoosters[playerKey].length === 0) {
    if (draftState.packNumber < 3) {
      openDraftPacks(draftState, tournament);
    } else {
      tournament.status = TournamentStatus.DeckBuilding;
      autoBuildBotDecks(tournament);
    }
  } else {
    // Rotate
    const newBoosters: Record<string, string[]> = {};
    for (let i = 0; i < playersCount; i++) {
      const current = tournament.players[i];
      // direction: 1 means left (next player)
      let nextIndex = (i + draftState.direction) % playersCount;
      if (nextIndex < 0) nextIndex += playersCount;
      const next = tournament.players[nextIndex];

      newBoosters[next] = draftState.activeBoosters[current];
    }
    draftState.activeBoosters = newBoosters;
  }
}

export function autoBuildBotDecks(tournament: Tournament) {
  const draftState = tournament.draftState;
  if (!draftState) return;

  for (const botKey of tournament.players) {
    if (botKey === gs.player.key) continue;

    const bot = gs.characters[botKey];
    if (!bot) continue;

    const draftedCardIds = draftState.draftedCards[botKey];
    const preferredColors = draftState.botsColors[botKey];

    const mainDeckIds: string[] = [];

    // Pick matching colors first
    const matching = draftedCardIds.filter((id: string) => {
      const card = cards[id];
      return (
        card && card.colors?.some((c: { color: CardColor }) => preferredColors.includes(c.color))
      );
    });

    const others = draftedCardIds.filter((id: string) => {
      const card = cards[id];
      return (
        !card || !card.colors?.some((c: { color: CardColor }) => preferredColors.includes(c.color))
      );
    });

    // Shuffle both
    matching.sort(() => 0.5 - Math.random());
    others.sort(() => 0.5 - Math.random());

    // Fill up to 30
    const needed = 30;

    for (const id of matching) {
      if (mainDeckIds.length < needed) mainDeckIds.push(id);
    }
    for (const id of others) {
      if (mainDeckIds.length < needed) mainDeckIds.push(id);
    }

    // Convert to CardTuples
    const cardTuples = mainDeckIds.reduce(
      (acc, id) => {
        const existing = acc.find((t) => t.cardTemplateId === id);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ cardTemplateId: id, count: 1 });
        }
        return acc;
      },
      [] as { cardTemplateId: string; count: number }[]
    );

    // Specific lands: 1 city, 1 island, 1 mountain, 1 forest
    const landsIds = ['city', 'island', 'mountain', 'forest'];
    const actualLands = landsIds.filter((l) => lands[l]).map((l) => lands[l].id);

    // Overwrite previous draft deck for the bot
    const existingIndex = bot.decks.findIndex((d) => d.key === tournament.format);
    if (existingIndex !== -1) {
      bot.decks.splice(existingIndex, 1);
    }

    const newDeck = {
      key: tournament.format,
      name: `Draft Deck - ${bot.name}`,
      cards: cardTuples,
      lands: actualLands,
      record: { wins: 0, losses: 0, cardResults: {} },
    };

    bot.decks.push(newDeck);
  }
}
