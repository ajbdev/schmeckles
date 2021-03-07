import { GameState, Player, GemStash, Gem, Card, Tier, CardPile, emptyGemStash } from './Game';
import { Rule, isPlayersTurn, Result, gameIsNotFull, canAffordCard, bankHasEnoughGems, isTakingTwoOrThreeGems, canTakeThreeGems, gemsAreOfSameType, canTakeTwoGems, canReserveCard, gameHasEnoughPlayers, gameHasNotStarted, gameHasStarted, isValidGems } from './Rules';

export enum Action {
  JoinGame = 'JoinGame',
  StartGame = 'StartGame',
  TakeGems = 'TakeGems',
  ReserveCard = 'ReserveCard',
  PurchaseCard = 'PurchaseCard',
}

export interface IAction {
  type?: Action
  player: Player
  rules: Rule[]
  failedRules: Result[]
  checkRules: (gameState: Readonly<GameState>) => boolean
  act(gameState: GameState): void;
}

export abstract class BaseAction implements IAction {
  type?: Action
  player: Player
  rules: Rule[]
  meta: any
  failedRules: Result[]

  constructor(p: Player, meta: any) {
    this.player = p;
    this.rules = [];
    this.meta = meta;
    this.failedRules = [];
  }

  static create(p: Player, t: Action, meta: any) {
    const actionFactoryMap = {
      [Action.JoinGame]: JoinGame,
      [Action.StartGame]: StartGame,
      [Action.TakeGems]: TakeGems,
      [Action.PurchaseCard]: PurchaseCard,
      [Action.ReserveCard]: ReserveCard
    }

    const ActionToBePerformed = actionFactoryMap[t];

    return new ActionToBePerformed(p, {...meta})
  }

  checkRules(gameState: Readonly<GameState>): boolean {
    this.rules.forEach(r => {
      const result = r(gameState);

      if (!result.passed) {
        this.failedRules.push(result);
      }
    });

    if (this.failedRules.length > 0) {
      return false;
    }
    return true;
  }

  nextTurn(gameState: GameState) {
    let turn = gameState.turn + 1;

    if (turn > gameState.players.length) {
      turn = 1;
    }

    gameState.turn = turn;
  }

  abstract act(gameState: GameState): void;
}

const moveGems = (from: GemStash, to: GemStash, amount: GemStash) => {
  Object.keys(from).forEach(gemType => {
    from[gemType as Gem] -= amount[gemType as Gem];
    to[gemType as Gem] += amount[gemType as Gem];
  })
}

export class StartGame extends BaseAction {
  constructor(p: Player, meta: {}) {
    super(p, meta);
    this.type = Action.StartGame;

    this.rules = [
      (g: Readonly<GameState>) => gameHasEnoughPlayers(g.players),
      (g: Readonly<GameState>) => gameHasNotStarted(g.started)
    ]
  }


  act(gameState: GameState) {
    gameState.started = true;
    gameState.turn = 1;
  }
}

export class JoinGame extends BaseAction {
  isContextPlayer: boolean;
  constructor(p: Player, meta: { isContextPlayer: boolean }) {
    super(p, meta)
    this.type = Action.JoinGame;
    this.isContextPlayer = meta.isContextPlayer;
    this.rules = [
      (g: Readonly<GameState>) => gameIsNotFull(g.players),
      (g: Readonly<GameState>) => gameHasNotStarted(g.started)
    ]
  }

  act(gameState: GameState) {
    gameState.players.push(this.player);

    if (this.isContextPlayer) {
      gameState.contextPlayer = this.player;
    }
  }
}

export class TakeGems extends BaseAction {
  gems: GemStash;

  constructor(p: Player, meta: { gems: GemStash }) {
    super(p, meta);

    this.type = Action.TakeGems;
    this.gems = meta.gems;
    this.rules = [
      (g: Readonly<GameState>) => gameHasStarted(g.started),
      (g: Readonly<GameState>) => gameHasEnoughPlayers(g.players),
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.players, g.turn),
      (g: Readonly<GameState>) => bankHasEnoughGems(this.gems, g.gems),
      (g: Readonly<GameState>) => isValidGems(this.gems),
      (g: Readonly<GameState>) => {
        const totalGems = Object.values(this.gems).reduce((a,b) => a+b);

        if (totalGems === 2) {
          const result1 = gemsAreOfSameType(this.gems);

          if (!result1.passed) {
            return result1;
          }

          const gem = Object.keys(this.gems).filter(g => this.gems[g as Gem] === 2)[0]

          return canTakeTwoGems(gem as Gem, g.gems);
        }
        if (totalGems === 3) {
          return canTakeThreeGems(this.gems);
        }

        return isTakingTwoOrThreeGems(totalGems);
      }
    ];
  }

  act(gameState: GameState) {
    moveGems(gameState.gems, this.player.gems, this.gems);
    this.nextTurn(gameState);
  }
}

export class PurchaseCard extends BaseAction {
  cards: Card[];
  index: number;

  constructor(p: Player, meta: { cards: Card[], index: number }) {
    super(p, meta);

    this.type = Action.PurchaseCard;
    this.index = meta.index;
    this.cards = meta.cards;

    this.rules = [
      (g: Readonly<GameState>) => gameHasStarted(g.started),
      (g: Readonly<GameState>) => gameHasEnoughPlayers(g.players),
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.players, g.turn),
      (g: Readonly<GameState>) => { 
        const card = this.cards[this.index];

        return canAffordCard(card, this.player);
      }
    ]
  }

  act(gameState: GameState) {
    const card = this.cards.splice(this.index,1)[0];

    moveGems(this.player.gems, gameState.gems, card.costs);

    if (card.reserved) {
      card.reserved = false;
    }

    this.player.cards.cards.push(card);
    this.nextTurn(gameState);
  }
}

export class ReserveCard extends BaseAction {
  cards: Card[];
  index: number;

  constructor(p: Player, meta: { cards: Card[], index: number }) {
    super(p, meta);

    this.type = Action.ReserveCard;
    this.cards = meta.cards;
    this.index = meta.index;

    this.rules = [
      (g: Readonly<GameState>) => gameHasStarted(g.started),
      (g: Readonly<GameState>) => gameHasEnoughPlayers(g.players),
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.players, g.turn),
      (g: Readonly<GameState>) => canReserveCard(this.player)
    ];
  }

  act(gameState: GameState) {
    const card = this.cards.splice(this.index,1)[0];

    const gems = emptyGemStash();
    gems.star = 1;

    moveGems(gameState.gems, this.player.gems, gems);

    card.reserved = true;

    this.player.reservedCards.push(card);
    this.nextTurn(gameState);
  }
}