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
  Foe = 'ennemy unit',
  Ally = 'allied unit',
  Any = 'unit',
  Self = 'self',
  EmptyCell = 'emptyCell',
  EmptyAllyCell = 'emptyAllyCell',
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
