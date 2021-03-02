import React from 'react';
import { BoardUI } from './Board';
import Game, { GameState, Player } from '../Game';
import { HudUI } from './Player';
import { Action } from '../Actions';

interface GameUIProps {}

interface GameUIState {
  gameState: GameState | null
  player: Player | null
}

const game = Game.getInstance();
const player = new Player('Andy', 1);

const defaultState = {
  gameState: null,
  player: player
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    game.onStateUpdate((gameState: GameState) => {
      this.setState({ gameState: gameState })
    })
    game.sendAction(player, Action.JoinGame, {});
  }

  render() {
    return (
      <>
        {this.state.gameState ?
          (
            <>
              <BoardUI gameState={this.state.gameState} />
              <HudUI cards={this.state.player!.cards} gems={this.state.player!.gems} />
            </>
          )
          : null
        }
      </>
    )
  }
}