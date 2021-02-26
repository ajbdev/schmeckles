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
  Diamond = 'diamond',
  Star = 'star'
}

export enum Tier {
  I = 1, 
  II = 2, 
  III = 3
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
  [Gem.Star]: number;
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
    c.gem as Gem,
    c.tier as Tier,
    {
      [Gem.Ruby]: c.ruby || 0,
      [Gem.Sapphire]: c.sapphire || 0,
      [Gem.Diamond]: c.diamond || 0,
      [Gem.Onyx]: c.onyx || 0,
      [Gem.Emerald]: c.emerald || 0,
      [Gem.Star]: 0
    }
  )
)

const shuffle = (arr:Array<any>) => 
  [...arr].reduceRight((res,_,__,s) => 
    (res.push(s.splice(0|Math.random()*s.length,1)[0]), res), []);

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

  draw(n: number, destination: CardPile) {
    this.cards.splice(0, n).forEach(c => destination.cards.push(c));
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

    this.nobles = nobles.splice(0, 3);

    this.tierICards = new CardPile(Tier.I, []);
    this.tierIICards = new CardPile(Tier.II, []);
    this.tierIIICards = new CardPile(Tier.III, []);

    this.tierIDrawPile = new CardPile(Tier.I, cards.filter(c => c.tier = Tier.I));
    this.tierIIDrawPile = new CardPile(Tier.II, cards.filter(c => c.tier = Tier.II));
    this.tierIIIDrawPile = new CardPile(Tier.III, cards.filter(c => c.tier = Tier.III));

    this.drawVisibleCards();

    this.gems = {
      [Gem.Ruby]: 6,
      [Gem.Sapphire]: 6,
      [Gem.Diamond]: 6,
      [Gem.Onyx]: 6,
      [Gem.Emerald]: 6,
      [Gem.Star]: 6
    }
  }

  drawVisibleCards() {
    this.tierIDrawPile.draw(4-this.tierICards.cards.length, this.tierICards);
    this.tierIIDrawPile.draw(4-this.tierIICards.cards.length, this.tierIICards);
    this.tierIIIDrawPile.draw(4-this.tierIIICards.cards.length, this.tierIIICards);
  }
}


export class Player {
  name: string;
  position: number;

  constructor(name: string, position: number) {    
    this.name = name;
    this.position = position;
  }
}

enum Actions {
  JoinGame = 0,
  ExitGame = 1,
  TakeGems = 2,
  ReserveCard = 3,
  PurchaseCard = 4
}

interface Action {
  type: Actions
}

interface JoinGameAction extends Action {}
interface ExitGameAction extends Action {}
interface TakeGemsAction extends Action {}
interface ReserveCardAction extends Action {}
interface PurchaseCardAction extends Action {}

class Actor {
  act(action: Action, player: Player) {
    
  }
}

export default class Game {
  gameState: GameState;

  constructor() {
    this.gameState = new GameState();
  }

}