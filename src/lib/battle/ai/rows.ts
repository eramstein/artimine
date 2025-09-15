import { config } from '@/lib/_config/config';
import { bs } from '@/lib/_state';
import { isHumanPlayer } from '../player';
import { landDestructionValue, landLifeValue, playerLifeValue } from './valuations/config';

export function getOpponentPowerPerRow(): Record<number, number> {
  const units = bs.units.filter((u) => isHumanPlayer(u.ownerPlayerId));
  const powerPerRow = units.reduce(
    (acc, u) => {
      acc[u.position.row] = (acc[u.position.row] || 0) + u.power;
      return acc;
    },
    {} as Record<number, number>
  );
  return powerPerRow;
}

// this one takes poison and cleave into account
export function getOpponentUnitDamagePerRow(): Record<number, number> {
  const units = bs.units.filter((u) => isHumanPlayer(u.ownerPlayerId));
  const powerPerRow = units.reduce(
    (acc, u) => {
      const damage = u.power + (u.keywords?.poisonous || 0);
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
  const units = bs.units.filter((u) => isHumanPlayer(u.ownerPlayerId));
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
  const units = bs.units.filter((u) => !isHumanPlayer(u.ownerPlayerId));
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
    const opponentPower = getOpponentPowerPerRow()[row];
    const diff = opponentPower - alliedHealth;
    if (diff <= 0) {
      dangerLevels[row] = 0;
    } else {
      const player = bs.players.filter((p) => !isHumanPlayer(p.id))[0];
      const landInRow = player.lands.find((l) => l.position === row);
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
