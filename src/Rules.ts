import { GameState, Player, PlayerTurn, GemStash, Gem } from './Game';

export interface Result {
  passed: boolean;
  message: string;
}

interface Conditions {}

export type Rule = (gameState: Readonly<GameState>) => Result

export const isPlayersTurn = (player: Player, turn: PlayerTurn): Result => {
  return {
    passed: player.position === turn,
    message: 'Players can only act when it is their turn.'
  }
}

export const gameIsFull = (players: Player[]): Result => {
  const PLAYER_LIMIT = 4;

  return {
    passed: players.length < PLAYER_LIMIT,
    message: 'This game is full.'
  }
}

export const hasEnoughGems = (desired: GemStash, from: GemStash): Result => {
  const overdrawn = Object.keys(desired).filter(gemType => desired[gemType as Gem] > from[gemType as Gem]).length;

  return {
    passed: overdrawn > 0,
    message: 'Not enough gems to complete this action.'
  }
}

export class RuleSet {
  readonly gameState: GameState

  constructor(gameState: Readonly<GameState>) {
    this.gameState = gameState;
  }
}
