import { config } from '../_config';
import { gs } from '../_state';
import { clamp, getRandomInteger } from '../_utils/random';

const range = [1, 10];

const outcomes = {
  1: 'Critical Failure: The player comes across as deeply offensive, threatening, or utterly pathetic. Strong hostility, disgust, or mockery; you may even refuse to engage.',
  2: 'Very Low: The player seems irritating, suspicious, or rude. You are dismissive, impatient, and reluctant to help.',
  3: 'Low: The player seems awkward or unconvincing. You are skeptical, guarded, and not inclined to cooperate.',
  4: 'Below Average: The player is a bit off-putting or unremarkable. You treat them with mild disinterest or detachment.',
  5: 'Neutral: The player makes no strong impression. You respond in a straightforward, ordinary, businesslike manner.',
  6: 'Slightly Positive: The player seems modestly likable or trustworthy. You are willing to listen and engage politely.',
  7: 'Good: The player seems charming and persuasive. You are friendly, more willing to talk, and somewhat cooperative.',
  8: 'Very Good: The player seems notably impressive, likable, or magnetic. You show warmth and receptiveness, leaning toward helping them.',
  9: 'Excellent: The player is strikingly charismatic. You admire or respect them, feel trust, and are eager to cooperate.',
  10: 'Critical Success: The player is dazzlingly charismatic, beyond ordinary human charm. You are strongly drawn to them, possibly awed, enamored, or inspired, and extremely eager to assist.',
};

export function getCharismaRollPrompt(roll?: number) {
  if (!roll) {
    return '';
  }
  return `
    ${outcomes[roll as keyof typeof outcomes].replace('The player', gs.player.name)}
  `;
}

export function getCharismaRoll() {
  const bonusRoll = getRandomInteger(0, config.attributesMaxValue);
  let bonus = 0;
  if (bonusRoll <= gs.player.attributes.charisma) {
    bonus = 1;
  }
  if (bonusRoll <= gs.player.attributes.charisma / 2) {
    bonus = 2;
  }
  if (bonusRoll <= gs.player.attributes.charisma / 3) {
    bonus = 3;
  }
  return clamp(getRandomInteger(range[0], range[1]) + bonus, range[0], range[1]);
}
