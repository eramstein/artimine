import { config } from '@/lib/_config/config';
import { bs } from '@/lib/_state';
import { landDestructionValue, landLifeValue, playerLifeValue } from './valuations/config';

function getPowerPerRow(opponent: boolean = true): Record<number, number> {
  const units = opponent
    ? bs.units.filter((u) => u.ownerPlayerId === 0)
    : bs.units.filter((u) => u.ownerPlayerId !== 0);
  const powerPerRow = units.reduce(
    (acc, u) => {
      acc[u.position.row] = (acc[u.position.row] || 0) + u.power + (u.counters?.rage || 0);
      return acc;
    },
    {} as Record<number, number>
  );
  return powerPerRow;
}

// this one takes poison and cleave into account
export function getOpponentUnitDamagePerRow(): Record<number, number> {
  const units = bs.units.filter((u) => u.ownerPlayerId === 0);
  const powerPerRow = units.reduce(
    (acc, u) => {
      const damage = u.power + (u.counters?.rage || 0) + (u.keywords?.poisonous || 0);
      acc[u.position.row] = (acc[u.position.row] || 0) + damage;
      if (u.keywords?.cleave) {
        acc[u.position.row - 1] = (acc[u.position.row - 1] || 0) + damage;
        acc[u.position.row + 1] = (acc[u.position.row + 1] || 0) + damage;
      }
      return acc;
    },
    {} as Record<number, number>
  );
  return powerPerRow;
}

export function getOpponentCountPerRow(): Record<number, number> {
  const units = bs.units.filter((u) => u.ownerPlayerId === 0);
  const countPerRow = units.reduce(
    (acc, u) => {
      acc[u.position.row] = (acc[u.position.row] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );
  return countPerRow;
}

export function getAlliedHealthPerRow(): Record<number, number> {
  const units = bs.units.filter((u) => u.ownerPlayerId !== 0);
  const healthPerRow = units.reduce(
    (acc, u) => {
      acc[u.position.row] = (acc[u.position.row] || 0) + u.health;
      return acc;
    },
    {} as Record<number, number>
  );
  return healthPerRow;
}

export function getDangerLevelPerRow(): Record<number, number> {
  const dangerLevels: Record<number, number> = {};
  for (let row = 0; row < config.boardRows; row++) {
    const alliedHealth = getAlliedHealthPerRow()[row];
    const opponentPower = getPowerPerRow()[row];
    const diff = opponentPower - alliedHealth;
    if (diff <= 0) {
      dangerLevels[row] = 0;
    } else {
      const player = bs.players[1];
      const landInRow = player.lands.find((l) => l.position === row && !l.isRuined);
      if (landInRow) {
        dangerLevels[row] =
          landInRow.health <= opponentPower ? landDestructionValue : landLifeValue;
      } else {
        dangerLevels[row] = player.life <= opponentPower ? Infinity : playerLifeValue;
      }
    }
  }
  return dangerLevels;
}

// look for a row where we have enough power to win if we clear the blockers
export function lookForLethalRow(): number | null {
  const opponent = bs.players[0];
  for (let row = 0; row < config.boardRows; row++) {
    const powerInRow = getPowerPerRow(false)[row];
    if (powerInRow < opponent.life) {
      continue;
    }
    const land = opponent.lands.find((l) => l.position === row);
    if (!land) {
      return row;
    } else {
      if (land.health + opponent.life <= powerInRow) {
        return row;
      }
    }
  }
  return null;
}
