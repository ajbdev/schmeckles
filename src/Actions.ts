import Game, { GameState, Player, GemStash, Card, Gem } from './Game';
import { Rule, isPlayersTurn, Result, hasEnoughGems, gameIsFull } from './Rules';

export enum Action {
  JoinGame = 'join_game',
//  ExitGame = 1,
  TakeGems = 'take_gems',
//  ReserveCard = 3,
//  PurchaseCard = 4,
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
      [Action.TakeGems]: TakeGems
    }

    const ActionToBePerformed = actionFactoryMap[t];

    return new ActionToBePerformed(p, {...meta})
  }

  checkRules(gameState: Readonly<GameState>): boolean {
    this.rules.map(r => {
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

export class JoinGame extends BaseAction {
  constructor(p: Player) {
    super(p)
    this.type = Action.JoinGame;
    this.rules = [
      (g: Readonly<GameState>) => gameIsFull(g.players)
    ]
  }

  act(gameState: GameState) {
    gameState.players.push(this.player);
  }
}

export class TakeGems extends BaseAction {
  gems: GemStash;
  
  constructor(p: Player, gems: GemStash) {
    super(p);

    this.type = Action.TakeGems;
    this.gems = gems;
    this.rules = [
      (g: Readonly<GameState>) => isPlayersTurn(this.player, g.turn),
      (g: Readonly<GameState>) => hasEnoughGems(this.gems, g.gems)
    ];
  }

  act(gameState: GameState) {
    Object.keys(this.gems).map(gemType => {
      gameState.gems[gemType as Gem] -= this.gems[gemType as Gem];
      this.player.gems[gemType as Gem] += this.gems[gemType as Gem];
    })
  }
}

