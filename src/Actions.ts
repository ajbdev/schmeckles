import { Card, drawCards, emptyGemStash, GameState, Gem, GemStash } from './Game';
import { Player } from './Player';
import { bankHasEnoughGems, canAffordCard, canReserveCard, canTakeThreeGems, canTakeTwoGems, gameHasEnoughPlayers, gameHasNotStarted, gameHasStarted, gameIsNotFull, gatherGemsForPurchase, gemsAreOfSameType, isPlayersTurn, isTakingTwoOrThreeGems, isValidGems, Result, Rule, tenGemsMax } from './Rules';

export enum Action {
  JoinGame = 'JoinGame',
  StartGame = 'StartGame',
  TakeGems = 'TakeGems',
  ReserveCard = 'ReserveCard',
  PurchaseCard = 'PurchaseCard',
  PassTurn = 'PassTurn'
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
      [Action.ReserveCard]: ReserveCard,
      [Action.PassTurn]: PassTurn
    }

    const ActionToBePerformed = actionFactoryMap[t];

    return new ActionToBePerformed(p, {...meta})
  }

  checkRules(gameState: Readonly<GameState>): boolean {
    this.rules.forEach(rule => {
      const result = rule(gameState);

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
      gameState.fullTurns++;
      gameState.checkForWinner();
    }

    gameState.turn = turn;
    gameState.turnSeconds = 0;
  }
  


  abstract act(gameState: GameState): void;
}

const moveGems = (from: GemStash, to: GemStash, amount: GemStash) => {
  Object.keys(from).forEach(gemType => {
    from[gemType as Gem] -= amount[gemType as Gem];
    to[gemType as Gem] += amount[gemType as Gem];
  })
}

const moveGemsToPlayer = (from: GemStash, to: Player, amount: GemStash) => {
  moveGems(from, to.gems, amount);

  Object.keys(amount).forEach((gemType: string) => {
    if (amount[gemType as Gem] > 0) {
      for (let i = 0; i < amount[gemType as Gem]; i++) {
        to.gemOrder.push(gemType as Gem);
      }
    }
  });
  
}

const moveGemsFromPlayer = (from: Player, to: GemStash, amount: GemStash) => {
  moveGems(from.gems, to, amount);

  Object.keys(amount).forEach((gemType: string) => {
    if (amount[gemType as Gem] > 0) {
      for (let i = 0; i < amount[gemType as Gem]; i++) {
        from.gemOrder.splice(from.gemOrder.indexOf(gemType as Gem), 1);
      }
    }
  });
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
    gameState.nobles = gameState.nobles.slice(0, gameState.players.length+1);
    gameState.turn = 1;
    gameState.gameSeconds = 0;

    const gemAmount = gameState.players.length === 2 ? 4
                    : gameState.players.length === 3 ? 5
                    : 7;

    gameState.gems = {
      [Gem.Ruby]: gemAmount,
      [Gem.Sapphire]: gemAmount,
      [Gem.Diamond]: gemAmount,
      [Gem.Onyx]: gemAmount,
      [Gem.Emerald]: gemAmount,
      [Gem.Star]: 5
    }

    gameState.gameTimer = setInterval(() => {
      gameState.gameSeconds++;
    }, 1000);
  }
}

export class JoinGame extends BaseAction {
  joiningPlayer: Player;

  constructor(p: Player, meta: { joiningPlayer?: Player }) {
    super(p, meta)
    this.type = Action.JoinGame;
    this.joiningPlayer = meta.joiningPlayer ? meta.joiningPlayer : p;
    this.rules = [
      (g: Readonly<GameState>) => gameIsNotFull(g.players),
      (g: Readonly<GameState>) => gameHasNotStarted(g.started)
    ]
  }

  act(gameState: GameState) {
    gameState.addPlayer(this.joiningPlayer);
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
      (g: Readonly<GameState>) => tenGemsMax(Object.values(this.gems).reduce((a,b) => a+b), this.player),
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
    moveGemsToPlayer(gameState.gems, this.player, this.gems);   

    this.nextTurn(gameState);
  }
}

export class PurchaseCard extends BaseAction {
  cards: Card[];
  card: Card;
  index: number;

  constructor(p: Player, meta: { cards: Card[], index: number }) {
    super(p, meta);

    this.type = Action.PurchaseCard;
    this.index = meta.index;
    this.cards = [ ...meta.cards ]; // Copy array to drop the reference to the gameState object
    this.card = meta.cards[meta.index];

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
  
  getReservedCard(gameState: GameState) {
    return this.player.reservedCards.splice(this.index, 1)[0];
  }

  getBoardCard(gameState: GameState) {
    const boardCards = gameState.getTierCards(this.card.tier);

    return boardCards.cards.splice(this.index, 1)[0];
  }

  act(gameState: GameState) {
    const card = this.card.reserved ? this.getReservedCard(gameState) : this.getBoardCard(gameState);

    const cost = gatherGemsForPurchase(card.costs, this.player);

    moveGemsFromPlayer(this.player, gameState.gems, cost as GemStash);

    card.drawn = false;
    this.player.cards.cards.push(card);

    if (card.reserved) {
      card.reserved = false;
    } else {
      const cards = gameState.getTierCards(card.tier);
      const drawPile = gameState.getDrawPileCards(card.tier);
      
      drawCards(drawPile, cards, 1, this.index);
    }

    this.nextTurn(gameState);

    gameState.awardNobles(this.player);
  }
}

export class PassTurn extends BaseAction {
  constructor(p: Player, meta: { forPlayer?: Player }) {
    super(p, meta);

    this.type = Action.PassTurn;

    const forPlayer = meta.forPlayer ? meta.forPlayer : p;
    
    this.rules = [
      (g: Readonly<GameState>) => isPlayersTurn(forPlayer, g.players, g.turn)
    ]
  }

  act(gameState: GameState) {
    this.nextTurn(gameState);
  }
}

export class ReserveCard extends BaseAction {
  cards: Card[];
  card: Card
  index: number;

  constructor(p: Player, meta: { cards: Card[], index: number }) {
    super(p, meta);

    this.type = Action.ReserveCard;
    this.cards = [ ...meta.cards ]; // Copy array to drop the reference to the gameState object
    this.index = meta.index;
    this.card = meta.cards[meta.index];

    this.rules = [
      (g: Readonly<GameState>) => gameHasStarted(g.started),
      (g: Readonly<GameState>) => gameHasEnoughPlayers(g.players),
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.players, g.turn),
      (g: Readonly<GameState>) => canReserveCard(this.player)
    ];
  }

  act(gameState: GameState) {
    const boardCards = gameState.getTierCards(this.card.tier);

    const card = boardCards.cards.splice(this.index,1)[0];

    const gems = emptyGemStash();
    gems.star = 1;

    moveGemsToPlayer(gameState.gems, this.player, gems);

    card.reserved = true;
    card.drawn = false;

    this.player.reservedCards.push(card);
    this.nextTurn(gameState);

    const drawPile = gameState.getDrawPileCards(card.tier);

    drawCards(drawPile, boardCards, 1, this.index);
  }
}