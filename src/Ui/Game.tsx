import React from 'react';
import { BoardUI } from './Board';
import { GameState } from '../Game';

interface GameUIProps {}

interface GameUIState {
  gameState: GameState | null
}

const defaultState = {
  gameState: null
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    const game = new GameState();

    this.setState({
      gameState: game
    })
  }

  render() {
    return (
      <>
        {this.state.gameState ?
          <BoardUI gameState={this.state.gameState} />
          : null
        }
      </>
    )
  }
}