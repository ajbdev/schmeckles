import cardsJson from './cards.json';
import noblesJson from './nobles.json';
import { BaseAction, IAction, Action } from './Actions';

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

const emptyGemStash = () => {
  return {
    [Gem.Ruby]: 0,
    [Gem.Sapphire]: 0,
    [Gem.Diamond]: 0,
    [Gem.Onyx]: 0,
    [Gem.Emerald]: 0,
    [Gem.Star]: 0
  }
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
  tier?: Tier;
  
  constructor(tier?: Tier, cards?: Card[]) {
    if (tier) this.tier = tier;

    if (cards) {
      this.cards = shuffle(cards);
    } else {
      this.cards = [];
    }
  }

  draw(n: number, destination: CardPile) {
    this.cards.splice(0, n).forEach(c => destination.cards.push(c));
  }
}

export type PlayerTurn = number;

export class GameState  {
  tierICards: CardPile;
  tierIICards: CardPile;
  tierIIICards: CardPile;
  tierIDrawPile: CardPile;
  tierIIDrawPile: CardPile;
  tierIIIDrawPile: CardPile;
  nobles: Noble[];
  gems: GemStash;
  players: Player[];
  turn: PlayerTurn

  constructor() {
    const cards = mapCardValuesJsonToCardType(cardsJson);
    const nobles = shuffle(mapNobleValuesJsonToNobleType(noblesJson));

    this.players = [];
    this.nobles = nobles.splice(0, 3);

    this.tierICards = new CardPile(Tier.I, []);
    this.tierIICards = new CardPile(Tier.II, []);
    this.tierIIICards = new CardPile(Tier.III, []);

    this.tierIDrawPile = new CardPile(Tier.I, cards.filter(c => c.tier = Tier.I));
    this.tierIIDrawPile = new CardPile(Tier.II, cards.filter(c => c.tier = Tier.II));
    this.tierIIIDrawPile = new CardPile(Tier.III, cards.filter(c => c.tier = Tier.III));

    this.drawVisibleCards();
    this.turn = 1;

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
  id: string;
  name: string;
  position: PlayerTurn;
  gems: GemStash;
  cards: CardPile;
  nobles: Noble[];

  constructor(name: string, position: PlayerTurn) {    
    this.id = name;
    this.name = name;
    this.position = position;
    this.gems = emptyGemStash();
    this.cards = new CardPile();
    this.nobles = [];

  }
}


export default class Game {
  gameState: GameState;
  private static instance: Game;
  private onStateUpdateCallback: ((gameState: GameState) => void) | null;

  private constructor() {
    this.gameState = new GameState();
    this.onStateUpdateCallback = null;
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }

    return Game.instance;
  }

  onStateUpdate(callback: (gameState: GameState) => void):void {
    this.onStateUpdateCallback = callback;
  }

  sendAction(playerId: string, actionType: string, data: any) {
    const action = BaseAction.create(
      this.gameState.players.filter(p => p.id === playerId)[0],
      Action[actionType as keyof typeof Action],
      data
    )

    this.receiveAction(action);
  }

  receiveAction(action: IAction) {
    if (action.checkRules(this.gameState)) {
      action.act(this.gameState);
    } else {
      action.failedRules.map(a => alert(a.message));
    }
    if (this.onStateUpdateCallback) {
      this.onStateUpdateCallback(this.gameState);
    }
  }
}