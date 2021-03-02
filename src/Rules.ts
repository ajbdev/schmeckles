import { GameState, Player, PlayerTurn, GemStash, Gem, Card } from './Game';

export interface Result {
  passed: boolean;
  message: string;
}

export type Rule = (gameState: Readonly<GameState>) => Result

export const playerHasJoinedGame = (player: Player, players: Player[]): Result => {
  return {
    passed: players.filter(p => p.id === player.id).length > 0,
    message: 'Player has not joined game'
  }
}

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

export const canAffordCard = (card: Card, gems: GemStash): Result => {
  const overdrawn = Object.keys(card.costs).filter(gemType => card.costs[gemType as Gem] >= gems[gemType as Gem]).length;

  return {
    passed: overdrawn === 0,
    message: 'Not enough gems to purchase this card.'
  }
}

export const bankHasEnoughGems = (desired: GemStash, from: GemStash): Result => {
  const overdrawn = Object.keys(desired).filter(gemType => desired[gemType as Gem] > from[gemType as Gem]).length;

  return {
    passed: overdrawn === 0,
    message: 'Not enough gems in the bank to complete this action.'
  }
}
