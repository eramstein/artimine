import { CardRarity, CardType } from '../_model';
import { type BaseTemplate, type ColorCombo, ColorComboName } from './card-batches';
import { generateCardExtensions } from './llm-card-extension';

const MOCK_BASE_CARDS = [
  {
    type: CardType.Unit,
    cost: 1,
    rarity: CardRarity.Common,
    llmData: {
      name: 'Thistle Hare',
      imageDescription:
        'A lean, moss-colored hare with thorny antlers bounding through a misty glade under the watchful gaze of gnarled oaks',
      suggestedSize: 'small',
      suggestedKeywords: ['haste'],
      suggestedUnitType: 'beast',
    },
  },
  {
    type: CardType.Unit,
    cost: 5,
    rarity: CardRarity.Uncommon,
    llmData: {
      name: 'Wyrmbark Ancestor',
      imageDescription:
        'A towering treeman with bark scorched by dark runes, holding a staff of twisted vinewood, eyes glowing with old sorrow',
      suggestedSize: 'large',
      suggestedKeywords: ['armor', 'regeneration'],
      suggestedUnitType: 'elemental',
    },
  },
  {
    type: CardType.Unit,
    cost: 2,
    rarity: CardRarity.Common,
    llmData: {
      name: 'Rotglade Vermin',
      imageDescription:
        'A bloated rodent-like creature crawling from a moss-covered stump, dripping dark sap from its fangs',
      suggestedSize: 'small',
      suggestedKeywords: ['poisonous'],
      suggestedUnitType: 'monster',
    },
  },
  {
    type: CardType.Unit,
    cost: 8,
    rarity: CardRarity.Rare,
    llmData: {
      name: 'Ashen Wildwyrm',
      imageDescription:
        'A serpentine forest dragon with scorched wings and bark-like scales, wreathed in green fire and wrapped around a ruined stone circle',
      suggestedSize: 'huge',
      suggestedKeywords: ['trample', 'zerk'],
      suggestedUnitType: 'dragon',
    },
  },
];

// TODO:
export function generateCard(baseCard: BaseTemplate = MOCK_BASE_CARDS[0]) {
  // MOCKED for now
  console.log('TODO: generateCard', baseCard);
}
