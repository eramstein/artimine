import { CardColor, CardRarity, CardType } from '../../lib/_model';

export const MOCK_BASE_CARDS = [
  {
    type: CardType.Unit,
    cost: 1,
    colors: [
      {
        color: CardColor.Green,
        count: 1,
      },
      {
        color: CardColor.Red,
        count: 1,
      },
    ],
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
    colors: [
      {
        color: CardColor.Green,
        count: 4,
      },
    ],
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
    colors: [
      {
        color: CardColor.Green,
        count: 1,
      },
      {
        color: CardColor.Black,
        count: 1,
      },
    ],
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
    colors: [
      {
        color: CardColor.Green,
        count: 3,
      },
    ],
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

export const MOCK_LLM_OUTPUT = [
  {
    name: 'Thistle Hare',
    imageDescription:
      'A lean, moss-colored hare with thorny antlers bounding through a misty glade under the watchful gaze of gnarled oaks',
    suggestedSize: 'small',
    suggestedKeywords: ['haste'],
    suggestedUnitType: 'beast',
  },
  {
    name: 'Wyrmbark Ancestor',
    imageDescription:
      'A towering treeman with bark scorched by dark runes, holding a staff of twisted vinewood, eyes glowing with old sorrow',
    suggestedSize: 'large',
    suggestedKeywords: ['armor', 'regeneration'],
    suggestedUnitType: 'elemental',
  },
  {
    name: 'Rotglade Vermin',
    imageDescription:
      'A bloated rodent-like creature crawling from a moss-covered stump, dripping dark sap from its fangs',
    suggestedSize: 'small',
    suggestedKeywords: ['poisonous'],
    suggestedUnitType: 'monster',
  },
  {
    name: 'Ashen Wildwyrm',
    imageDescription:
      'A serpentine forest dragon with scorched wings and bark-like scales, wreathed in green fire and wrapped around a ruined stone circle',
    suggestedSize: 'huge',
    suggestedKeywords: ['trample', 'zerk'],
    suggestedUnitType: 'dragon',
  },
];
