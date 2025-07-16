export enum CardType {
  Unit = 'unit',
  Spell = 'spell',
}

export enum CardRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}
export enum CardColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Black = 'black',
}

export enum TriggerType {
  Static = 'static',
  Activated = 'activated',
  BeforeDamage = 'beforeDamage',
  AfterCombat = 'afterCombat',
  AfterMove = 'afterMove',
  BeforeMove = 'beforeMove',
  AfterDeath = 'afterDeath',
  OnDeploy = 'onDeploy',
  OnTurnStart = 'onTurnStart',
}

export enum TargetType {
  Foe = 'foe',
  Ally = 'ally',
  Any = 'any',
  Self = 'self',
  EmptyCell = 'emptyCell',
  EmptyAllyCell = 'emptyAllyCell',
}

export enum StatusType {
  Mezz = 'mezz',
  Stun = 'stun',
  Root = 'root',
}
