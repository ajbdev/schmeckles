import cardsJson from './cards.json';
import noblesJson from './nobles.json';
import namesJson from './names.json';

import { TypedEmitter } from 'tiny-typed-emitter';
import { BaseAction, IAction, Action } from './Actions';
import { classToPlain, plainToClass } from 'class-transformer';
import { computeAction } from './Computer';
import { Player, victoryPoints } from './Player';

export const WIN_THRESHOLD = 15;
export const TURN_SECONDS_WARNING = 150;
export const TURN_SECONDS_TIMEOUT = 180;
export const LOBBY_COUNTDOWN_FROM = 5;

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

export const emptyGemStash = () => ({
    [Gem.Ruby]: 0,
    [Gem.Sapphire]: 0,
    [Gem.Diamond]: 0,
    [Gem.Onyx]: 0,
    [Gem.Emerald]: 0,
    [Gem.Star]: 0
});


const mapNobleValuesJsonToNobleType = (noblesValues: NobleJsonValues[]) => noblesValues.map(
  n => ({
    points: n.points,
    costs: {
      [Gem.Ruby]: n.ruby || 0,
      [Gem.Sapphire]: n.sapphire || 0,
      [Gem.Diamond]: n.diamond || 0,
      [Gem.Onyx]: n.onyx || 0,
      [Gem.Emerald]: n.emerald || 0
    }
  })
);

const mapCardValuesJsonToCardType = (cardValues: CardJsonValues[]) => cardValues.map(
  (c,ix) => new Card(
    ix,
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

export const shuffle = (arr:Array<any>) => 
  [...arr].reduceRight((res,_,__,s) => 
    (res.push(s.splice(0|Math.random()*s.length,1)[0]), res), []);

export class Card {
  id: number;
  points: number;
  gem: Gem;
  tier: Tier;
  costs: GemStash;
  reserved?: boolean;
  drawn: boolean;

  constructor(id: number, points: number, gem: Gem, tier: Tier, costs: GemStash) {
    this.id = id;
    this.points = points;
    this.gem = gem;
    this.tier = tier;
    this.costs = costs;
    this.drawn = false;
  }
}

export const drawCards = (from: CardPile, destination: CardPile, n: number, atIndex: number = -1) => {
  const cards = from.cards.splice(0, n);

  cards.forEach(c => {
    c.drawn = true;
    destination.cards.splice(atIndex, 0, c);
  });
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
}

export type PlayerTurn = number;

export class GameState {
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
  ended: boolean;
  turn: PlayerTurn;
  fullTurns: PlayerTurn;
  background?: string;
  turnTimer?: ReturnType<typeof setInterval>;
  turnSeconds: number;
  gameSeconds: number;
  gameTimer?: ReturnType<typeof setInterval>

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
    this.fullTurns = 0;
    this.started = false;
    this.ended = false;
    this.turnSeconds = 0;
    this.gameSeconds = 0;

    this.gems = {
      [Gem.Ruby]: 7,
      [Gem.Sapphire]: 7,
      [Gem.Diamond]: 7,
      [Gem.Onyx]: 7,
      [Gem.Emerald]: 7,
      [Gem.Star]: 5
    }
  }

  getPlayer(id: string) {
    return this.players.find(p => p.id === id);
  }

  addPlayer(p: Player) {
    p.turn = this.players.length+1;
    this.players.push(p);
  }

  getTierCards(t: Tier) {
    switch (t) {
      case Tier.I:
        return this.tierICards;
        break;
      case Tier.II:
        return this.tierIICards;
        break;
      case Tier.III:
        return this.tierIIICards;
        break;
    }
  }

  getDrawPileCards(t: Tier) {
    switch (t) {
      case Tier.I:
        return this.tierIDrawPile;
        break;
      case Tier.II:
        return this.tierIIDrawPile;
        break;
      case Tier.III:
        return this.tierIIIDrawPile;
        break;
    }
  }
  
  awardNobles(player: Player) {
    this.nobles.forEach((noble, ix) => {
      const canAfford = Object.keys(noble.costs).filter(gemType => noble.costs[gemType as Gem] > player.cards.cards.filter(c => c.gem === gemType as Gem).length).length === 0;

      if (canAfford) {
        const noble = this.nobles.splice(ix, 1)[0];
        player.nobles.push(noble);
      }
    });
  }

  checkForWinner() {
    const eligible = this.players.filter(p => victoryPoints(p) >= WIN_THRESHOLD);

    if (eligible.length === 1) {
      this.ended = true;
      eligible[0].winner = true;
    }

    if (eligible.length > 1) {
      const sorted = eligible.sort((a, b) => victoryPoints(a) > victoryPoints(b) ? -1 : 1);

      if (victoryPoints(sorted[0]) > victoryPoints(sorted[1])) {
        this.ended = true;
        sorted[0].winner = true;
      }
    }
  }
  
  drawVisibleCards() {
    drawCards(this.tierIDrawPile, this.tierICards, 4 - this.tierICards.cards.length);
    drawCards(this.tierIIDrawPile, this.tierIICards, 4 - this.tierIICards.cards.length);
    drawCards(this.tierIIIDrawPile, this.tierIIICards, 4 - this.tierIIICards.cards.length);
  }
}

export enum GameEvent { 
  ActionReceived = 'ActionReceived', 
  ActionStarted = 'ActionStarted', 
  StateUpdated = 'StateUpdated',
  ActionFailed = 'ActionFailed'
}

interface GameEvents {
  [GameEvent.ActionReceived]: (a: BaseAction, computedGameState: GameState) => void
  [GameEvent.ActionStarted]: (a: BaseAction) => void
  [GameEvent.StateUpdated]: (gs: GameState) => void
  [GameEvent.ActionFailed]: (gs: BaseAction) => void
}

export default class Game {
  gameState: GameState;
  actionLog: IAction[];
  events: TypedEmitter;

  private static instance: Game | undefined;

  private constructor() {
    this.gameState = new GameState();
    this.actionLog = [];
    this.events = new TypedEmitter<GameEvents>();
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }

    return Game.instance;
  }

  serialize() {
    return classToPlain(this.gameState);
  }

  public static unserialize(serializedGameState: any) {
     return plainToClass(GameState, serializedGameState);
  }

  updateGameState(gs: GameState) {
    this.gameState = gs;

    this.events.emit(GameEvent.StateUpdated, gs);
  }

  getPlayer(playerId: string) {
    return this.gameState.players.filter(p => p.id === playerId)[0];
  }

  cleanup() {
    this.events.removeAllListeners();
  }

  sendAction(player: Player, actionType: Action, data: any): BaseAction {
    const action = BaseAction.create(
      player,
      actionType,
      data
    );  

    this.events.emit(GameEvent.ActionStarted, action);

    this.receiveAction(action);

    return action;
  }

  computerAction(player: Player) {
    const move = computeAction(player, this.gameState);

    this.sendAction(
      player, 
      move.actionType,
      move.data
    )
  }

  public static reset(): Game {
    Game.instance = undefined;

    return this.getInstance();
  }

  resetTurnTimer() {
    if (this.gameState.turnTimer) {
      clearInterval(this.gameState.turnTimer);
      this.gameState.turnTimer = undefined;
      this.gameState.turnSeconds = 0;
    }
  }

  startTurnTimer() {
    this.resetTurnTimer();

    this.gameState.turnTimer = setInterval(() => {
      this.gameState.turnSeconds++;

      this.updateGameState(this.gameState);
    }, 1000);
  }

  receiveAction(action: IAction) {
    const previousTurn = this.gameState.turn;

    if (action.checkRules(this.gameState)) {
      action.act(this.gameState);

      this.actionLog.push(action);
  
      this.events.emit(GameEvent.ActionReceived, action, this.gameState);
    } else {
      this.events.emit(GameEvent.ActionFailed, action);
    }

    const nextPlayer = this.gameState.players[this.gameState.turn-1];
    if (nextPlayer.computer) {
      setTimeout(() => this.computerAction(nextPlayer), 3000);
    }

    if (previousTurn !== this.gameState.turn) {
      this.startTurnTimer();
    }
  }
}