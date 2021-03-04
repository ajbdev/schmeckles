import { GameState, Player, GemStash, Gem, Card, Tier } from './Game';
import { Rule, isPlayersTurn, Result, gameIsFull, canAffordCard, bankHasEnoughGems, isTakingTwoOrThreeGems, canTakeThreeGems, gemsAreOfSameType, canTakeTwoGems, canReserveCard } from './Rules';

export enum Action {
  JoinGame = 'JoinGame',
//  ExitGame = 1,
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
  failedRules: Result[]

  constructor(p: Player) {
    this.player = p;
    this.rules = [];
    this.failedRules = [];
  }

  static create(p: Player, t: Action, meta: any) {
    const actionFactoryMap = {
      [Action.JoinGame]: JoinGame,
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

  abstract act(gameState: GameState): void;
}

const moveGems = (from: GemStash, to: GemStash, amount: GemStash) => {
  Object.keys(from).forEach(gemType => {
    from[gemType as Gem] -= amount[gemType as Gem];
    to[gemType as Gem] += amount[gemType as Gem];
  })
}

export class JoinGame extends BaseAction {
  isContextPlayer: boolean;
  constructor(p: Player, meta: { isContextPlayer: boolean }) {
    super(p)
    this.type = Action.JoinGame;
    this.isContextPlayer = meta.isContextPlayer;
    this.rules = [
      (g: Readonly<GameState>) => gameIsFull(g.players)
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
    super(p);

    this.type = Action.TakeGems;
    this.gems = meta.gems;
    this.rules = [
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.turn),
      (g: Readonly<GameState>) => bankHasEnoughGems(this.gems, g.gems),
      (g: Readonly<GameState>) => {
        const totalGems = Object.values(this.gems).reduce((a,b) => a+b);

        if (totalGems === 2) {
          const result1 = gemsAreOfSameType(this.gems);

          if (!result1.passed) {
            return result1;
          }

          const gem = Object.keys(this.gems).filter(g => this.gems[g as Gem] == 2)[0]

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
  }
}

export class PurchaseCard extends BaseAction {
  tier: Tier;
  index: number;

  constructor(p: Player, meta: { tier: Tier, index: number }) {
    super(p);

    this.type = Action.PurchaseCard;
    this.tier = meta.tier;
    this.index = meta.index;

    this.rules = [
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.turn),
      (g: Readonly<GameState>) => { 
        const card = g.getCardPileByTier(this.tier)!.cards[this.index];

        return canAffordCard(card, this.player);
      }
    ]
  }

  act(gameState: GameState) {
    const card = gameState.getCardPileByTier(this.tier)!.cards.splice(this.index,1)[0];

    moveGems(this.player.gems, gameState.gems, card.costs);

    this.player.cards.cards.push(card);
  }
}

export class ReserveCard extends BaseAction {
  tier: Tier;
  index: number;
  constructor(p: Player, meta: { tier: Tier, index: number }) {
    super(p);

    this.type = Action.ReserveCard;
    this.tier = meta.tier;
    this.index = meta.index;

    this.rules = [
      (g: Readonly<GameState>) => canReserveCard(this.player)
    ];
  }

  act(gameState: GameState) {
    const card = gameState.getCardPileByTier(this.tier)!.cards.splice(this.index,1)[0];

    this.player.reservedCards.cards.push(card);
  }
}