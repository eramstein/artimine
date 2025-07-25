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
  BeforeDamage = 'before damage',
  AfterCombat = 'after combat',
  AfterMove = 'after moving',
  BeforeMove = 'before moving',
  AfterDeath = 'after death',
  OnDeploy = 'on deploy',
  OnTurnStart = 'on turn start',
}

export enum TargetType {
  Self = 'self',
  Unit = 'unit',
  Cell = 'cell',
  Land = 'land',
  Player = 'player',
  GraveyardCard = 'graveyardCard',
}

export enum StatusType {
  Mezz = 'mezz',
  Stun = 'stun',
  Root = 'root',
}

export enum UnitType {
  Mushroom = 'mushroom',
}

export enum CounterType {
  Growth = 'growth',
  Decay = 'decay',
  Energy = 'energy',
  Rage = 'rage',
}
