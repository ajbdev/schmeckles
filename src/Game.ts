

const cardsJson: CardJsonValues[] = require('./cardvalues.json');

interface CardJsonValues {
  gem: string;
  tier: number;
  points: number | null;
  diamond: number | null;
  sapphire: number | null;
  emerald: number | null;
  ruby: number | null;
  onyx: number | null;
}

interface GemCost {
  diamond: number;
  sapphire: number;
  emerald: number;
  ruby: number;
  onyx: number;
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
  costs: GemCost;

  constructor(points: number, gem: Gem, tier: Tier, costs: GemCost) {
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
  costs: GemCost[];
}

export interface GemStash {
  rubies: number;
  sapphires: number;
  diamonds: number;
  onyxes: number;
  emeralds: number;
}

const stringToGemMap = {
  'ruby': Gem.Ruby,
  'emerald': Gem.Emerald,
  'diamond': Gem.Diamond,
  'onyx': Gem.Onyx,
  'sapphire': Gem.Sapphire
};

const numberToTierMap = [ undefined, Tier.I, Tier.II, Tier.III ];

const mapCardValuesJsonToCardType = (cardValues: CardJsonValues[]) => cardValues.map(
  c => new Card(
    c.points,
    stringToGemMap(c.gem),
    numberToTierMap[c.tier],

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
    this.tierIIDrawPile = new CardPile(Tier.II, []);
    this.tierIIIDrawPile = new CardPile(Tier.III, []);

  }
}

interface IPlayer {
  name: string;
  cards: Card[];
  nobles: Noble[];
  gems: GemStash;
}

export class Player implements IPlayer {
  name: string = '';
  cards: Card[] = [];
  nobles: Noble[] = [];
  gems: GemStash = {
    rubies: 0,
    sapphires: 0,
    diamonds: 0,
    onyxes: 0,
    emeralds: 0
  }
}