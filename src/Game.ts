

const cardsJson: CardJsonValues[] = require('./cards.json');
const noblesJson: NobleJsonValues[] = require('./nobles.json');

interface NobleJsonValues {
  points: number;
  diamond: number | null;
  sapphire: number | null;
  emerald: number | null;
  ruby: number | null;
  onyx: number | null;
}

interface CardJsonValues {
  gem: 'emerald' | 'sapphire' | 'diamond' | 'ruby' | 'onyx';
  tier: number;
  points: number | null;
  diamond: number | null;
  sapphire: number | null;
  emerald: number | null;
  ruby: number | null;
  onyx: number | null;
}

export enum Gem {
  Ruby, Sapphire, Onyx, Emerald, Diamond
}

export enum Tier {
  I, II, III
}

class Card {
  points: number;
  gem: Gem;
  tier: Tier;
  costs: GemStash;

  constructor(points: number, gem: Gem, tier: Tier, costs: GemStash) {
    this.points = points;
    this.gem = gem;
    this.tier = tier;
    this.costs = costs;
  }
}

class CardPile {
  cards: Card[];
  tier: Tier;
  
  constructor(tier: Tier, cards: Card[]) {
    this.tier = tier;
    this.cards = cards;
  }
}

export interface Noble {
  points: number;
  costs: GemStash;
}

export interface GemStash {
  [Gem.Ruby]: number;
  [Gem.Sapphire]: number;
  [Gem.Diamond]: number;
  [Gem.Onyx]: number;
  [Gem.Emerald]: number;
}

const stringToGemMap = {
  'ruby': Gem.Ruby,
  'emerald': Gem.Emerald,
  'diamond': Gem.Diamond,
  'onyx': Gem.Onyx,
  'sapphire': Gem.Sapphire
};

const numberToTierMap = [ Tier.I, Tier.II, Tier.III ];

const mapCardValuesJsonToCardType = (cardValues: CardJsonValues[]) => cardValues.map(
  c => new Card(
    c.points || 0,
    stringToGemMap[c.gem],
    numberToTierMap[c.tier-1],
    {
      [Gem.Ruby]: c.ruby || 0,
      [Gem.Sapphire]: c.sapphire || 0,
      [Gem.Diamond]: c.diamond || 0,
      [Gem.Onyx]: c.onyx || 0,
      [Gem.Emerald]: c.emerald || 0
    }
  )
)


export class Game  {
  protected tierICards: CardPile;
  protected tierIICards: CardPile;
  protected tierIIICards: CardPile;
  protected tierIDrawPile: CardPile;
  protected tierIIDrawPile: CardPile;
  protected tierIIIDrawPile: CardPile;
  protected nobles: Noble[];
  protected gems: GemStash;

  constructor() {
    const cards = mapCardValuesJsonToCardType(cardsJson);

    this.tierICards = new CardPile(Tier.I, []);
    this.tierIICards = new CardPile(Tier.II, []);
    this.tierIIICards = new CardPile(Tier.III, []);

    this.tierIDrawPile = new CardPile(Tier.I, cards.filter(c => c.tier = Tier.I));
    this.tierIIDrawPile = new CardPile(Tier.II, cards.filter(c => c.tier = Tier.II));
    this.tierIIIDrawPile = new CardPile(Tier.III, cards.filter(c => c.tier = Tier.III));

    this.gems = {
      [Gem.Ruby]: 6,
      [Gem.Sapphire]: 6,
      [Gem.Diamond]: 6,
      [Gem.Onyx]: 6,
      [Gem.Emerald]: 6
    }

  }
}
