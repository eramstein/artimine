export enum CardType {
  Unit = 'unit',
  Spell = 'spell',
}

export enum CardRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Legendary = 'legendary',
}
export enum CardColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Black = 'black',
}

export enum TriggerType {
  Static = 'Static',
  Activated = 'Activated',
  BeforeDamage = 'Before Damage',
  AfterCombat = 'After Combat',
  AfterMove = 'After Moving',
  BeforeMove = 'Before Moving',
  OnDeath = 'On Death',
  OnDeploy = 'On Deploy',
  OnTurnStart = 'On Turn Start',
}

export enum TargetType {
  Self = 'self',
  Ennemies = 'unit_ennemies',
  Allies = 'unit_allies',
  Cell = 'cell',
  Units = 'unit',
  AllyCell = 'cell_ally',
  EmptyCell = 'cell_empty',
  GraveyardCard = 'graveyard_card',
  Land = 'land',
  Player = 'player',
}

export enum StatusType {
  Mezz = 'mezz',
  Stun = 'stun',
  Root = 'root',
}

export enum UnitType {
  Mushroom = 'mushroom',
  Beast = 'beast',
  Human = 'human',
  Dwarf = 'dwarf',
  Monster = 'monster',
  Elemental = 'elemental',
  Spirit = 'spirit',
  Dragon = 'dragon',
  Angel = 'angel',
  Demon = 'demon',
  Halfing = 'halfing',
  Plant = 'plant',
  Mechanical = 'mechanical',
}

export enum CounterType {
  Growth = 'growth',
  Decay = 'decay',
  Energy = 'energy',
  Rage = 'rage',
}
