import React from 'react';
import { BoardUI } from './Board';
import Game, { Player } from '../Game';
import { HudUI } from './Player';

interface GameUIProps {}

interface GameUIState {
  game: Game | null
  player: Player | null
}

const defaultState = {
  game: null,
  player: null
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
  constructor(props: any) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount() {
    const game = new Game();

    const player = new Player('Andy', 1);

    this.setState({
      game: game,
      player: player
    })
  }

  render() {
    return (
      <>
        {this.state.game ?
          (
            <>
              <BoardUI gameState={this.state.game!.gameState} />
              <HudUI cards={this.state.player!.cards} gems={this.state.player!.gems} />
            </>
          )
          : null
        }
      </>
    )
  }
}