import cardsJson from './cards.json';
import noblesJson from './nobles.json';

interface NobleJsonValues {
  points: number;
  diamond: number | null;
  sapphire: number | null;
  emerald: number | null;
  ruby: number | null;
  onyx: number | null;
}

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

export enum Gem {
  Ruby = 'ruby', 
  Sapphire = 'sapphire', 
  Onyx = 'onyx', 
  Emerald = 'emerald', 
  Diamond = 'diamond'
}

export enum Tier {
  I, II, III
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

const mapNobleValuesJsonToNobleType = (noblesValues: NobleJsonValues[]) => noblesValues.map(
  n => {
    return {
      points: n.points,
      costs: {
        [Gem.Ruby]: n.ruby || 0,
        [Gem.Sapphire]: n.sapphire || 0,
        [Gem.Diamond]: n.diamond || 0,
        [Gem.Onyx]: n.onyx || 0,
        [Gem.Emerald]: n.emerald || 0
      }
    }
  }
);

const mapCardValuesJsonToCardType = (cardValues: CardJsonValues[]) => cardValues.map(
  c => new Card(
    c.points || 0,
    Gem[c.gem as keyof typeof Gem],
    tierMap[c.tier-1],
    {
      [Gem.Ruby]: c.ruby || 0,
      [Gem.Sapphire]: c.sapphire || 0,
      [Gem.Diamond]: c.diamond || 0,
      [Gem.Onyx]: c.onyx || 0,
      [Gem.Emerald]: c.emerald || 0
    }
  )
)

const shuffle = (arr:Array<any>) => 
  [...arr].reduceRight((res,_,__,s) => 
    (res.push(s.splice(0|Math.random()*s.length,1)[0]), res), []);

const tierMap = [ Tier.I, Tier.II, Tier.III ];

export class Card {
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

export class CardPile {
  cards: Card[];
  tier: Tier;
  
  constructor(tier: Tier, cards: Card[]) {
    this.tier = tier;
    this.cards = shuffle(cards);
  }
}

export class GameState  {
  tierICards: CardPile;
  tierIICards: CardPile;
  tierIIICards: CardPile;
  tierIDrawPile: CardPile;
  tierIIDrawPile: CardPile;
  tierIIIDrawPile: CardPile;
  nobles: Noble[];
  gems: GemStash;

  constructor() {
    const cards = mapCardValuesJsonToCardType(cardsJson);
    const nobles = shuffle(mapNobleValuesJsonToNobleType(noblesJson));

    this.nobles = nobles.slice(0, 3);

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
