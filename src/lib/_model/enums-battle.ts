export enum CardType {
  Unit = 'unit',
  Spell = 'spell',
  Land = 'land',
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
  OnReach = 'On Reach',
  OnCardDrawn = 'On Card Drawn',
}

export enum TargetType {
  Self = 'self',
  Ennemies = 'unit_ennemies',
  Allies = 'unit_allies',
  Cell = 'cell',
  Units = 'unit',
  AllyCell = 'cell_ally',
  EnemyCell = 'cell_enemy',
  EmptyCell = 'cell_empty',
  HandCard = 'hand_card',
  GraveyardCard = 'graveyard_card',
  DeckCard = 'deck_card',
  Land = 'land',
  Player = 'player',
}

export enum StatusType {
  Mezz = 'mezz',
  Stun = 'stun',
  Root = 'root',
  Daze = 'daze',
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
  Demon = 'demon',
  Halfing = 'halfing',
  Plant = 'plant',
  Construct = 'construct',
  Building = 'building',
}

export enum CounterType {
  Growth = 'growth',
  Decay = 'decay',
  Energy = 'energy',
  Rage = 'rage',
}
