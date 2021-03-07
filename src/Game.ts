import cardsJson from './cards.json';
import noblesJson from './nobles.json';
import { BaseAction, IAction, Action } from './Actions';
import { serialize as _serialize, plainToClass } from 'class-transformer';

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

export const emptyGemStash = () => {
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
  reserved?: boolean

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
  started: boolean;
  contextPlayer: Player | undefined;
  turn: PlayerTurn;

  constructor() {
    const cards = mapCardValuesJsonToCardType(cardsJson);
    const nobles = shuffle(mapNobleValuesJsonToNobleType(noblesJson));

    this.players = [];
    this.nobles = nobles.splice(0, 3);

    this.tierICards = new CardPile(Tier.I, []);
    this.tierIICards = new CardPile(Tier.II, []);
    this.tierIIICards = new CardPile(Tier.III, []);

    this.tierIDrawPile = new CardPile(Tier.I, cards.filter(c => c.tier === Tier.I));
    this.tierIIDrawPile = new CardPile(Tier.II, cards.filter(c => c.tier === Tier.II));
    this.tierIIIDrawPile = new CardPile(Tier.III, cards.filter(c => c.tier === Tier.III));

    this.drawVisibleCards();
    this.turn = 1;
    this.started = false;

    this.gems = {
      [Gem.Ruby]: 7,
      [Gem.Sapphire]: 7,
      [Gem.Diamond]: 7,
      [Gem.Onyx]: 7,
      [Gem.Emerald]: 7,
      [Gem.Star]: 5
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
  gems: GemStash;
  cards: CardPile;
  reservedCards: Card[];
  nobles: Noble[];
  connected: boolean;
  connectionId: string;

  constructor(name: string) {    
    this.id = name;
    this.name = name;
    this.gems = emptyGemStash();
    this.cards = new CardPile();
    this.reservedCards = [];
    this.nobles = [];
    this.connected = false;
    this.connectionId = '';
  }
}


export default class Game {
  gameState: GameState;
  private static instance: Game | undefined;
  private onStateUpdateCallback: ((gameState: GameState) => void) | null;
  private onActionCallback: ((a: BaseAction) => void) | null;

  private constructor() {
    this.gameState = new GameState();
    this.onStateUpdateCallback = null;
    this.onActionCallback = null;
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }

    return Game.instance;
  }

  serialize() {
    return _serialize(this);
  }

  public static unserialize(serializedGameState: any) {
     return plainToClass(GameState, serializedGameState);
  }

  updateGameState(gs: GameState) {
    this.gameState = gs;
    if (this.onStateUpdateCallback) {
      this.onStateUpdateCallback(gs);
    }
  }

  getPlayer(playerId: string) {
    return this.gameState.players.filter(p => p.id === playerId)[0];
  }

  onStateUpdate(callback: (gameState: GameState) => void | null):void {
    this.onStateUpdateCallback = callback;
  }

  onAction(callback: (a: BaseAction) => void | null):void {
    this.onActionCallback = callback;
  }

  cleanup() {
    this.onStateUpdateCallback = null;
    this.onActionCallback = null;
  }

  sendAction(player: Player, actionType: Action, data: any): BaseAction {
    const action = BaseAction.create(
      player,
      actionType,
      data
    );  

    if (this.onActionCallback) {
      this.onActionCallback(action);
    }

    this.receiveAction(action);

    return action;
  }

  public static reset(): Game {
    Game.instance = undefined;

    return this.getInstance();
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