import { GameState, PlayerTurn, GemStash, Gem, Card } from './Game';
import { Player } from './Player';

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

export const gameHasEnoughPlayers = (players: Player[]): Result => {
  return {
    passed: players.length > 1,
    message: 'There must be at least two players to start'
  }
}

export const gameHasNotStarted = (started: boolean): Result => {
  return {
    passed: !started,
    message: 'Game has already started.'
  }
}

export const gameHasStarted = (started: boolean): Result => {
  return {
    passed: started,
    message: 'Game must be started first.'
  }
}

export const isPlayersTurn = (player: Player, players: Player[], turn: PlayerTurn): Result => {
  return {
    passed: (players.findIndex((p) => p.id === player.id)+1) === turn,
    message: 'Players can only act when it is their turn.'
  }
}

export const gameIsNotFull = (players: Player[]): Result => {
  const PLAYER_LIMIT = 4;

  return {
    passed: players.length < PLAYER_LIMIT,
    message: 'This game is full.'
  }
}

export const canAffordCard = (card: Card, player: Player): Result => {
  const overdrawn = Object.keys(card.costs).filter(gemType => card.costs[gemType as Gem] > (player.gems[gemType as Gem]+player.cards.cards.filter(c => c.gem === gemType as Gem).length)).length;

  return {
    passed: overdrawn === 0,
    message: 'Not enough gems to purchase this card.'
  }
}


export const gemsAreOfSameType = (desired: GemStash): Result => {
  return {
    passed: Object.values(desired).filter(v => v > 0).length === 1,
    message: 'Gems must be of the same type when taking two gems.'
  }
}

export const canTakeTwoGems = (gem: Gem, bank: GemStash): Result => {
  return {
    passed: bank[gem] >= 4,
    message: 'There must be at least four gems of the desired type in the bank to take two gems.'
  }
}

export const canTakeThreeGems = (desired: GemStash): Result => {
  return {
    passed: Object.keys(desired).filter(g => desired[g as Gem] > 1).length === 0,
    message: 'Gems must be of different types to take three gems.'
  }
}

export const isValidGems = (desired: GemStash): Result => {
  return {
    passed: desired.star === 0,
    message: 'Only valid gems can be selected.'
  }
}

export const canReserveCard = (player: Player): Result => {
  return {
    passed: player.reservedCards.length < 3,
    message: 'A maximum of three cards may be reserved.'
  }
}

export const isTakingTwoOrThreeGems = (totalGems:number): Result => {
  return {
    passed: totalGems >= 2 && totalGems <= 3,
    message: 'Only two or three gems can be taken per turn.'
  }
}

export const bankHasEnoughGems = (desired: GemStash, from: GemStash): Result => {
  const overdrawn = Object.keys(desired).filter(gemType => desired[gemType as Gem] > from[gemType as Gem]).length;

  return {
    passed: overdrawn === 0,
    message: 'Not enough gems in the bank to complete this action.'
  }
}
