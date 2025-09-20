import type { CardColor } from './enums-battle';
import type {
  Ability,
  CardTemplate,
  EffectTargets,
  Land,
  SpellCard,
  TargetDefinition,
  UnitDeployed,
} from './model-battle';

export type UiState = {
  currentView: UiView;
  navigationVisible: boolean;
  battle: {
    selectedUnit: UnitDeployed | null;
    validTargets: {
      units?: Record<string, boolean>;
      lands?: Record<string, boolean>;
      players?: Record<number, boolean>;
      cells?: Record<string, boolean>;
      cards?: Record<string, boolean>;
    } | null;
    abilityPending: { unit?: UnitDeployed; land?: Land; ability: Ability } | null;
    spellPending: SpellCard | null;
    triggeredAbilityPending: { unit: UnitDeployed; ability: Ability; triggerParams: any } | null;
    selectedTargets: EffectTargets[][];
    currentEffectIndex: number;
    currentTargetIndex: number;
    targetBeingSelected: TargetDefinition | null;
    attackingUnitId: string | null;
    colorBeingIncremented: CardColor | null;
    graveyardModal: {
      visible: boolean;
      playerId: number | null;
    };
    deckModal: {
      visible: boolean;
      playerId: number | null;
    };
    displayChat: boolean;
  };
  collection: {
    editedDeckKey: string | null;
  };
  modal: {
    visible: boolean;
    title: string;
    body: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  cardFullOverlay: {
    visible: boolean;
    card: CardTemplate | null;
  };
  deckSelectionModal: {
    visible: boolean;
    foeKey: string | null;
  };
  shopModal: {
    visible: boolean;
    placeKey: string | null;
  };
  boosterModal: {
    visible: boolean;
    cards: CardTemplate[] | null;
  };
  chat: {
    isStreaming: boolean;
    streamingContent: string;
  };
  tradingWith: string | null;
  rollResults: {
    success: boolean;
    isCritical: boolean;
    roll: number;
    attribute: string;
    difficulty: number;
  }[];
};

export enum UiView {
  CurrentPlace = 'CurrentPlace',
  Battle = 'Battle',
  CardBuilder = 'CardBuilder',
  Analytics = 'Analytics',
  Collection = 'Collection',
  Decks = 'Decks',
  DeckEditor = 'DeckEditor',
  Inventory = 'Inventory',
  Schedule = 'Schedule',
  Player = 'Player',
  Chat = 'Chat',
  Trade = 'Trade',
  Tournament = 'Tournament',
}
